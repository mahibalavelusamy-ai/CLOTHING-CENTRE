import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ClothingItem, Size } from '../../types';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Info,
  AudioWaveform,
  MessageSquare,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface StockCommand {
  action: 'set' | 'add' | 'subtract' | 'restock_all';
  itemId?: string;
  itemName?: string;
  size?: Size | 'all';
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  clarification?: string;
}

interface ParsedResult {
  commands: StockCommand[];
  rawText: string;
  summary: string;
}

interface LogEntry {
  id: string;
  type: 'voice' | 'ai' | 'success' | 'error' | 'info';
  message: string;
  timestamp: string;
  detail?: string;
}

interface VoiceStockAssistantProps {
  inventory: ClothingItem[];
  onUpdateItemStock: (itemId: string, size: Size, newStock: number) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function speak(text: string, enabled: boolean) {
  if (!enabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1.0;
  utterance.lang = 'en-IN';
  // Prefer an Indian English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.lang === 'en-IN') ||
    voices.find((v) => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

function nowString() {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
}

const EXAMPLE_COMMANDS = [
  'Restock 20 units of Kanjivaram Saree',
  'Set size M of Floral Rayon Kurti to 15',
  'Add 10 units to all sizes of Cotton Kurti',
  'Subtract 5 from XL of Anarkali Gown',
  'Set Banarasi Saree to 8 units',
  'Add 25 to bq-009',
];

// ─── Gemini Parser ───────────────────────────────────────────────────────────

async function parseStockCommandWithGemini(
  userText: string,
  inventory: ClothingItem[]
): Promise<ParsedResult> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

  const catalogSummary = inventory
    .slice(0, 40)
    .map(
      (item) =>
        `ID: ${item.id} | Name: "${item.name}" | Dept: ${item.department} | ` +
        `Sizes: [${item.sizes.map((s) => `${s.size}(stock:${s.stock})`).join(', ')}]`
    )
    .join('\n');

  const systemPrompt = `You are an inventory management assistant for Yaazh Boutique, an Indian boutique in Oddanchatram, Tamil Nadu.
The staff member will speak a voice command in English (or Tamil-influenced English) to modify garment stock levels.

Current Inventory Catalog:
${catalogSummary}

Parse the staff's command and return a JSON object in EXACTLY this format:
{
  "commands": [
    {
      "action": "set" | "add" | "subtract" | "restock_all",
      "itemId": "<exact item id from catalog or null if unclear>",
      "itemName": "<best matching item name>",
      "size": "<exact size like S, M, L, XL, Free Size, 32, 2-3Y, etc. or 'all' for all sizes>",
      "quantity": <positive integer>,
      "confidence": "high" | "medium" | "low",
      "clarification": "<optional note if ambiguous>"
    }
  ],
  "rawText": "${userText}",
  "summary": "<one sentence human-readable summary of what will be done>"
}

Rules:
- "set" = set stock to exactly that number
- "add" = add to current stock
- "subtract" = reduce from current stock
- "restock_all" = add to all sizes of that item
- Match item names fuzzily (abbreviations, partial names, Tamil pronunciation are acceptable)
- If size is not mentioned, use "all" for restock commands, or "Free Size" if item has only Free Size
- quantity must be positive
- confidence "high" = very clear command, "medium" = mostly clear, "low" = guessed
- Return valid JSON only, no markdown fences`;

  const model = ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: `Staff voice command: "${userText}"` }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const response = await model;
  const rawJson = response.text?.trim() || '{}';

  try {
    // Strip markdown fences if present
    const cleaned = rawJson.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as ParsedResult;
    return parsed;
  } catch {
    return {
      commands: [],
      rawText: userText,
      summary: 'Could not parse your command. Please try again.',
    };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const VoiceStockAssistant: React.FC<VoiceStockAssistantProps> = ({
  inventory,
  onUpdateItemStock,
  isOpen,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [browserSupport, setBrowserSupport] = useState<'supported' | 'unsupported' | 'checking'>('checking');
  const [activeExample, setActiveExample] = useState<number | null>(null);

  const recognitionRef = useRef<unknown>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ── Check browser support ────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setBrowserSupport(SpeechRec ? 'supported' : 'unsupported');
  }, []);

  // ── Auto-scroll log ──────────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any)?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLog((prev) => [
      ...prev,
      { ...entry, id: `${Date.now()}-${Math.random()}`, timestamp: nowString() },
    ]);
  }, []);

  // ── Start Listening ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      addLog({ type: 'error', message: 'Speech recognition is not supported in this browser.' });
      return;
    }

    window.speechSynthesis?.cancel();
    setTranscript('');
    setInterimTranscript('');
    setParsedResult(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      addLog({ type: 'info', message: '🎙️ Listening... Speak your stock command clearly.' });
      speak('Ready. Please say your stock command.', ttsEnabled);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => (prev + ' ' + final).trim());
      setInterimTranscript(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsListening(false);
      const errMsg =
        event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : event.error === 'audio-capture'
          ? 'Microphone not accessible. Please allow microphone permissions.'
          : event.error === 'not-allowed'
          ? 'Microphone permission was denied.'
          : `Speech error: ${event.error}`;
      addLog({ type: 'error', message: errMsg });
      speak(errMsg, ttsEnabled);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [addLog, ttsEnabled]);

  // ── Stop Listening ───────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop();
    setIsListening(false);
  }, []);

  // ── Process with AI ──────────────────────────────────────────────────────
  const processTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        addLog({ type: 'error', message: 'No voice command captured. Please try again.' });
        return;
      }

      setIsProcessing(true);
      addLog({ type: 'voice', message: `You said: "${text}"` });

      try {
        speak('Analysing your command...', ttsEnabled);
        const result = await parseStockCommandWithGemini(text, inventory);
        setParsedResult(result);

        if (result.commands.length === 0) {
          addLog({
            type: 'error',
            message: 'Could not understand the command.',
            detail: result.summary,
          });
          speak('Sorry, I could not understand that command. Please try again.', ttsEnabled);
        } else {
          addLog({
            type: 'ai',
            message: `AI understood: ${result.summary}`,
            detail: `${result.commands.length} action(s) ready to execute`,
          });
          speak(result.summary, ttsEnabled);
        }
      } catch (err) {
        addLog({
          type: 'error',
          message: 'AI processing failed. Please check your connection.',
          detail: err instanceof Error ? err.message : String(err),
        });
        speak('AI processing failed. Please try again.', ttsEnabled);
      } finally {
        setIsProcessing(false);
      }
    },
    [addLog, inventory, ttsEnabled]
  );

  // ── Execute Commands ─────────────────────────────────────────────────────
  const executeCommands = useCallback(async () => {
    if (!parsedResult || parsedResult.commands.length === 0) return;

    setIsExecuting(true);
    let successCount = 0;
    let failCount = 0;

    for (const cmd of parsedResult.commands) {
      const item = inventory.find(
        (i) => i.id === cmd.itemId || i.name.toLowerCase().includes((cmd.itemName || '').toLowerCase())
      );

      if (!item) {
        addLog({ type: 'error', message: `Item not found: "${cmd.itemName || cmd.itemId}"` });
        failCount++;
        continue;
      }

      const sizesToUpdate: Size[] =
        cmd.size === 'all' || cmd.action === 'restock_all'
          ? item.sizes.map((s) => s.size)
          : [cmd.size as Size];

      for (const size of sizesToUpdate) {
        const sizeEntry = item.sizes.find((s) => s.size === size);
        const currentStock = sizeEntry?.stock ?? 0;

        let newStock: number;
        if (cmd.action === 'set') {
          newStock = cmd.quantity;
        } else if (cmd.action === 'add' || cmd.action === 'restock_all') {
          newStock = currentStock + cmd.quantity;
        } else if (cmd.action === 'subtract') {
          newStock = Math.max(0, currentStock - cmd.quantity);
        } else {
          newStock = cmd.quantity;
        }

        try {
          await onUpdateItemStock(item.id, size, newStock);
          addLog({
            type: 'success',
            message: `✅ ${item.name} · Size ${size}: ${currentStock} → ${newStock}`,
          });
          successCount++;
        } catch (err) {
          addLog({
            type: 'error',
            message: `Failed to update ${item.name} (${size})`,
            detail: err instanceof Error ? err.message : String(err),
          });
          failCount++;
        }
      }
    }

    const resultMsg =
      failCount === 0
        ? `Stock updated successfully for ${successCount} size${successCount !== 1 ? 's' : ''}.`
        : `${successCount} updated, ${failCount} failed.`;

    addLog({
      type: failCount === 0 ? 'success' : 'error',
      message: resultMsg,
    });
    speak(resultMsg, ttsEnabled);
    setParsedResult(null);
    setTranscript('');
    setIsExecuting(false);
  }, [addLog, inventory, onUpdateItemStock, parsedResult, ttsEnabled]);

  // ── Use example command ──────────────────────────────────────────────────
  const useExample = useCallback(
    async (example: string, idx: number) => {
      setActiveExample(idx);
      setTranscript(example);
      setParsedResult(null);
      setTimeout(() => setActiveExample(null), 1500);
      await processTranscript(example);
    },
    [processTranscript]
  );

  if (!isOpen) return null;

  const logTypeStyle: Record<LogEntry['type'], string> = {
    voice: 'text-blue-700 bg-blue-50 border-blue-200',
    ai: 'text-purple-700 bg-purple-50 border-purple-200',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    error: 'text-rose-700 bg-rose-50 border-rose-200',
    info: 'text-stone-600 bg-stone-50 border-stone-200',
  };

  const logTypeIcon: Record<LogEntry['type'], React.ReactNode> = {
    voice: <Mic className="w-3 h-3" />,
    ai: <Sparkles className="w-3 h-3" />,
    success: <CheckCircle2 className="w-3 h-3" />,
    error: <AlertTriangle className="w-3 h-3" />,
    info: <Info className="w-3 h-3" />,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#111113] to-[#1a1a22] text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6D1A33] to-[#451020] border border-[#C9A45C]/40 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Voice Stock Assistant</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Speak naturally to update inventory · Powered by Gemini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => setTtsEnabled((v) => !v)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                ttsEnabled
                  ? 'text-[#C9A45C] bg-[#C9A45C]/10 hover:bg-[#C9A45C]/20'
                  : 'text-stone-500 bg-white/[0.06] hover:bg-white/10'
              }`}
              title={ttsEnabled ? 'Mute voice responses' : 'Enable voice responses'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser unsupported warning */}
        {browserSupport === 'unsupported' && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Your browser does not support Web Speech API. Please use Google Chrome or Microsoft Edge for voice input.
              You can still type commands in the text box below.
            </p>
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Microphone area */}
          <div className="bg-gradient-to-br from-stone-950 to-[#111113] rounded-2xl p-5 text-center space-y-4">
            {/* Mic button */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <>
                  <span className="absolute w-24 h-24 rounded-full bg-rose-600/20 animate-ping" />
                  <span className="absolute w-20 h-20 rounded-full bg-rose-600/25 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isExecuting || browserSupport === 'unsupported'}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 scale-105 shadow-rose-600/40'
                    : 'bg-[#6D1A33] hover:bg-[#7e1f3c] shadow-[#6D1A33]/40 hover:scale-105'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice command'}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>
            </div>

            {/* Status text */}
            <div className="text-xs text-stone-400">
              {isListening ? (
                <span className="text-rose-400 font-semibold animate-pulse">
                  🔴 Listening — speak your command now...
                </span>
              ) : isProcessing ? (
                <span className="text-purple-400 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Gemini AI is analysing your command...
                </span>
              ) : isExecuting ? (
                <span className="text-amber-400 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating stock in Firestore...
                </span>
              ) : (
                <span>Tap the mic and say your stock command</span>
              )}
            </div>

            {/* Live transcript display */}
            {(transcript || interimTranscript) && (
              <div className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-left">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-3 h-3 text-stone-500" />
                  <span className="text-[10px] text-stone-500 uppercase font-semibold tracking-wider">
                    Captured Command
                  </span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-stone-400 italic"> {interimTranscript}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Type command fallback */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              Or type your command
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => { setTranscript(e.target.value); setParsedResult(null); }}
                placeholder="e.g. Set Kanjivaram saree to 20 units"
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#6D1A33] text-stone-900 placeholder-stone-400"
                onKeyDown={(e) => { if (e.key === 'Enter' && transcript.trim()) processTranscript(transcript); }}
              />
              <button
                type="button"
                onClick={() => processTranscript(transcript)}
                disabled={!transcript.trim() || isProcessing || isExecuting}
                className="px-3.5 py-2 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AI Result Preview */}
          {parsedResult && parsedResult.commands.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-purple-800">AI Interpretation</span>
                  <p className="text-xs text-purple-600 mt-0.5">{parsedResult.summary}</p>
                </div>
              </div>

              <div className="space-y-2">
                {parsedResult.commands.map((cmd, i) => {
                  const item = inventory.find(
                    (it) => it.id === cmd.itemId || it.name.toLowerCase().includes((cmd.itemName || '').toLowerCase())
                  );
                  return (
                    <div key={i} className="bg-white border border-purple-200 rounded-xl px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-stone-800 truncate">{item?.name || cmd.itemName || cmd.itemId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          cmd.confidence === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : cmd.confidence === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {cmd.confidence}
                        </span>
                      </div>
                      <p className="text-stone-500 mt-1">
                        <span className="font-mono text-stone-700">{cmd.action.toUpperCase()}</span>
                        {cmd.size && cmd.size !== 'all' && <span> · Size: <strong>{cmd.size}</strong></span>}
                        {cmd.size === 'all' && <span> · All Sizes</span>}
                        <span className="ml-1">→ <strong className="text-[#6D1A33]">{cmd.quantity} units</strong></span>
                      </p>
                      {cmd.clarification && (
                        <p className="text-amber-600 text-[10px] mt-1 italic">{cmd.clarification}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setParsedResult(null); setTranscript(''); }}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeCommands}
                  disabled={isExecuting}
                  className="flex-1 py-2 rounded-xl bg-[#6D1A33] hover:bg-[#561428] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 shadow-md shadow-[#6D1A33]/30"
                >
                  {isExecuting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Updating...</span></>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /><span>Apply Stock Update</span></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Example Commands */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Try these example commands
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {EXAMPLE_COMMANDS.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => useExample(example, idx)}
                  disabled={isProcessing || isExecuting || isListening}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeExample === idx
                      ? 'border-purple-300 bg-purple-50 text-purple-800'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-[#6D1A33]/40 hover:bg-[#F3E8EB]/50 hover:text-[#6D1A33]'
                  }`}
                >
                  <span className="text-stone-400 mr-1.5">▸</span>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          {log.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <AudioWaveform className="w-3 h-3" />
                  Session Activity Log
                </span>
                <button
                  type="button"
                  onClick={() => setLog([])}
                  className="text-[10px] text-stone-400 hover:text-rose-500 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className={`px-3 py-2 rounded-xl border text-[11px] flex items-start gap-2 ${logTypeStyle[entry.type]}`}
                  >
                    <span className="mt-0.5 shrink-0">{logTypeIcon[entry.type]}</span>
                    <div className="min-w-0">
                      <span className="font-semibold">{entry.message}</span>
                      {entry.detail && (
                        <p className="opacity-70 text-[10px] mt-0.5">{entry.detail}</p>
                      )}
                    </div>
                    <span className="ml-auto text-[10px] opacity-60 font-mono shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 shrink-0">
          <p className="text-[10px] text-stone-400 text-center leading-relaxed">
            💡 Tip: Say "Restock 20 units of [item]", "Set size M to 15", or "Add 10 to all sizes of [item]"
          </p>
        </div>
      </div>
    </>
  );
};

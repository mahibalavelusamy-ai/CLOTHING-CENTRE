/**
 * Dynamic loader for Razorpay Checkout script (checkout.js).
 * Avoids render-blocking script tags while ensuring checkout SDK is ready.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  recomputedTotal?: number;
  orderId?: string;
  error?: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Delivery and coupon constants (consistent with boutique rules)
const FREE_DELIVERY_THRESHOLD = 1999;
const STANDARD_DELIVERY_FEE = 99;
const GST_PERCENT = 0.05;

const COUPONS = {
  YAAZH10: { percent: 10, minOrder: 1500 },
  FESTIVE25: { percent: 25, minOrder: 3500 },
  WELCOME10: { percent: 10, minOrder: 999 }
};

// Fallback pricing for local dev catalog if firestore is not seeded yet
const CATALOG_FALLBACK_PRICES = {
  'yb-saree-01': 4850,
  'yb-saree-02': 3650,
  'yb-saree-03': 1850,
  'yb-saree-04': 7200,
  'yb-saree-05': 2450,
  'yb-salwar-01': 2850,
  'yb-salwar-02': 2150,
  'yb-salwar-03': 4450,
  'yb-salwar-04': 1950,
  'yb-lehenga-01': 9850,
  'yb-lehenga-02': 6450,
  'yb-mens-01': 3250,
  'yb-mens-02': 1450,
  'yb-mens-03': 1250,
  'yb-kids-01': 2450,
  'yb-kids-02': 1650,
  'yb-dcr-brass-01': 1450,
  'yb-dcr-pichwai-02': 990
};

// Initialize Firebase Admin
const appletConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let appletConfig = {};
if (fs.existsSync(appletConfigPath)) {
  try {
    appletConfig = JSON.parse(fs.readFileSync(appletConfigPath, 'utf8'));
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err.message);
  }
}

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || appletConfig.projectId || 'silent-ceiling-4n50x';
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || '(default)';

let adminApp;
if (getApps().length === 0) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(sa);
    } catch (err) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    try {
      const sa = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
      credential = cert(sa);
    } catch (err) {
      console.warn('Failed to read FIREBASE_SERVICE_ACCOUNT_PATH:', err.message);
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    credential = cert({
      projectId: PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  }

  const appOptions = {
    projectId: PROJECT_ID
  };
  if (credential) {
    appOptions.credential = credential;
  }

  adminApp = initializeApp(appOptions);
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp, DATABASE_ID);

/**
 * Returns a configured Razorpay instance or null if credentials are missing
 */
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
}

/**
 * Helper to fetch legitimate garment price from Firestore (never trust client total)
 */
async function fetchGarmentPrice(itemId) {
  try {
    const docRef = db.collection('clothing_items').doc(itemId);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      if (typeof data.price === 'number' && data.price >= 0) {
        return data.price;
      }
    }
  } catch (err) {
    console.warn(`Firestore price lookup failed for item ${itemId}: ${err.message}. Using fallback catalog.`);
  }

  if (CATALOG_FALLBACK_PRICES[itemId] !== undefined) {
    return CATALOG_FALLBACK_PRICES[itemId];
  }

  return null;
}

/**
 * POST /api/payments/create-order
 * Reads cart items from request, recomputes amount strictly on the server from Firestore,
 * and creates a Razorpay order.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { items, deliveryType, couponCode, customer, orderId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid items list provided.' });
    }

    // 1. Recompute subtotal from authoritative Firestore prices
    let subtotal = 0;
    for (const item of items) {
      const itemId = item.itemId || item.item?.id || item.id;
      const quantity = Number(item.quantity) || 1;

      if (!itemId || quantity <= 0) {
        return res.status(400).json({ error: `Invalid cart item: ${JSON.stringify(item)}` });
      }

      const unitPrice = await fetchGarmentPrice(itemId);
      if (unitPrice === null) {
        return res.status(400).json({ error: `Garment with ID "${itemId}" not found in catalogue.` });
      }

      subtotal += unitPrice * quantity;
    }

    // 2. Validate and compute coupon discount
    let discountAmount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const couponRule = COUPONS[cleanCoupon];
      if (couponRule && subtotal >= couponRule.minOrder) {
        discountAmount = Math.round(subtotal * (couponRule.percent / 100));
      }
    }

    // 3. Compute delivery fee
    const deliveryFee = deliveryType === 'home_delivery'
      ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE)
      : 0;

    // 4. Compute 5% GST on taxable amount
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * GST_PERCENT;

    // 5. Compute authoritative grand total
    const totalAmount = taxableAmount + deliveryFee + tax;
    const amountInPaise = Math.round(totalAmount * 100);

    // 6. Check Razorpay credentials
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({
        error: 'Razorpay keys not configured on server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.'
      });
    }

    // 7. Create Razorpay Order
    const receiptId = (orderId || `OB-${crypto.randomUUID().slice(0, 8)}`).slice(0, 40);
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        orderId: orderId || '',
        customerName: customer?.name || '',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || ''
      }
    });

    // 8. If orderId was passed and order exists in Firestore, record the razorpayOrderId
    if (orderId) {
      try {
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          await orderRef.update({
            razorpayOrderId: rzpOrder.id,
            totalAmount: totalAmount,
            subtotal,
            tax,
            deliveryFee,
            discountApplied: discountAmount
          });
        }
      } catch (err) {
        console.warn('Could not attach razorpayOrderId to Firestore order:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      recomputedTotal: totalAmount,
      orderId: orderId || receiptId
    });
  } catch (error) {
    console.error('Error in /api/payments/create-order:', error);
    return res.status(500).json({ error: error.message || 'Failed to create payment order.' });
  }
});

/**
 * POST /api/payments/verify
 * Validates HMAC-SHA256 signature using RAZORPAY_KEY_SECRET,
 * then marks the order paid using the Admin SDK.
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification credentials.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is not configured on the server.' });
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('Payment signature mismatch:', { expectedSignature, razorpay_signature });
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
    }

    // Server-side status update using Admin SDK (customers can never do this from browser)
    if (orderId) {
      try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.update({
          paymentStatus: 'paid',
          paymentMethod: 'online',
          paymentReference: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Failed to update order ${orderId} in Firestore:`, err);
        return res.status(500).json({
          error: `Payment verified but failed to update order database: ${err.message}`
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Order marked as paid.',
      orderId,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Error in /api/payments/verify:', error);
    return res.status(500).json({ error: error.message || 'Payment verification failed.' });
  }
});

/**
 * POST /api/payments/webhook
 * Handles Razorpay webhooks (e.g., payment.captured) with HMAC signature verification.
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: 'Missing webhook signature or server secret not configured.' });
    }

    const rawPayload = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Webhook signature mismatch.');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    console.log(`Razorpay webhook received: ${event?.event}`);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;
      const orderId = paymentEntity?.notes?.orderId;

      if (orderId) {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.update({
          paymentStatus: 'paid',
          paymentMethod: 'online',
          paymentReference: razorpayPaymentId,
          razorpayPaymentId: razorpayPaymentId,
          paidAt: new Date().toISOString()
        });
        console.log(`Order ${orderId} marked as paid via webhook.`);
      } else if (razorpayOrderId) {
        const snapshot = await db.collection('orders')
          .where('razorpayOrderId', '==', razorpayOrderId)
          .get();

        const updates = [];
        snapshot.forEach((doc) => {
          updates.push(doc.ref.update({
            paymentStatus: 'paid',
            paymentMethod: 'online',
            paymentReference: razorpayPaymentId,
            razorpayPaymentId: razorpayPaymentId,
            paidAt: new Date().toISOString()
          }));
        });
        await Promise.all(updates);
        console.log(`Updated ${updates.length} orders for razorpayOrderId ${razorpayOrderId} via webhook.`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    return res.status(500).json({ error: error.message || 'Webhook processing failed.' });
  }
});

// App wrapper for mounting as middleware
const paymentsApp = express();
paymentsApp.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
paymentsApp.use(express.urlencoded({ extended: true }));
paymentsApp.use('/api/payments', router);
paymentsApp.use('/', router);

export { router, paymentsApp };
export default router;

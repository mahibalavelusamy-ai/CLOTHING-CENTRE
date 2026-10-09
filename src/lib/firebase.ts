import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  getDocs, 
  query,
  where,
  onSnapshot, 
  getDocFromServer,
  runTransaction 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClothingItem, CustomerOrder, Size, UserProfile, UserRole } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const BOOTSTRAPPED_ADMIN_EMAIL = 'mahibalavelusamy@gmail.com';

// Error Handling complying with firebase-skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
    return 'Incorrect email or password. Please verify your credentials.';
  }
  if (raw.includes('auth/user-not-found')) {
    return 'No account found with this email address.';
  }
  if (raw.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (raw.includes('auth/too-many-requests')) {
    return 'Too many failed attempts. Access has been temporarily paused. Please try again later or reset your password.';
  }
  if (raw.includes('auth/network-request-failed')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (raw.includes('auth/weak-password')) {
    return 'Password is too weak. Please choose at least 6 characters.';
  }
  if (raw.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (raw.includes('auth/user-disabled')) {
    return 'This user account has been disabled. Please contact boutique administration.';
  }
  if (raw.includes('auth/requires-recent-login')) {
    return 'This sensitive operation requires a recent sign-in. Please log in again.';
  }
  return parseFriendlyErrorMessage(error);
}

export function parseFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed && typeof parsed === 'object' && parsed.error) {
        return parseFriendlyErrorMessage(parsed.error);
      }
    } catch {
      return error;
    }
    return error;
  }
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && parsed.error) {
        return parseFriendlyErrorMessage(parsed.error);
      }
    } catch {
      // not JSON
    }
    const msg = error.message;
    if (msg.includes('auth/')) {
      return getAuthErrorMessage(error);
    }
    if (msg.includes('Insufficient stock')) return msg;
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      return 'Permission denied: You do not have permissions for this action. Please check your account role.';
    }
    if (msg.includes('unavailable') || msg.includes('offline')) {
      return 'Database connection is temporarily unavailable. Please verify your connection.';
    }
    return msg;
  }
  return String(error);
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline.');
    }
    return true;
  }
}

// Real-time Subscriptions
export function subscribeToClothingItems(
  onUpdate: (items: ClothingItem[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = 'clothing_items';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const items: ClothingItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as ClothingItem);
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export function subscribeToOrders(
  onUpdate: (orders: CustomerOrder[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = 'orders';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const orders: CustomerOrder[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as CustomerOrder);
      });
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export function subscribeToCustomerOrders(
  customerUid: string,
  onUpdate: (orders: CustomerOrder[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = 'orders';
  const q = query(collection(db, collectionPath), where('customerUid', '==', customerUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: CustomerOrder[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as CustomerOrder);
      });
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

// Real-time Database Operations - Garments / Products
export async function addOrUpdateClothingItemInFirestore(item: ClothingItem) {
  const path = `clothing_items/${item.id}`;
  try {
    await setDoc(doc(db, 'clothing_items', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClothingItemInFirestore(itemId: string) {
  const path = `clothing_items/${itemId}`;
  try {
    await deleteDoc(doc(db, 'clothing_items', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateGarmentStockInFirestore(
  itemId: string,
  updatedSizes: { size: Size; stock: number }[],
  newInStockTotal: number
) {
  const path = `clothing_items/${itemId}`;
  try {
    await updateDoc(doc(db, 'clothing_items', itemId), {
      sizes: updatedSizes,
      inStockTotal: newInStockTotal
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateGarmentPriceInFirestore(
  itemId: string, 
  newPrice: number,
  newOriginalPrice?: number
) {
  const path = `clothing_items/${itemId}`;
  try {
    const updatePayload: Record<string, any> = { price: newPrice };
    if (newOriginalPrice !== undefined) {
      updatePayload.originalPrice = newOriginalPrice;
      if (newOriginalPrice > newPrice) {
        updatePayload.discountPercent = Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100);
      }
    }
    await updateDoc(doc(db, 'clothing_items', itemId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Real-time Database Operations - Orders
export async function createOrderInFirestore(order: CustomerOrder) {
  const path = `orders/${order.id}`;
  const payload: CustomerOrder = {
    ...order,
    status: 'Confirmed',
    stockDeducted: false,
    paymentStatus: order.paymentStatus === 'verification_pending' ? 'verification_pending' : 'unpaid'
  };
  try {
    await setDoc(doc(db, 'orders', order.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function transitionOrderStatusInFirestore(
  orderId: string, 
  newStatus: CustomerOrder['status']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error(`Order #${orderId} does not exist in the database.`);
      }
      const order = orderSnap.data() as CustomerOrder;

      // Identify unique item IDs
      const itemIds = Array.from(new Set(order.items.map(item => item.item.id)));
      
      // CRITICAL Firestore requirement: All transaction reads must execute before any transaction writes
      const itemSnaps = await Promise.all(
        itemIds.map(id => transaction.get(doc(db, 'clothing_items', id)))
      );

      const itemsMap = new Map<string, ClothingItem>();
      itemSnaps.forEach((snap, idx) => {
        if (snap.exists()) {
          itemsMap.set(itemIds[idx], snap.data() as ClothingItem);
        }
      });

      const isDeducted = !!order.stockDeducted;
      let willDeduct = false;
      let willRestore = false;

      // Deduct stock only when staff first move an order out of its initial status ('Confirmed')
      if (!isDeducted && newStatus !== 'Confirmed' && newStatus !== 'Cancelled') {
        willDeduct = true;
      }
      // If order had its stock deducted, and now moves to 'Cancelled', restore the stock
      else if (isDeducted && newStatus === 'Cancelled') {
        willRestore = true;
      }

      if (willDeduct) {
        // Validate stock availability for each item and size before modifying anything
        for (const cartItem of order.items) {
          const clothingItem = itemsMap.get(cartItem.item.id);
          if (!clothingItem) {
            throw new Error(`Garment "${cartItem.item.name}" (ID: ${cartItem.item.id}) was not found in catalog.`);
          }
          const sizeEntry = clothingItem.sizes.find(s => s.size === cartItem.selectedSize);
          const availableStock = sizeEntry ? sizeEntry.stock : 0;
          if (availableStock < cartItem.quantity) {
            throw new Error(
              `Insufficient stock for "${clothingItem.name}" in size ${cartItem.selectedSize}. In stock: ${availableStock}, required: ${cartItem.quantity}.`
            );
          }
        }

        // Apply deduction to memory items
        for (const cartItem of order.items) {
          const clothingItem = itemsMap.get(cartItem.item.id)!;
          const sizeEntry = clothingItem.sizes.find(s => s.size === cartItem.selectedSize)!;
          sizeEntry.stock -= cartItem.quantity;
          clothingItem.inStockTotal = Math.max(0, clothingItem.inStockTotal - cartItem.quantity);
        }

        // Write updated items
        for (const [id, clothingItem] of itemsMap.entries()) {
          transaction.update(doc(db, 'clothing_items', id), {
            sizes: clothingItem.sizes,
            inStockTotal: clothingItem.inStockTotal
          });
        }

        // Update order status with stockDeducted: true
        transaction.update(orderRef, {
          status: newStatus,
          stockDeducted: true
        });
      } else if (willRestore) {
        // Restore stock to garments
        for (const cartItem of order.items) {
          const clothingItem = itemsMap.get(cartItem.item.id);
          if (clothingItem) {
            const sizeEntry = clothingItem.sizes.find(s => s.size === cartItem.selectedSize);
            if (sizeEntry) {
              sizeEntry.stock += cartItem.quantity;
            } else {
              clothingItem.sizes.push({ size: cartItem.selectedSize, stock: cartItem.quantity });
            }
            clothingItem.inStockTotal += cartItem.quantity;
          }
        }

        // Write updated items
        for (const [id, clothingItem] of itemsMap.entries()) {
          transaction.update(doc(db, 'clothing_items', id), {
            sizes: clothingItem.sizes,
            inStockTotal: clothingItem.inStockTotal
          });
        }

        // Update order status with stockDeducted: false
        transaction.update(orderRef, {
          status: newStatus,
          stockDeducted: false
        });
      } else {
        // Simple status update
        transaction.update(orderRef, {
          status: newStatus
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: CustomerOrder['status']) {
  return transitionOrderStatusInFirestore(orderId, status);
}

export async function updateOrderPaymentStatusInFirestore(
  orderId: string, 
  paymentStatus: CustomerOrder['paymentStatus']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      paymentStatus
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderInFirestore(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// User Profiles & RBAC Operations
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserRoleInFirestore(targetUid: string, newRole: UserRole): Promise<void> {
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), { role: newRole });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getAllUsersFromFirestore(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snapshot.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function sendVerificationEmailToUser(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

// Authentication Service Functions
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
};
export type { User };

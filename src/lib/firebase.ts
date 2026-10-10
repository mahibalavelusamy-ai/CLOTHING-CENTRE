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
  initializeFirestore,
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
  runTransaction 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClothingItem, CustomerOrder, Size, UserProfile, UserRole, AuthorizedStaff } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with long polling enabled to prevent 10s streaming timeouts in web/proxy environments
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
})();
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
    await getDoc(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline or reconnecting.');
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
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } else {
        console.warn(`Firestore subscription notice for ${collectionPath}:`, msg);
      }
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
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } else {
        console.warn(`Firestore subscription notice for ${collectionPath}:`, msg);
      }
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
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } else {
        console.warn(`Firestore subscription notice for ${collectionPath}:`, msg);
      }
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

// Authorized Staff & Role Whitelist Operations
export function subscribeToAuthorizedStaff(
  onUpdate: (staff: AuthorizedStaff[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = 'authorized_staff';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const staff: AuthorizedStaff[] = [];
      snapshot.forEach((d) => {
        staff.push({ id: d.id, ...d.data() } as AuthorizedStaff);
      });
      staff.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      onUpdate(staff);
    },
    (error) => {
      if (onError) onError(error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } else {
        console.warn(`Firestore subscription notice for ${collectionPath}:`, msg);
      }
    }
  );
}

export async function getAuthorizedStaffList(): Promise<AuthorizedStaff[]> {
  const path = 'authorized_staff';
  try {
    const snapshot = await getDocs(collection(db, path));
    const staff: AuthorizedStaff[] = [];
    snapshot.forEach((d) => {
      staff.push({ id: d.id, ...d.data() } as AuthorizedStaff);
    });
    staff.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    return staff;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAuthorizedStaffByEmail(email: string): Promise<AuthorizedStaff | null> {
  const path = 'authorized_staff';
  const cleanEmail = email.toLowerCase().trim();
  try {
    const q = query(collection(db, path), where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() } as AuthorizedStaff;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function isEmailAuthorizedStaff(email: string): Promise<{ authorized: boolean; role: UserRole }> {
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return { authorized: true, role: 'admin' };
  }
  try {
    const staffMember = await getAuthorizedStaffByEmail(cleanEmail);
    if (staffMember) {
      return { authorized: true, role: staffMember.role };
    }
    return { authorized: false, role: 'customer' };
  } catch (err) {
    console.warn('Error checking authorized staff list:', err);
    return { authorized: false, role: 'customer' };
  }
}

export async function addAuthorizedStaffMember(data: {
  email: string;
  role: 'staff' | 'admin';
  displayName?: string;
  notes?: string;
  addedBy: string;
}): Promise<AuthorizedStaff> {
  const cleanEmail = data.email.toLowerCase().trim();
  const path = 'authorized_staff';

  if (cleanEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('This email is the primary Super Administrator and is permanently protected.');
  }

  const existing = await getAuthorizedStaffByEmail(cleanEmail);
  if (existing) {
    throw new Error(`The email "${cleanEmail}" is already authorized as ${existing.role.toUpperCase()}.`);
  }

  try {
    const newDocRef = doc(collection(db, path));
    const newEntry: AuthorizedStaff = {
      id: newDocRef.id,
      email: cleanEmail,
      role: data.role,
      displayName: data.displayName?.trim() || cleanEmail.split('@')[0],
      notes: data.notes?.trim() || '',
      addedBy: data.addedBy,
      addedAt: new Date().toISOString()
    };
    await setDoc(newDocRef, newEntry);

    // If matching user exists in 'users', upgrade their role
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));
      usersSnap.forEach(async (uDoc) => {
        await updateDoc(doc(db, 'users', uDoc.id), { role: data.role });
      });
    } catch (userErr) {
      console.warn('Notice: Could not sync role to existing user record:', userErr);
    }

    return newEntry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAuthorizedStaffRole(
  staffId: string, 
  email: string, 
  newRole: 'staff' | 'admin'
): Promise<void> {
  const path = `authorized_staff/${staffId}`;
  const cleanEmail = email.toLowerCase().trim();

  if (cleanEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Cannot change the role of the primary Super Administrator.');
  }

  try {
    await updateDoc(doc(db, 'authorized_staff', staffId), { role: newRole });

    // Sync to users collection
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));
      usersSnap.forEach(async (uDoc) => {
        await updateDoc(doc(db, 'users', uDoc.id), { role: newRole });
      });
    } catch (userErr) {
      console.warn('Notice: Could not sync updated role to users record:', userErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeAuthorizedStaffMember(staffId: string, email: string): Promise<void> {
  const path = `authorized_staff/${staffId}`;
  const cleanEmail = email.toLowerCase().trim();

  if (cleanEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Cannot revoke access for the primary Super Administrator.');
  }

  try {
    await deleteDoc(doc(db, 'authorized_staff', staffId));

    // Revert user role in users collection to 'customer'
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));
      usersSnap.forEach(async (uDoc) => {
        await updateDoc(doc(db, 'users', uDoc.id), { role: 'customer' });
      });
    } catch (userErr) {
      console.warn('Notice: Could not revert user role:', userErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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

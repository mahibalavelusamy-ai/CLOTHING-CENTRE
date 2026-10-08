import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
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
  getDocFromServer 
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
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: CustomerOrder['status']) {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status
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

// Authentication Service Functions
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  onAuthStateChanged 
};
export type { User };

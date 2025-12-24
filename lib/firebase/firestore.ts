import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// TypeScript interfaces
export interface UserData {
  email: string;
  plan: 'free' | 'pro' | 'team';
  freeCredits: number;
  createdAt: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string; // ✅ 추가
}

export interface Conversion {
  id?: string;
  userId: string;
  imageUrl: string;
  code: string;
  createdAt: Date;
  isPublic: boolean;
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist:', userId);
      return null;
    }

    const data = userDoc.data();
    
    console.log('✅ User data found:', {
      userId,
      plan: data.plan,
      credits: data.freeCredits,
      subscriptionId: data.stripeSubscriptionId || 'none',
    });
    
    return {
      email: data.email,
      plan: data.plan || 'free',
      freeCredits: data.freeCredits ?? 5,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId, // ✅ 추가
    };
  } catch (error: any) {
    console.error('❌ Get user data error:', error);
    return null;
  }
}

/**
 * Use a credit (for free tier users)
 * Returns true if credit was used successfully, false if no credits remaining
 */
export async function useCredit(userId: string): Promise<boolean> {
  try {
    const userData = await getUserData(userId);
    
    if (!userData) {
      return false;
    }

    // Pro users have unlimited credits
    if (userData.plan === 'pro' || userData.plan === 'team') {
      return true;
    }

    // Free users must have credits
    if (userData.freeCredits <= 0) {
      return false;
    }

    // Decrement credit
    await updateDoc(doc(db, 'users', userId), {
      freeCredits: userData.freeCredits - 1,
    });

    return true;
  } catch (error: any) {
    console.error('Use credit error:', error);
    return false;
  }
}

/**
 * Save a conversion to Firestore
 * 수정: createdAt을 선택적 매개변수로 변경
 */
export async function saveConversion(
  userId: string,
  imageUrl: string,
  generatedCode: string,
  isPublic: boolean = false
): Promise<{ id: string | null; error: string | null }> {
  try {
    const conversionsRef = collection(db, 'conversions');
    
    const conversionDoc = await addDoc(conversionsRef, {
      userId,
      imageUrl,
      generatedCode,
      isPublic,
      createdAt: serverTimestamp(), // Firebase 서버 타임스탬프 사용
    });

    return { id: conversionDoc.id, error: null };
  } catch (error: any) {
    console.error('Save conversion error:', error);
    return { id: null, error: error.message };
  }
}

/**
 * Get user's conversion history
 */
export async function getUserConversions(
  userId: string,
  limitCount: number = 10
): Promise<Conversion[]> {
  try {
    const conversionsRef = collection(db, 'conversions');
    const q = query(
      conversionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        imageUrl: data.imageUrl,
        code: data.generatedCode,
        createdAt: data.createdAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      };
    });
  } catch (error: any) {
    console.error('Get user conversions error:', error);
    return [];
  }
}

/**
 * Get public conversions (for gallery)
 */
export async function getPublicConversions(
  limitCount: number = 20
): Promise<Conversion[]> {
  try {
    const conversionsRef = collection(db, 'conversions');
    const q = query(
      conversionsRef,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        imageUrl: data.imageUrl,
        code: data.generatedCode,
        createdAt: data.createdAt?.toDate() || new Date(),
        isPublic: data.isPublic,
      };
    });
  } catch (error: any) {
    console.error('Get public conversions error:', error);
    return [];
  }
}

/**
 * Upgrade user to Pro plan (called by Stripe webhook)
 */
export async function upgradeUserToPro(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      plan: 'pro',
      stripeCustomerId,
    };

    // Add subscription ID if provided
    if (stripeSubscriptionId) {
      updateData.stripeSubscriptionId = stripeSubscriptionId;
    }

    await updateDoc(doc(db, 'users', userId), updateData);

    console.log('✅ User upgraded to Pro:', {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
    });

    return true;
  } catch (error: any) {
    console.error('❌ Upgrade user to pro error:', error);
    return false;
  }
}
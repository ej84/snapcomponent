import { adminDb } from './admin';
import { UserData, Conversion } from './firestore';

/**
 * Get user data from Firestore (Server-side, bypasses security rules)
 */
export async function getUserDataAdmin(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('❌ User document does not exist:', userId);
      return null;
    }

    const data = userDoc.data()!;
    
    console.log('✅ [Admin] User data found:', {
      userId,
      plan: data.plan,
      credits: data.freeCredits,
    });
    
    return {
      email: data.email,
      plan: data.plan || 'free',
      freeCredits: data.freeCredits ?? 5,
      createdAt: data.createdAt?.toDate() || new Date(),
      stripeCustomerId: data.stripeCustomerId,
    };
  } catch (error: any) {
    console.error('❌ [Admin] Get user data error:', error);
    return null;
  }
}

/**
 * Use a credit (Server-side)
 */
export async function useCreditAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return false;
    }

    const data = userDoc.data()!;
    
    // Pro users have unlimited credits
    if (data.plan === 'pro' || data.plan === 'team') {
      return true;
    }

    // Free users must have credits
    if (data.freeCredits <= 0) {
      return false;
    }

    // Decrement credit
    await userRef.update({
      freeCredits: data.freeCredits - 1,
      creditsUsed: (data.creditsUsed || 0) + 1,
    });

    console.log('✅ [Admin] Credit used:', {
      userId,
      remaining: data.freeCredits - 1,
    });

    return true;
  } catch (error: any) {
    console.error('❌ [Admin] Use credit error:', error);
    return false;
  }
}

/**
 * Save a conversion (Server-side)
 */
export async function saveConversionAdmin(
  userId: string,
  imageUrl: string,
  generatedCode: string,
  isPublic: boolean = false
): Promise<{ id: string | null; error: string | null }> {
  try {
    const conversionRef = await adminDb.collection('conversions').add({
      userId,
      imageUrl,
      generatedCode,
      isPublic,
      createdAt: new Date(),
    });

    console.log('✅ [Admin] Conversion saved:', conversionRef.id);

    return { id: conversionRef.id, error: null };
  } catch (error: any) {
    console.error('❌ [Admin] Save conversion error:', error);
    return { id: null, error: error.message };
  }
}

/**
 * Upgrade user to Pro plan (Server-side, for Stripe webhooks)
 */
export async function upgradeUserToProAdmin(
  userId: string,
  stripeCustomerId: string
): Promise<boolean> {
  try {
    await adminDb.collection('users').doc(userId).update({
      plan: 'pro',
      stripeCustomerId,
    });

    console.log('✅ [Admin] User upgraded to Pro:', userId);
    return true;
  } catch (error: any) {
    console.error('❌ [Admin] Upgrade user error:', error);
    return false;
  }
}
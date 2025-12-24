import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Google Provider
const googleProvider = new GoogleAuthProvider();

// 유저 생성 시 Firestore에 초기 데이터 저장
export async function createUserDocument(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user document already exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData = {
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        plan: 'free',
        freeCredits: 5,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        totalConversions: 0,
        creditsUsed: 0,
      };
      
      await setDoc(userRef, userData);
      console.log('✅ User document created:', user.uid, userData);
    } else {
      // Update last login time
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true }); // merge: true는 기존 데이터 유지
      
      console.log('✅ User document updated (last login):', user.uid);
    }
  } catch (error: any) {
    console.error('❌ Create user document error:', error);
    throw new Error(error.message || 'Failed to create user document');
  }
}

/*async function createUserDocument(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      
      // 플랜 정보
      plan: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      
      // 크레딧 (무료 티어)
      freeCredits: 5,
      creditsUsed: 0,
      
      // 메타데이터
      lastLoginAt: serverTimestamp(),
      totalConversions: 0,
    });
  } else {
    // 기존 유저 - 마지막 로그인만 업데이트
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
  }
}
*/

// 이메일 회원가입
export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(result.user);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// 이메일 로그인
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createUserDocument(result.user); // 로그인 시간 업데이트
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Google 로그인
export async function signInWithGoogle(): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // ✅ Google 로그인 후 즉시 사용자 문서 생성/확인
    await createUserDocument(result.user);
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
}

/*export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}*/

// 로그아웃
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    //return { error: null };
  } catch (error: any) {
    //return { error: error.message };
  }
}

// Auth State Observer
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
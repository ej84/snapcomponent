import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK는 서버 사이드 전용
// Firestore Security Rules를 우회할 수 있음

if (!getApps().length) {
  // Production: 환경 변수에서 서비스 계정 키 로드
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Development: Firebase 프로젝트 ID만으로 초기화 (에뮬레이터 사용 시)
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const adminDb = getFirestore();
import { NextRequest, NextResponse } from 'next/server';
import { convertImageToCode } from '@/lib/openai/client';
import { getUserData, useCredit } from '@/lib/firebase/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Vercel 타임아웃 60초로 설정 (Pro 플랜이면 300까지 가능)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API /convert - Request received');

    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No auth header');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, userId } = body;

    console.log('📦 Request body:', {
      userId,
      imageUrl: imageUrl?.substring(0, 100) + '...',
    });

    if (!imageUrl || !userId) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing imageUrl or userId' },
        { status: 400 }
      );
    }

    // Get user data
    //console.log('🔍 Getting user data for userId:', userId);
    const userData = await getUserData(userId);

    if (!userData) {
      console.error('❌ User not found:', userId);
      return NextResponse.json(
        { error: 'User not found', userId },
        { status: 404 }
      );
    }

    //console.log('✅ User found:', { plan: userData.plan, credits: userData.freeCredits });

    // 크레딧 잔액 확인만 (아직 차감 안 함)
    if (userData.plan === 'free' && (userData.freeCredits || 0) <= 0) {
      console.error('❌ No credits remaining');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    // Convert image to code (크레딧 차감 전에 먼저 변환 시도)
    console.log('🤖 Converting image with OpenAI...');

    const TIMEOUT_MS = 55000;
    let code: string;

    try {
      code = await Promise.race([
        convertImageToCode(imageUrl),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Conversion timed out. Try a simpler or smaller screenshot.')),
            TIMEOUT_MS
          )
        ),
      ]);
    } catch (conversionError: any) {
      console.error('❌ Conversion failed:', conversionError.message);
      return NextResponse.json(
        { error: conversionError.message || 'Failed to convert image' },
        { status: 500 }
      );
    }

    console.log('✅ Code generated, length:', code.length);

    // 변환 성공 후 크레딧 차감
    console.log('💳 Deducting credit...');
    const canUse = await useCredit(userId);

    if (!canUse) {
      console.error('❌ Credit deduction failed');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    console.log('✅ Credit deducted');

    // Firebase Admin SDK로 Firestore에 저장 (Security Rules 우회)
    console.log('💾 Saving conversion via Admin SDK...');
    try {
      const docRef = await adminDb.collection('conversions').add({
        userId,
        imageUrl,
        generatedCode: code,
        isPublic: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log('✅ Conversion saved with ID:', docRef.id);
    } catch (saveError: any) {
      // 저장 실패해도 유저한테는 코드를 돌려줌 (크레딧은 이미 차감됐으므로)
      console.error('⚠️ Failed to save conversion:', saveError.message);
    }

    const response = {
      success: true,
      code,
      creditsRemaining:
        userData.plan === 'free'
          ? Math.max(0, (userData.freeCredits || 0) - 1)
          : 'unlimited',
    };

    console.log('✅ API Response sent:', { codeLength: code.length });
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to convert image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { convertImageToCode } from '@/lib/openai/client';
import { getUserData, useCredit, saveConversion } from '@/lib/firebase/firestore';

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
    console.log('🔍 Attempting to get user data for userId:', userId);
    const userData = await getUserData(userId);
    console.log('📊 getUserData result:', userData);

    if (!userData) {
      console.error('❌ User not found in Firestore for userId:', userId);
      return NextResponse.json(
        { error: 'User not found', userId },
        { status: 404 }
      );
    }

    console.log('✅ User found:', {
      plan: userData.plan,
      credits: userData.freeCredits,
    });

    // 크레딧 잔액 확인만 (아직 차감 안 함)
    if (userData.plan === 'free' && (userData.freeCredits || 0) <= 0) {
      console.error('❌ No credits remaining');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    // Convert image to code using OpenAI (크레딧 차감 전에 먼저 시도)
    console.log('🤖 Converting image with OpenAI...');

    const TIMEOUT_MS = 55000; // Vercel maxDuration(60s)보다 5초 여유
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
      // 변환 실패 시 크레딧 차감하지 않음
      return NextResponse.json(
        { error: conversionError.message || 'Failed to convert image' },
        { status: 500 }
      );
    }

    console.log('✅ Code generated, length:', code.length);

    // 변환 성공 후에 크레딧 차감
    console.log('💳 Deducting credit after successful conversion...');
    const canUse = await useCredit(userId);

    if (!canUse) {
      // 혹시 동시 요청으로 크레딧이 이미 소진된 경우
      console.error('❌ Credit deduction failed (likely already exhausted)');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    console.log('✅ Credit deducted successfully');

    // Save conversion to Firestore
    console.log('💾 Saving conversion...');
    const result = await saveConversion(userId, imageUrl, code, false);

    if (result.error) {
      console.error('⚠️ Failed to save conversion:', result.error);
    } else {
      console.log('✅ Conversion saved with ID:', result.id);
    }

    const response = {
      success: true,
      code,
      creditsRemaining:
        userData.plan === 'free'
          ? Math.max(0, (userData.freeCredits || 0) - 1)
          : 'unlimited',
    };

    console.log('✅ API Response:', { ...response, code: `${code.length} chars` });
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 API error:', error);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      {
        error: error.message || 'Failed to convert image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
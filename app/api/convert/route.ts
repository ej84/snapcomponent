import { NextRequest, NextResponse } from 'next/server';
import { convertImageToCode } from '@/lib/openai/client';
import { getUserData, useCredit, saveConversion } from '@/lib/firebase/firestore';

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
      imageUrl: imageUrl?.substring(0, 100) + '...' 
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
        { 
          error: 'User not found',
          userId: userId,
        },
        { status: 404 }
      );
    }

    console.log('✅ User found:', {
      plan: userData.plan,
      credits: userData.freeCredits,
    });

    // Check credits
    console.log('💳 Checking credits...');
    const canUse = await useCredit(userId);
    
    if (!canUse) {
      console.error('❌ No credits remaining');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade to Pro.' },
        { status: 403 }
      );
    }
    
    console.log('✅ Credit used successfully');

    // Convert image to code using OpenAI
    console.log('🤖 Converting image with OpenAI...');
    const code = await convertImageToCode(imageUrl);
    console.log('✅ Code generated, length:', code.length);

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
      creditsRemaining: userData.plan === 'free' 
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
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log('📥 Webhook event received:', event.type);

  try {
    switch (event.type) {
      // =====================================
      // 1. CHECKOUT SESSION COMPLETED (가장 먼저)
      // =====================================
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log('💳 Checkout completed:', {
          userId,
          customerId,
          subscriptionId,
          metadata: session.metadata,
        });

        if (!userId) {
          console.error('❌ Missing userId in metadata');
          return NextResponse.json(
            { error: 'Missing userId in metadata' },
            { status: 400 }
          );
        }

        if (!customerId) {
          console.error('❌ Missing customerId');
          return NextResponse.json(
            { error: 'Missing customerId' },
            { status: 400 }
          );
        }

        // ✅ userId로 직접 업데이트 (customerId로 검색하지 않음)
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            console.error('❌ User document not found:', userId);
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }

          // Pro로 업그레이드
          await updateDoc(userRef, {
            plan: 'pro',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          });

          console.log('✅ User upgraded to Pro:', {
            userId,
            customerId,
            subscriptionId,
          });
        } catch (error: any) {
          console.error('❌ Failed to upgrade user:', error);
          throw error;
        }
        break;
      }

      // =====================================
      // 2. SUBSCRIPTION EVENTS
      // =====================================
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;

        console.log('✅ Subscription created:', {
          customerId,
          subscriptionId,
          status: subscription.status,
        });

        // ✅ customerId로 사용자 찾아서 subscription ID만 업데이트
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('stripeCustomerId', '==', customerId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, {
              stripeSubscriptionId: subscriptionId,
            });
            console.log('✅ Subscription ID updated for user:', userDoc.id);
          } else {
            console.warn('⚠️ User not found for customerId:', customerId);
            // 이건 경고만 (checkout.session.completed에서 이미 처리됨)
          }
        } catch (error: any) {
          console.error('❌ Error updating subscription ID:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        console.log('✅ Subscription updated:', {
          customerId,
          subscriptionId,
          status,
        });

        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('stripeCustomerId', '==', customerId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            
            if (status === 'active') {
              await updateDoc(userDoc.ref, {
                plan: 'pro',
                stripeSubscriptionId: subscriptionId,
              });
              console.log('✅ Subscription activated for user:', userDoc.id);
            } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
              console.log('⚠️ Subscription status changed to:', status);
            }
          } else {
            console.warn('⚠️ User not found for customerId:', customerId);
          }
        } catch (error: any) {
          console.error('❌ Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        console.log('❌ Subscription deleted:', customerId);
        
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('stripeCustomerId', '==', customerId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, {
              plan: 'free',
              freeCredits: 5,
              stripeSubscriptionId: null,
            });
            console.log('✅ User downgraded to free:', userDoc.id);
          } else {
            console.warn('⚠️ User not found for customerId:', customerId);
          }
        } catch (error: any) {
          console.error('❌ Error downgrading user:', error);
        }
        break;
      }

      // =====================================
      // 3. INVOICE EVENTS (로그만)
      // =====================================
      case 'invoice.created':
      case 'invoice.finalized':
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        console.log('✅ Invoice event:', event.type);
        break;

      case 'invoice.payment_failed':
        console.log('❌ Invoice payment failed');
        break;

      // =====================================
      // 4. PAYMENT EVENTS (로그만)
      // =====================================
      case 'payment_intent.created':
      case 'payment_intent.succeeded':
      case 'payment_method.attached':
      case 'charge.succeeded':
        console.log('✅ Payment event:', event.type);
        break;

      // =====================================
      // 5. CUSTOMER EVENTS (로그만)
      // =====================================
      case 'customer.created':
      case 'customer.updated':
        console.log('✅ Customer event:', event.type);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        eventType: event.type,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    received: true,
    eventType: event.type,
  });
}
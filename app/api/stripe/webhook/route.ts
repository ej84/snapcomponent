import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import { upgradeUserToPro } from '@/lib/firebase/firestore';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

  // Handle the event
  try {
    switch (event.type) {
      // =====================================
      // CHECKOUT EVENTS
      // =====================================
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log('✅ Checkout completed:', {
          userId,
          customerId,
          subscriptionId,
        });

        if (userId && customerId) {
          const success = await upgradeUserToPro(userId, customerId, subscriptionId);
          
          if (success) {
            console.log('✅ User upgraded to Pro successfully');
          } else {
            console.error('❌ Failed to upgrade user');
          }
        } else {
          console.error('❌ Missing userId or customerId');
        }
        break;
      }

      // =====================================
      // SUBSCRIPTION EVENTS
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

        // Find user by stripeCustomerId
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
          console.error('❌ User not found for customerId:', customerId);
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

        // Find user
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          
          // Handle different statuses
          if (status === 'active') {
            await updateDoc(userDoc.ref, {
              plan: 'pro',
              stripeSubscriptionId: subscriptionId,
            });
            console.log('✅ Subscription activated for user:', userDoc.id);
          } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
            // Keep pro until period ends (handled by subscription.deleted)
            console.log('⚠️ Subscription status changed to:', status);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;

        console.log('❌ Subscription deleted:', {
          customerId,
          subscriptionId,
        });
        
        // Downgrade user to free plan
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
        }
        break;
      }

      // =====================================
      // INVOICE EVENTS
      // =====================================
      case 'invoice.created': {
        const invoice = event.data.object;
        console.log('✅ Invoice created:', invoice.id);
        break;
      }

      case 'invoice.finalized': {
        const invoice = event.data.object;
        console.log('✅ Invoice finalized:', invoice.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('✅ Invoice paid:', invoice.id);
        // Subscription is already active, no action needed
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('✅ Invoice payment succeeded:', invoice.id);
        // Could send receipt email here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('❌ Invoice payment failed:', invoice.id);
        // Could send payment failure notification
        // Consider: pause subscription after X failures
        break;
      }

      // =====================================
      // PAYMENT EVENTS
      // =====================================
      case 'payment_intent.created': {
        const paymentIntent = event.data.object;
        console.log('✅ Payment intent created:', paymentIntent.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('✅ Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object;
        console.log('✅ Payment method attached:', paymentMethod.id);
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object;
        console.log('✅ Charge succeeded:', charge.id);
        break;
      }

      // =====================================
      // CUSTOMER EVENTS
      // =====================================
      case 'customer.created': {
        const customer = event.data.object;
        console.log('✅ Customer created:', customer.id);
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object;
        console.log('✅ Customer updated:', customer.id);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        console.log('⚠️ Trial ending soon for subscription:', subscription.id);
        // Could send reminder email here
        break;
      }

      // =====================================
      // UNHANDLED EVENTS (LOG ONLY)
      // =====================================
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
        // Log unhandled events for monitoring
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

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['paddle-signature'];
    const payload = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Paddle webhook received:', event.event_type);

    // Log the webhook event
    await logWebhookEvent(event);

    // Handle different event types
    switch (event.event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(event);
        break;
      case 'transaction.payment_failed':
        await handlePaymentFailed(event);
        break;
      default:
        console.log('Unhandled event type:', event.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function logWebhookEvent(event) {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/paddle_webhook_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        event_id: event.event_id || event.id,
        event_type: event.event_type,
        subscription_id: event.data?.subscription_id,
        customer_id: event.data?.customer_id,
        payload: event,
        processed: false
      })
    });

    if (!response.ok) {
      console.error('Failed to log webhook event:', await response.text());
    }
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

async function handleSubscriptionCreated(event) {
  const { subscription_id, customer_id, user_id } = event.data;
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        user_id: user_id,
        plan: 'premium',
        status: 'active',
        paddle_subscription_id: subscription_id,
        paddle_customer_id: customer_id,
        amount: 5.00,
        currency: 'USD',
        billing_cycle: 'yearly'
      })
    });

    if (!response.ok) {
      console.error('Failed to create subscription:', await response.text());
    } else {
      console.log('Subscription created successfully');
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(event) {
  const { subscription_id, status } = event.data;
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions?paddle_subscription_id=eq.${subscription_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        status: status,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to update subscription:', await response.text());
    } else {
      console.log('Subscription updated successfully');
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCancelled(event) {
  const { subscription_id } = event.data;
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions?paddle_subscription_id=eq.${subscription_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        status: 'cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to cancel subscription:', await response.text());
    } else {
      console.log('Subscription cancelled successfully');
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}

async function handleTransactionCompleted(event) {
  const { subscription_id, transaction_id } = event.data;
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions?paddle_subscription_id=eq.${subscription_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        paddle_transaction_id: transaction_id,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to update transaction:', await response.text());
    } else {
      console.log('Transaction updated successfully');
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
  }
}

async function handlePaymentFailed(event) {
  const { subscription_id } = event.data;
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions?paddle_subscription_id=eq.${subscription_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to update payment status:', await response.text());
    } else {
      console.log('Payment failure recorded');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

// Supabase Edge Function: Lemon Squeezy webhook
// Deployment requires: supabase CLI and setting LS_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function verifySignature(secret: string, payload: string, signature: string | null) {
  if (!signature) return false;
  const encoder = new TextEncoder();
  const key = crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return key.then(k => crypto.subtle.verify('HMAC', k, hexToArrayBuffer(signature), encoder.encode(payload)));
}

function hexToArrayBuffer(hex: string) {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes.buffer;
}

export const handler = async (req: Request): Promise<Response> => {
  const secret = Deno.env.get('LS_WEBHOOK_SECRET') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceKey);

  const raw = await req.text();
  const sig = req.headers.get('X-Signature');

  const ok = await verifySignature(secret, raw, sig);
  if (!ok) {
    return new Response('Invalid signature', { status: 401 });
  }

  const body = JSON.parse(raw);
  const event = body?.meta?.event_name as string | undefined;
  const subscription = body?.data;

  try {
    if (!event || !subscription) {
      return new Response('No event', { status: 200 });
    }

    // Extract fields
    const ls_subscription_id = subscription.id?.toString();
    const status = subscription.attributes?.status as string | null;
    const variant_id = subscription.attributes?.variant_id?.toString() ?? null;
    const customer_id = subscription.attributes?.customer_id?.toString() ?? null;
    const email = subscription.attributes?.user_email ?? null;
    const renewal_date = subscription.attributes?.renews_at ?? null;
    const custom = subscription.attributes?.custom as string | null; // we set user_id here

    let user_id: string | null = custom ?? null;

    if (!user_id && email) {
      // fallback: look up user by email in auth (requires admin)
      const { data: users, error: uerr } = await supabase.auth.admin.listUsers();
      if (!uerr) {
        const found = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        user_id = found?.id ?? null;
      }
    }

    if (!user_id) {
      return new Response('No user_id', { status: 200 });
    }

    // Upsert subscription
    const { error } = await supabase.from('subscriptions').upsert({
      user_id,
      ls_subscription_id,
      status,
      variant_id,
      customer_id,
      email,
      renewal_date,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'ls_subscription_id' });

    if (error) {
      console.error('Upsert error', error);
      return new Response('DB error', { status: 500 });
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('error', { status: 500 });
  }
};

// deno-lint-ignore no-explicit-any
export default handler as any;




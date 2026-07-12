import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendPushToSubscriptions } from '@/lib/push';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { userId, title, body, url, icon } = payload;

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to trigger sends or it could be a secured server endpoint.
    // For now, any authenticated user can trigger a send (matching existing logic)
    
    // Fetch target user's subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscriptions found' });
    }

    // Send push
    const result = await sendPushToSubscriptions(subscriptions, { title, body, url, icon });

    // Cleanup expired subscriptions
    if (result.expiredIds && result.expiredIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', result.expiredIds);
    }

    return NextResponse.json({ success: true, results: result });
  } catch (error) {
    console.error('Push send API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

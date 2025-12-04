import { supabase, supabaseAdmin } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  paddle_subscription_id?: string;
  paddle_customer_id?: string;
  paddle_transaction_id?: string;
  paddle_price_id?: string;
  amount?: number;
  currency: string;
  billing_cycle: string;
  created_at: string;
  updated_at: string;
}

export interface UserPortfolio {
  id: string;
  user_id: string;
  portfolio_data: any;
  created_at: string;
  updated_at: string;
}

export class DatabaseService {
  // User management
  static async createUser(userData: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Subscription management
  static async createSubscription(subscriptionData: Partial<Subscription>) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async cancelSubscription(subscriptionId: string) {
    return this.updateSubscription(subscriptionId, { 
      status: 'cancelled',
      end_date: new Date().toISOString()
    });
  }

  // Portfolio management
  static async savePortfolio(userId: string, portfolioData: any) {
    const { data, error } = await supabase
      .from('user_portfolios')
      .upsert({
        user_id: userId,
        portfolio_data: portfolioData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPortfolio(userId: string) {
    const { data, error } = await supabase
      .from('user_portfolios')
      .select('portfolio_data')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.portfolio_data;
  }

  // Paddle webhook events
  static async logWebhookEvent(eventData: any) {
    const { data, error } = await supabaseAdmin
      .from('paddle_webhook_events')
      .insert({
        event_id: eventData.event_id || eventData.id,
        event_type: eventData.event_type,
        subscription_id: eventData.data?.subscription_id,
        customer_id: eventData.data?.customer_id,
        payload: eventData,
        processed: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async markWebhookEventProcessed(eventId: string) {
    const { error } = await supabaseAdmin
      .from('paddle_webhook_events')
      .update({ processed: true })
      .eq('event_id', eventId);
    
    if (error) throw error;
  }
}

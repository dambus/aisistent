export type Plan = 'free' | 'starter' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type DocumentType =
  | 'ugovor-o-radu'
  | 'ugovor-o-delu'
  | 'nda'
  | 'ugovor-o-zakupu'
  | 'ugovor-o-saradnji'

export interface Company {
  id: string
  user_id: string
  naziv: string
  pib: string | null
  maticni_broj: string | null
  adresa: string | null
  grad: string | null
  zastupnik: string | null
  funkcija_zastupnika: string | null
  email: string | null
  telefon: string | null
  is_default: boolean
  created_at: string
}

// Convenience aliases — use these in application code
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type CompanyRow = Database['public']['Tables']['companies']['Row']

// Supabase Database type — inline row types satisfy the GenericSchema constraint
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          plan: string
          display_name: string | null
          documents_this_month: number
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          plan?: string
          display_name?: string | null
          documents_this_month?: number
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          plan?: string
          display_name?: string | null
          documents_this_month?: number
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          input_data: Record<string, unknown>
          generated_text: string
          is_free: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          input_data: Record<string, unknown>
          generated_text: string
          is_free?: boolean
          created_at?: string
        }
        Update: {
          type?: string
          title?: string
          input_data?: Record<string, unknown>
          generated_text?: string
          is_free?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          plan: string
          status: string
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          user_id: string
          naziv: string
          pib: string | null
          maticni_broj: string | null
          adresa: string | null
          grad: string | null
          zastupnik: string | null
          funkcija_zastupnika: string | null
          email: string | null
          telefon: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          naziv: string
          pib?: string | null
          maticni_broj?: string | null
          adresa?: string | null
          grad?: string | null
          zastupnik?: string | null
          funkcija_zastupnika?: string | null
          email?: string | null
          telefon?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          naziv?: string
          pib?: string | null
          maticni_broj?: string | null
          adresa?: string | null
          grad?: string | null
          zastupnik?: string | null
          funkcija_zastupnika?: string | null
          email?: string | null
          telefon?: string | null
          is_default?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Plan = 'free' | 'starter' | 'pro' | 'agency'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type DocumentType =
  | 'ugovor-o-radu'
  | 'ugovor-o-delu'
  | 'nda'
  | 'ugovor-o-zakupu'
  | 'ugovor-o-saradnji'

export interface Contact {
  id: string
  user_id: string
  naziv: string
  pib: string | null
  adresa: string | null
  grad: string | null
  zastupnik: string | null
  email: string | null
  telefon: string | null
  ziro_racun: string | null
  tip: string
  created_at: string
}

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
  logo_url: string | null
  delatnost: string | null
  ziro_racun: string | null
  pdv_obveznik: boolean
  website: string | null
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
          is_admin: boolean
          onboarded: boolean
          created_at: string
        }
        Insert: {
          id: string
          plan?: string
          display_name?: string | null
          documents_this_month?: number
          stripe_customer_id?: string | null
          is_admin?: boolean
          onboarded?: boolean
          created_at?: string
        }
        Update: {
          plan?: string
          display_name?: string | null
          documents_this_month?: number
          stripe_customer_id?: string | null
          is_admin?: boolean
          onboarded?: boolean
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
          version: number
          root_document_id: string | null
          company_id: string | null
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
          version?: number
          root_document_id?: string | null
          company_id?: string | null
          created_at?: string
        }
        Update: {
          type?: string
          title?: string
          input_data?: Record<string, unknown>
          generated_text?: string
          is_free?: boolean
          version?: number
          root_document_id?: string | null
          company_id?: string | null
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
          logo_url: string | null
          delatnost: string | null
          ziro_racun: string | null
          pdv_obveznik: boolean
          website: string | null
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
          logo_url?: string | null
          delatnost?: string | null
          ziro_racun?: string | null
          pdv_obveznik?: boolean
          website?: string | null
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
          logo_url?: string | null
          delatnost?: string | null
          ziro_racun?: string | null
          pdv_obveznik?: boolean
          website?: string | null
          is_default?: boolean
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          naziv: string
          pib: string | null
          adresa: string | null
          grad: string | null
          zastupnik: string | null
          email: string | null
          telefon: string | null
          ziro_racun: string | null
          tip: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          naziv: string
          pib?: string | null
          adresa?: string | null
          grad?: string | null
          zastupnik?: string | null
          email?: string | null
          telefon?: string | null
          ziro_racun?: string | null
          tip?: string
          created_at?: string
        }
        Update: {
          naziv?: string
          pib?: string | null
          adresa?: string | null
          grad?: string | null
          zastupnik?: string | null
          email?: string | null
          telefon?: string | null
          ziro_racun?: string | null
          tip?: string
        }
        Relationships: []
      }
      form_templates: {
        Row: {
          id: string
          fingerprint: string
          name: string | null
          page_count: number
          source_type: string
          fields: unknown
          sections: unknown
          hit_count: number
          needs_review: boolean
          created_at: string
          last_seen_at: string
        }
        Insert: {
          id?: string
          fingerprint: string
          name?: string | null
          page_count: number
          source_type: string
          fields: unknown
          sections?: unknown
          hit_count?: number
          needs_review?: boolean
          created_at?: string
          last_seen_at?: string
        }
        Update: {
          name?: string | null
          page_count?: number
          source_type?: string
          fields?: unknown
          sections?: unknown
          hit_count?: number
          needs_review?: boolean
          last_seen_at?: string
        }
        Relationships: []
      }
      template_feedback: {
        Row: {
          id: string
          fingerprint: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          fingerprint: string
          user_id: string
          created_at?: string
        }
        Update: {
          fingerprint?: string
        }
        Relationships: []
      }
      library_forms: {
        Row: {
          id: string
          slug: string
          title: string
          short_name: string
          category: string
          description: string | null
          source_institution: string
          source_url: string
          file_ref: string
          source_type: string
          script: string
          page_count: number
          fields: unknown
          published: boolean
          verified_at: string
          outdated_reports: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          short_name: string
          category: string
          description?: string | null
          source_institution: string
          source_url: string
          file_ref: string
          source_type: string
          script?: string
          page_count: number
          fields: unknown
          published?: boolean
          verified_at: string
          outdated_reports?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          short_name?: string
          category?: string
          description?: string | null
          source_institution?: string
          source_url?: string
          file_ref?: string
          source_type?: string
          script?: string
          page_count?: number
          fields?: unknown
          published?: boolean
          verified_at?: string
          outdated_reports?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_form_template_hit: {
        Args: { p_fingerprint: string }
        Returns: void
      }
    }
  }
}

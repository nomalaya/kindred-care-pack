export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          address: string | null
          alias_first_name: string
          approx_age: number | null
          avatar_age_range: string | null
          avatar_gender: string | null
          avatar_hair_type: string | null
          avatar_skin_tone: string | null
          avatar_url: string | null
          beneficiary_category: string | null
          children_count: number | null
          context_badge: string | null
          country_code: string | null
          created_at: string
          culture_tags: string[] | null
          date_of_birth: string | null
          department_code: string | null
          diet_tags: string[] | null
          donation_clicks: number | null
          donation_conversion_rate: number | null
          email: string | null
          emotional_score: number | null
          emotional_sentence: string | null
          family_members: number | null
          financial_situation: string | null
          id: string
          is_active: boolean | null
          last_donation_date: string | null
          location_visibility: string | null
          postal_prefix: string | null
          profile_type: string | null
          profile_views: number | null
          real_first_name: string | null
          real_last_name: string | null
          region: string | null
          region_code: string | null
          rotation_score: number | null
          short_story: string | null
          situation_id: string
          social_worker_notes: string | null
          total_donations_received: number | null
          updated_at: string
          urgency_level: number | null
          urgent_reason: string | null
          urgent_until: string | null
        }
        Insert: {
          address?: string | null
          alias_first_name: string
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          avatar_url?: string | null
          beneficiary_category?: string | null
          children_count?: number | null
          context_badge?: string | null
          country_code?: string | null
          created_at?: string
          culture_tags?: string[] | null
          date_of_birth?: string | null
          department_code?: string | null
          diet_tags?: string[] | null
          donation_clicks?: number | null
          donation_conversion_rate?: number | null
          email?: string | null
          emotional_score?: number | null
          emotional_sentence?: string | null
          family_members?: number | null
          financial_situation?: string | null
          id?: string
          is_active?: boolean | null
          last_donation_date?: string | null
          location_visibility?: string | null
          postal_prefix?: string | null
          profile_type?: string | null
          profile_views?: number | null
          real_first_name?: string | null
          real_last_name?: string | null
          region?: string | null
          region_code?: string | null
          rotation_score?: number | null
          short_story?: string | null
          situation_id: string
          social_worker_notes?: string | null
          total_donations_received?: number | null
          updated_at?: string
          urgency_level?: number | null
          urgent_reason?: string | null
          urgent_until?: string | null
        }
        Update: {
          address?: string | null
          alias_first_name?: string
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          avatar_url?: string | null
          beneficiary_category?: string | null
          children_count?: number | null
          context_badge?: string | null
          country_code?: string | null
          created_at?: string
          culture_tags?: string[] | null
          date_of_birth?: string | null
          department_code?: string | null
          diet_tags?: string[] | null
          donation_clicks?: number | null
          donation_conversion_rate?: number | null
          email?: string | null
          emotional_score?: number | null
          emotional_sentence?: string | null
          family_members?: number | null
          financial_situation?: string | null
          id?: string
          is_active?: boolean | null
          last_donation_date?: string | null
          location_visibility?: string | null
          postal_prefix?: string | null
          profile_type?: string | null
          profile_views?: number | null
          real_first_name?: string | null
          real_last_name?: string | null
          region?: string | null
          region_code?: string | null
          rotation_score?: number | null
          short_story?: string | null
          situation_id?: string
          social_worker_notes?: string | null
          total_donations_received?: number | null
          updated_at?: string
          urgency_level?: number | null
          urgent_reason?: string | null
          urgent_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_products: {
        Row: {
          beneficiary_id: string
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          beneficiary_id: string
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          beneficiary_id?: string
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_products_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_products_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      causes: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          basket_data: Json
          beneficiary_id: string
          create_account: boolean | null
          created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          donor_phone: string | null
          emergency_beneficiary_id: string | null
          emergency_pack_data: Json | null
          id: string
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          basket_data?: Json
          beneficiary_id: string
          create_account?: boolean | null
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          emergency_beneficiary_id?: string | null
          emergency_pack_data?: Json | null
          id?: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          basket_data?: Json
          beneficiary_id?: string
          create_account?: boolean | null
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          emergency_beneficiary_id?: string | null
          emergency_pack_data?: Json | null
          id?: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_public"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          beneficiary_id: string
          checkout_session_id: string | null
          created_at: string
          delivery_status: string
          donor_id: string
          id: string
          payment_status: string | null
          products_sent: Json | null
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          beneficiary_id: string
          checkout_session_id?: string | null
          created_at?: string
          delivery_status?: string
          donor_id: string
          id?: string
          payment_status?: string | null
          products_sent?: Json | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          beneficiary_id?: string
          checkout_session_id?: string | null
          created_at?: string
          delivery_status?: string
          donor_id?: string
          id?: string
          payment_status?: string | null
          products_sent?: Json | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_beneficiaries: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followed_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followed_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_public"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_profiles: {
        Row: {
          id: string
          impact_type_1: string
          impact_type_2: string
          impact_type_3: string
          situation_id: string
        }
        Insert: {
          id?: string
          impact_type_1: string
          impact_type_2: string
          impact_type_3: string
          situation_id: string
        }
        Update: {
          id?: string
          impact_type_1?: string
          impact_type_2?: string
          impact_type_3?: string
          situation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_profiles_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: true
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_units: {
        Row: {
          id: string
          impact_type: string
          impact_value: number
          product_id: string
        }
        Insert: {
          id?: string
          impact_type: string
          impact_value?: number
          product_id: string
        }
        Update: {
          id?: string
          impact_type?: string
          impact_value?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_rules: {
        Row: {
          created_at: string | null
          excluded_tags: string[] | null
          id: string
          is_active: boolean | null
          max_tier: number | null
          min_tier: number | null
          priority_boost: number | null
          required_categories: string[] | null
          rule_name: string
          situation_id: string
        }
        Insert: {
          created_at?: string | null
          excluded_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          max_tier?: number | null
          min_tier?: number | null
          priority_boost?: number | null
          required_categories?: string[] | null
          rule_name: string
          situation_id: string
        }
        Update: {
          created_at?: string | null
          excluded_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          max_tier?: number | null
          min_tier?: number | null
          priority_boost?: number | null
          required_categories?: string[] | null
          rule_name?: string
          situation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matching_rules_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cause_relevance: string[] | null
          climate_tags: string[] | null
          contains_alcohol: boolean | null
          contains_pork: boolean | null
          created_at: string
          cultural_origin_tags: string[] | null
          culture_tags: string[] | null
          diet_tags: string[] | null
          display_name: string | null
          emotion_tags: string[] | null
          emotional_family: string | null
          emotional_intensity: number | null
          gender_specific: string | null
          halal_compatible: boolean | null
          id: string
          is_active_product: boolean | null
          is_visible_public: boolean | null
          kosher_compatible: boolean | null
          labels: string[] | null
          name: string
          price: number
          priority_score: number | null
          product_code: string | null
          religion_tags: string[] | null
          season_tag: string | null
          situation_relevance: string[] | null
          stock_quantity: number | null
          subcategory: string | null
          target_groups: string[] | null
          territory_usage: string[] | null
          tier: number
          usage_context: string | null
          vegan: boolean | null
          vegetarian: boolean | null
        }
        Insert: {
          category: string
          cause_relevance?: string[] | null
          climate_tags?: string[] | null
          contains_alcohol?: boolean | null
          contains_pork?: boolean | null
          created_at?: string
          cultural_origin_tags?: string[] | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          display_name?: string | null
          emotion_tags?: string[] | null
          emotional_family?: string | null
          emotional_intensity?: number | null
          gender_specific?: string | null
          halal_compatible?: boolean | null
          id?: string
          is_active_product?: boolean | null
          is_visible_public?: boolean | null
          kosher_compatible?: boolean | null
          labels?: string[] | null
          name: string
          price?: number
          priority_score?: number | null
          product_code?: string | null
          religion_tags?: string[] | null
          season_tag?: string | null
          situation_relevance?: string[] | null
          stock_quantity?: number | null
          subcategory?: string | null
          target_groups?: string[] | null
          territory_usage?: string[] | null
          tier?: number
          usage_context?: string | null
          vegan?: boolean | null
          vegetarian?: boolean | null
        }
        Update: {
          category?: string
          cause_relevance?: string[] | null
          climate_tags?: string[] | null
          contains_alcohol?: boolean | null
          contains_pork?: boolean | null
          created_at?: string
          cultural_origin_tags?: string[] | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          display_name?: string | null
          emotion_tags?: string[] | null
          emotional_family?: string | null
          emotional_intensity?: number | null
          gender_specific?: string | null
          halal_compatible?: boolean | null
          id?: string
          is_active_product?: boolean | null
          is_visible_public?: boolean | null
          kosher_compatible?: boolean | null
          labels?: string[] | null
          name?: string
          price?: number
          priority_score?: number | null
          product_code?: string | null
          religion_tags?: string[] | null
          season_tag?: string | null
          situation_relevance?: string[] | null
          stock_quantity?: number | null
          subcategory?: string | null
          target_groups?: string[] | null
          territory_usage?: string[] | null
          tier?: number
          usage_context?: string | null
          vegan?: boolean | null
          vegetarian?: boolean | null
        }
        Relationships: []
      }
      profile_mappings: {
        Row: {
          created_at: string | null
          cultural_weighting: string | null
          id: string
          min_autonomy_items: number | null
          min_childhood_items: number | null
          min_dignity_items: number | null
          min_survival_items: number | null
          profile_type: string
          religious_filter: string | null
          tier1_family: string
          tier2_family: string
          tier3_family: string
          tier4_family: string
        }
        Insert: {
          created_at?: string | null
          cultural_weighting?: string | null
          id?: string
          min_autonomy_items?: number | null
          min_childhood_items?: number | null
          min_dignity_items?: number | null
          min_survival_items?: number | null
          profile_type: string
          religious_filter?: string | null
          tier1_family: string
          tier2_family: string
          tier3_family: string
          tier4_family: string
        }
        Update: {
          created_at?: string | null
          cultural_weighting?: string | null
          id?: string
          min_autonomy_items?: number | null
          min_childhood_items?: number | null
          min_dignity_items?: number | null
          min_survival_items?: number | null
          profile_type?: string
          religious_filter?: string | null
          tier1_family?: string
          tier2_family?: string
          tier3_family?: string
          tier4_family?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avg_donation_amount: number | null
          country_code: string | null
          created_at: string
          csp_category: string | null
          department_code: string | null
          display_name: string | null
          donation_frequency: string | null
          email: string | null
          gender: string | null
          id: string
          location_visibility: boolean
          motivation_tags: string[] | null
          persona_type: string | null
          postal_prefix: string | null
          preferred_causes: string[] | null
          region_code: string | null
          social_media_active: boolean | null
          tax_deduction_sensitive: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avg_donation_amount?: number | null
          country_code?: string | null
          created_at?: string
          csp_category?: string | null
          department_code?: string | null
          display_name?: string | null
          donation_frequency?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          location_visibility?: boolean
          motivation_tags?: string[] | null
          persona_type?: string | null
          postal_prefix?: string | null
          preferred_causes?: string[] | null
          region_code?: string | null
          social_media_active?: boolean | null
          tax_deduction_sensitive?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avg_donation_amount?: number | null
          country_code?: string | null
          created_at?: string
          csp_category?: string | null
          department_code?: string | null
          display_name?: string | null
          donation_frequency?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          location_visibility?: boolean
          motivation_tags?: string[] | null
          persona_type?: string | null
          postal_prefix?: string | null
          preferred_causes?: string[] | null
          region_code?: string | null
          social_media_active?: boolean | null
          tax_deduction_sensitive?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      situations: {
        Row: {
          cause_id: string
          created_at: string
          description: string | null
          emotional_sentence: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          cause_id: string
          created_at?: string
          description?: string | null
          emotional_sentence?: string | null
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          cause_id?: string
          created_at?: string
          description?: string | null
          emotional_sentence?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "situations_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "causes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      beneficiaries_public: {
        Row: {
          alias_first_name: string | null
          approx_age: number | null
          avatar_age_range: string | null
          avatar_gender: string | null
          avatar_hair_type: string | null
          avatar_skin_tone: string | null
          avatar_url: string | null
          beneficiary_category: string | null
          children_count: number | null
          context_badge: string | null
          culture_tags: string[] | null
          diet_tags: string[] | null
          emotional_score: number | null
          emotional_sentence: string | null
          id: string | null
          is_active: boolean | null
          last_donation_date: string | null
          profile_type: string | null
          profile_views: number | null
          region: string | null
          rotation_score: number | null
          short_story: string | null
          situation_id: string | null
          total_donations_received: number | null
          urgency_level: number | null
        }
        Insert: {
          alias_first_name?: string | null
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          avatar_url?: string | null
          beneficiary_category?: string | null
          children_count?: number | null
          context_badge?: string | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotional_score?: number | null
          emotional_sentence?: string | null
          id?: string | null
          is_active?: boolean | null
          last_donation_date?: string | null
          profile_type?: string | null
          profile_views?: number | null
          region?: string | null
          rotation_score?: number | null
          short_story?: string | null
          situation_id?: string | null
          total_donations_received?: number | null
          urgency_level?: number | null
        }
        Update: {
          alias_first_name?: string | null
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          avatar_url?: string | null
          beneficiary_category?: string | null
          children_count?: number | null
          context_badge?: string | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotional_score?: number | null
          emotional_sentence?: string | null
          id?: string | null
          is_active?: boolean | null
          last_donation_date?: string | null
          profile_type?: string | null
          profile_views?: number | null
          region?: string | null
          rotation_score?: number | null
          short_story?: string | null
          situation_id?: string | null
          total_donations_received?: number | null
          urgency_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      compute_rotation_scores: {
        Args: { p_situation_id: string }
        Returns: undefined
      }
      get_donation_stats: { Args: { p_beneficiary_id?: string }; Returns: Json }
      get_emergency_beneficiary: {
        Args: { p_exclude_id: string; p_pack_type: string }
        Returns: {
          alias_first_name: string
          id: string
        }[]
      }
      get_empathy_beneficiaries: {
        Args: {
          p_donor_location?: Json
          p_limit?: number
          p_situation_id: string
        }
        Returns: {
          alias_first_name: string
          approx_age: number
          avatar_age_range: string
          avatar_gender: string
          avatar_hair_type: string
          avatar_skin_tone: string
          avatar_url: string
          beneficiary_category: string
          children_count: number
          culture_tags: string[]
          diet_tags: string[]
          emotional_score: number
          emotional_sentence: string
          id: string
          profile_type: string
          proximity_label: string
          proximity_score: number
          region: string
          rotation_score: number
          short_story: string
          urgency_level: number
        }[]
      }
      get_ranked_beneficiaries: {
        Args: { p_limit?: number; p_situation_id: string }
        Returns: {
          alias_first_name: string
          approx_age: number
          avatar_age_range: string
          avatar_gender: string
          avatar_hair_type: string
          avatar_skin_tone: string
          avatar_url: string
          emotional_score: number
          emotional_sentence: string
          id: string
          region: string
          rotation_score: number
          short_story: string
          urgency_level: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

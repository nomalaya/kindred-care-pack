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
          created_at: string
          culture_tags: string[] | null
          date_of_birth: string | null
          diet_tags: string[] | null
          email: string | null
          emotional_sentence: string | null
          family_members: number | null
          financial_situation: string | null
          id: string
          is_active: boolean | null
          real_first_name: string | null
          real_last_name: string | null
          region: string | null
          short_story: string | null
          situation_id: string
          social_worker_notes: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          alias_first_name: string
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          created_at?: string
          culture_tags?: string[] | null
          date_of_birth?: string | null
          diet_tags?: string[] | null
          email?: string | null
          emotional_sentence?: string | null
          family_members?: number | null
          financial_situation?: string | null
          id?: string
          is_active?: boolean | null
          real_first_name?: string | null
          real_last_name?: string | null
          region?: string | null
          short_story?: string | null
          situation_id: string
          social_worker_notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          alias_first_name?: string
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          created_at?: string
          culture_tags?: string[] | null
          date_of_birth?: string | null
          diet_tags?: string[] | null
          email?: string | null
          emotional_sentence?: string | null
          family_members?: number | null
          financial_situation?: string | null
          id?: string
          is_active?: boolean | null
          real_first_name?: string | null
          real_last_name?: string | null
          region?: string | null
          short_story?: string | null
          situation_id?: string
          social_worker_notes?: string | null
          updated_at?: string
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
      donations: {
        Row: {
          amount: number
          beneficiary_id: string
          created_at: string
          delivery_status: string
          donor_id: string
          id: string
          products_sent: Json | null
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          beneficiary_id: string
          created_at?: string
          delivery_status?: string
          donor_id: string
          id?: string
          products_sent?: Json | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          beneficiary_id?: string
          created_at?: string
          delivery_status?: string
          donor_id?: string
          id?: string
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
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          culture_tags: string[] | null
          diet_tags: string[] | null
          emotion_tags: string[] | null
          id: string
          name: string
          price: number
          religion_tags: string[] | null
          stock_quantity: number | null
          tier: number
        }
        Insert: {
          category: string
          created_at?: string
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotion_tags?: string[] | null
          id?: string
          name: string
          price?: number
          religion_tags?: string[] | null
          stock_quantity?: number | null
          tier?: number
        }
        Update: {
          category?: string
          created_at?: string
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotion_tags?: string[] | null
          id?: string
          name?: string
          price?: number
          religion_tags?: string[] | null
          stock_quantity?: number | null
          tier?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
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
          culture_tags: string[] | null
          diet_tags: string[] | null
          emotional_sentence: string | null
          id: string | null
          is_active: boolean | null
          region: string | null
          short_story: string | null
          situation_id: string | null
        }
        Insert: {
          alias_first_name?: string | null
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotional_sentence?: string | null
          id?: string | null
          is_active?: boolean | null
          region?: string | null
          short_story?: string | null
          situation_id?: string | null
        }
        Update: {
          alias_first_name?: string | null
          approx_age?: number | null
          avatar_age_range?: string | null
          avatar_gender?: string | null
          avatar_hair_type?: string | null
          avatar_skin_tone?: string | null
          culture_tags?: string[] | null
          diet_tags?: string[] | null
          emotional_sentence?: string | null
          id?: string | null
          is_active?: boolean | null
          region?: string | null
          short_story?: string | null
          situation_id?: string | null
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

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agency_settings: {
        Row: {
          cancellation_policy: string
          check_in_time: string
          check_out_time: string
          email: string
          hero_image_url: string | null
          house_rules: string
          id: boolean
          legal_address: string
          legal_name: string
          phone: string
          tax_id: string
          whatsapp: string
        }
        Insert: {
          cancellation_policy?: string
          check_in_time?: string
          check_out_time?: string
          email?: string
          hero_image_url?: string | null
          house_rules?: string
          id?: boolean
          legal_address?: string
          legal_name?: string
          phone?: string
          tax_id?: string
          whatsapp?: string
        }
        Update: {
          cancellation_policy?: string
          check_in_time?: string
          check_out_time?: string
          email?: string
          hero_image_url?: string | null
          house_rules?: string
          id?: boolean
          legal_address?: string
          legal_name?: string
          phone?: string
          tax_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      apartments: {
        Row: {
          address: string
          amenities: string[]
          baths: number
          beds_double: number
          beds_single: number
          city_slug: string
          created_at: string
          description: string
          id: string
          images: string[]
          latitude: number | null
          longitude: number | null
          max_guests: number
          min_nights: number
          name: string
          neighborhood: string
          price: number
          rating: number | null
          reviews: number
          rooms: number
          size: number | null
          sofa_beds: number
        }
        Insert: {
          address?: string
          amenities?: string[]
          baths?: number
          beds_double?: number
          beds_single?: number
          city_slug: string
          created_at?: string
          description?: string
          id: string
          images?: string[]
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          min_nights?: number
          name: string
          neighborhood?: string
          price: number
          rating?: number | null
          reviews?: number
          rooms?: number
          size?: number | null
          sofa_beds?: number
        }
        Update: {
          address?: string
          amenities?: string[]
          baths?: number
          beds_double?: number
          beds_single?: number
          city_slug?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          min_nights?: number
          name?: string
          neighborhood?: string
          price?: number
          rating?: number | null
          reviews?: number
          rooms?: number
          size?: number | null
          sofa_beds?: number
        }
        Relationships: [
          {
            foreignKeyName: "apartments_city_slug_fkey"
            columns: ["city_slug"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["slug"]
          },
        ]
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          paid_on: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          paid_on: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          paid_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          apartment_id: string | null
          apartment_name: string
          booking_code: string
          booking_pin: string
          check_in: string
          check_out: string
          city_name: string
          companions: string[]
          confirmation_email_sent_at: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          guests: number
          id: string
          locale: string
          message: string | null
          payment_terms: Database["public"]["Enums"]["payment_terms"]
          source: Database["public"]["Enums"]["booking_source"]
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number | null
          updated_at: string
          user_country: string
          user_email: string
          user_name: string
          user_phone: string
          verification_token: string
        }
        Insert: {
          apartment_id?: string | null
          apartment_name?: string
          booking_code: string
          booking_pin: string
          check_in: string
          check_out: string
          city_name?: string
          companions?: string[]
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          guests: number
          id?: string
          locale?: string
          message?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"]
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
          user_country: string
          user_email: string
          user_name: string
          user_phone: string
          verification_token?: string
        }
        Update: {
          apartment_id?: string | null
          apartment_name?: string
          booking_code?: string
          booking_pin?: string
          check_in?: string
          check_out?: string
          city_name?: string
          companions?: string[]
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          guests?: number
          id?: string
          locale?: string
          message?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"]
          source?: Database["public"]["Enums"]["booking_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
          user_country?: string
          user_email?: string
          user_name?: string
          user_phone?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          description: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          country?: string
          created_at?: string
          description?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_bucket: string
          p_key_hash: string
          p_max: number
          p_window_seconds: number
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_source: "web" | "panel"
      booking_status: "Pendiente" | "Confirmada" | "Cancelada"
      payment_method:
        | "efectivo"
        | "transferencia"
        | "tarjeta"
        | "bizum"
        | "otro"
      payment_terms: "pendiente" | "al_llegar"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booking_source: ["web", "panel"],
      booking_status: ["Pendiente", "Confirmada", "Cancelada"],
      payment_method: ["efectivo", "transferencia", "tarjeta", "bizum", "otro"],
      payment_terms: ["pendiente", "al_llegar"],
    },
  },
} as const

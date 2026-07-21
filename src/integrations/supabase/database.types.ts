/* eslint-disable @typescript-eslint/no-empty-object-type */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone_number: string | null
          updated_at: string | null
          workshop_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
          workshop_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          vehicle_slug: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          vehicle_slug: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          vehicle_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_vehicle_slug_fkey"
            columns: ["vehicle_slug"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["slug"]
          },
        ]
      }
      reminder_deliveries: {
        Row: {
          email: string
          error_message: string | null
          id: string
          lead_time: string
          preference_id: string | null
          sent_at: string | null
          status: string
          vehicle_id: string
        }
        Insert: {
          email: string
          error_message?: string | null
          id?: string
          lead_time: string
          preference_id?: string | null
          sent_at?: string | null
          status: string
          vehicle_id: string
        }
        Update: {
          email?: string
          error_message?: string | null
          id?: string
          lead_time?: string
          preference_id?: string | null
          sent_at?: string | null
          status?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "reminder_preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_deliveries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_preferences: {
        Row: {
          created_at: string | null
          email: string
          id: string
          one_day: boolean
          one_week: boolean
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          one_day?: boolean
          one_week?: boolean
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          one_day?: boolean
          one_week?: boolean
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_preferences_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_type: string | null
          image_url: string
          service_record_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          service_record_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          service_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_record_id_fkey"
            columns: ["service_record_id"]
            isOneToOne: false
            referencedRelation: "service_records"
            referencedColumns: ["id"]
          },
        ]
      }
      service_records: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          fluids_changed: string | null
          id: string
          invoice_number: string | null
          labour_notes: string | null
          mileage: number | null
          parts_replaced: string | null
          recommendations: string | null
          service_date: string
          service_type: string
          technician: string | null
          total_cost: number | null
          updated_at: string | null
          vehicle_id: string
          work_performed: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          fluids_changed?: string | null
          id?: string
          invoice_number?: string | null
          labour_notes?: string | null
          mileage?: number | null
          parts_replaced?: string | null
          recommendations?: string | null
          service_date: string
          service_type: string
          technician?: string | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id: string
          work_performed?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          fluids_changed?: string | null
          id?: string
          invoice_number?: string | null
          labour_notes?: string | null
          mileage?: number | null
          parts_replaced?: string | null
          recommendations?: string | null
          service_date?: string
          service_type?: string
          technician?: string | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          current_mileage: number | null
          customer_id: string | null
          engine_size: string | null
          fuel_type: string | null
          header_image_url: string | null
          id: string
          make: string
          model: string
          next_service_date: string | null
          next_service_mileage: number | null
          qr_slug: string
          registration_number: string
          slug: string
          transmission: string | null
          updated_at: string | null
          vin: string | null
          workshop_id: string
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_mileage?: number | null
          customer_id?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          header_image_url?: string | null
          id?: string
          make: string
          model: string
          next_service_date?: string | null
          next_service_mileage?: number | null
          qr_slug: string
          registration_number: string
          slug: string
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          workshop_id: string
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_mileage?: number | null
          customer_id?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          header_image_url?: string | null
          id?: string
          make?: string
          model?: string
          next_service_date?: string | null
          next_service_mileage?: number | null
          qr_slug?: string
          registration_number?: string
          slug?: string
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          workshop_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          background_image_url: string | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          footer_info: string | null
          id: string
          logo_url: string | null
          name: string
          powered_by: string | null
          primary_color: string | null
          secondary_color: string | null
          smtp_from: string | null
          smtp_host: string | null
          smtp_pass: string | null
          smtp_port: number | null
          smtp_user: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          background_image_url?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          footer_info?: string | null
          id?: string
          logo_url?: string | null
          name: string
          powered_by?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          smtp_from?: string | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          background_image_url?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          footer_info?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          powered_by?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          smtp_from?: string | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_vehicle: { Args: { vehicle_uuid: string }; Returns: boolean }
      user_owns_vehicle_by_id: {
        Args: { vehicle_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

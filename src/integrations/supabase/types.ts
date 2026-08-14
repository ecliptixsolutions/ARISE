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
      enquiries: {
        Row: {
          admin_note: string | null
          created_at: string
          email: string
          enquiry_type: string | null
          id: string
          is_read: boolean
          message: string
          mobile: string | null
          name: string
          organisation: string | null
          subject: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          email: string
          enquiry_type?: string | null
          id?: string
          is_read?: boolean
          message: string
          mobile?: string | null
          name: string
          organisation?: string | null
          subject?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          email?: string
          enquiry_type?: string | null
          id?: string
          is_read?: boolean
          message?: string
          mobile?: string | null
          name?: string
          organisation?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      repair_requests: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          brand: string | null
          city: string | null
          consent: boolean
          created_at: string
          customer_visible_note: string | null
          email: string
          equipment_category: string | null
          equipment_name: string
          estimated_cost: number | null
          full_name: string
          id: string
          mobile: string
          model_no: string | null
          organisation: string | null
          pickup_required: boolean | null
          preferred_contact: string | null
          problem_description: string
          request_code: string
          serial_no: string | null
          state: string | null
          status: Database["public"]["Enums"]["repair_status"]
          updated_at: string
          urgency: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          brand?: string | null
          city?: string | null
          consent?: boolean
          created_at?: string
          customer_visible_note?: string | null
          email: string
          equipment_category?: string | null
          equipment_name: string
          estimated_cost?: number | null
          full_name: string
          id?: string
          mobile: string
          model_no?: string | null
          organisation?: string | null
          pickup_required?: boolean | null
          preferred_contact?: string | null
          problem_description: string
          request_code: string
          serial_no?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["repair_status"]
          updated_at?: string
          urgency?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          brand?: string | null
          city?: string | null
          consent?: boolean
          created_at?: string
          customer_visible_note?: string | null
          email?: string
          equipment_category?: string | null
          equipment_name?: string
          estimated_cost?: number | null
          full_name?: string
          id?: string
          mobile?: string
          model_no?: string | null
          organisation?: string | null
          pickup_required?: boolean | null
          preferred_contact?: string | null
          problem_description?: string
          request_code?: string
          serial_no?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["repair_status"]
          updated_at?: string
          urgency?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      repair_status_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["repair_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id: string
          status: Database["public"]["Enums"]["repair_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["repair_status"]
        }
        Relationships: [
          {
            foreignKeyName: "repair_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "repair_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          carousel_images: Json
          category: string
          common_problems: string[]
          created_at: string
          detailed_description: string
          is_featured: boolean
          is_published: boolean
          name: string
          primary_image_id: string | null
          short_description: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          carousel_images?: Json
          category: string
          common_problems?: string[]
          created_at?: string
          detailed_description: string
          is_featured?: boolean
          is_published?: boolean
          name: string
          primary_image_id?: string | null
          short_description: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          carousel_images?: Json
          category?: string
          common_problems?: string[]
          created_at?: string
          detailed_description?: string
          is_featured?: boolean
          is_published?: boolean
          name?: string
          primary_image_id?: string | null
          short_description?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          city: string | null
          created_at: string
          customer_name: string
          feedback: string
          id: string
          is_approved: boolean
          is_featured: boolean
          is_sample: boolean
          organisation: string | null
          rating: number
          sort_order: number
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_name: string
          feedback: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_sample?: boolean
          organisation?: string | null
          rating?: number
          sort_order?: number
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_name?: string
          feedback?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_sample?: boolean
          organisation?: string | null
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_repair: {
        Args: { _code: string; _contact: string }
        Returns: {
          brand: string
          created_at: string
          customer_visible_note: string
          equipment_name: string
          full_name: string
          request_code: string
          status: Database["public"]["Enums"]["repair_status"]
          updated_at: string
        }[]
      }
      track_repair_history: {
        Args: { _code: string; _contact: string }
        Returns: {
          created_at: string
          note: string
          status: Database["public"]["Enums"]["repair_status"]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      repair_status:
        | "request_received"
        | "awaiting_equipment"
        | "equipment_received"
        | "under_inspection"
        | "quotation_sent"
        | "approval_pending"
        | "repair_in_progress"
        | "quality_testing"
        | "ready_for_dispatch"
        | "dispatched"
        | "completed"
        | "on_hold"
        | "cancelled"
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
      app_role: ["admin", "staff", "user"],
      repair_status: [
        "request_received",
        "awaiting_equipment",
        "equipment_received",
        "under_inspection",
        "quotation_sent",
        "approval_pending",
        "repair_in_progress",
        "quality_testing",
        "ready_for_dispatch",
        "dispatched",
        "completed",
        "on_hold",
        "cancelled",
      ],
    },
  },
} as const

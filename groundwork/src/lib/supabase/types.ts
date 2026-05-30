export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_inquiries: {
        Row: {
          admin_note: string | null
          budget_range: string | null
          client_id: string
          contractor_id: string
          created_at: string
          id: string
          message: string
          preferred_contact: string | null
          project_id: string | null
          resolved_at: string | null
          start_window: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          budget_range?: string | null
          client_id: string
          contractor_id: string
          created_at?: string
          id?: string
          message: string
          preferred_contact?: string | null
          project_id?: string | null
          resolved_at?: string | null
          start_window?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          budget_range?: string | null
          client_id?: string
          contractor_id?: string
          created_at?: string
          id?: string
          message?: string
          preferred_contact?: string | null
          project_id?: string | null
          resolved_at?: string | null
          start_window?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_inquiries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_inquiries_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_inquiries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_reviews: {
        Row: {
          body: string | null
          contractor_id: string
          created_at: string
          headline: string | null
          id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          body?: string | null
          contractor_id: string
          created_at?: string
          headline?: string | null
          id?: string
          rating: number
          reviewer_id: string
        }
        Update: {
          body?: string | null
          contractor_id?: string
          created_at?: string
          headline?: string | null
          id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          country: string
          created_at: string
          email: string | null
          id: string
          is_verified: boolean
          name: string
          phone: string | null
          portfolio_url: string | null
          primary_specialty: string
          rating: number
          region: string | null
          review_count: number
          specialties: string[]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          country: string
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name: string
          phone?: string | null
          portfolio_url?: string | null
          primary_specialty: string
          rating?: number
          region?: string | null
          review_count?: number
          specialties?: string[]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          primary_specialty?: string
          rating?: number
          region?: string | null
          review_count?: number
          specialties?: string[]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          created_at: string
          created_by: string
          document_id: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          document_id: string
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string
          document_id?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          project_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          project_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_id: string
          receipt_url: string | null
          recorded_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_id: string
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          project_id: string
          receipt_url: string | null
          recorded_by: string | null
          stage_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id: string
          receipt_url?: string | null
          recorded_by?: string | null
          stage_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          stage_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_disabled: boolean
          phone: string | null
          profile_completed: boolean
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_disabled?: boolean
          phone?: string | null
          profile_completed?: boolean
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_disabled?: boolean
          phone?: string | null
          profile_completed?: boolean
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          is_current: boolean
          mime_type: string | null
          name: string
          notes: string | null
          parent_id: string | null
          project_id: string
          stage_id: string | null
          uploaded_by: string
          version: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          is_current?: boolean
          mime_type?: string | null
          name: string
          notes?: string | null
          parent_id?: string | null
          project_id: string
          stage_id?: string | null
          uploaded_by: string
          version?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_current?: boolean
          mime_type?: string | null
          name?: string
          notes?: string | null
          parent_id?: string | null
          project_id?: string
          stage_id?: string | null
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_substages: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          evidence_urls: string[]
          id: string
          name: string
          notes: string | null
          project_id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_note: string | null
          requires_reupload: boolean
          stage_id: string
          status: string
          substage_number: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          evidence_urls?: string[]
          id?: string
          name: string
          notes?: string | null
          project_id: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_note?: string | null
          requires_reupload?: boolean
          stage_id: string
          status?: string
          substage_number: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          evidence_urls?: string[]
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_note?: string | null
          requires_reupload?: boolean
          stage_id?: string
          status?: string
          substage_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_substages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_substages_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_substages_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_professional_id: string | null
          boys_quarters_count: number
          budget: number | null
          budget_breakdown: Json | null
          building_type: string | null
          country: string
          created_at: string
          floors: number
          id: string
          is_demo: boolean
          name: string
          owner_id: string
          project_type: string
          roof_type: string | null
          rooms: Json
          status: string
          target_completion_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_professional_id?: string | null
          boys_quarters_count?: number
          budget?: number | null
          budget_breakdown?: Json | null
          building_type?: string | null
          country: string
          created_at?: string
          floors?: number
          id?: string
          is_demo?: boolean
          name: string
          owner_id: string
          project_type: string
          roof_type?: string | null
          rooms?: Json
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_professional_id?: string | null
          boys_quarters_count?: number
          budget?: number | null
          budget_breakdown?: Json | null
          building_type?: string | null
          country?: string
          created_at?: string
          floors?: number
          id?: string
          is_demo?: boolean
          name?: string
          owner_id?: string
          project_type?: string
          roof_type?: string | null
          rooms?: Json
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_professional_id_fkey"
            columns: ["assigned_professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_contractors: {
        Row: {
          contractor_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_contractors_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_contractors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_locked: boolean
          name: string
          payment_amount: number | null
          payment_percentage: number
          payment_status: string
          project_id: string
          stage_number: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          name: string
          payment_amount?: number | null
          payment_percentage: number
          payment_status?: string
          project_id: string
          stage_number: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          name?: string
          payment_amount?: number | null
          payment_percentage?: number
          payment_status?: string
          project_id?: string
          stage_number?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_body: string
          p_entity_id?: string
          p_entity_type?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "client"
        | "admin"
        | "super_admin"
        | "jala_professional"
        | "contractor"
      document_category:
        | "contract"
        | "permit"
        | "receipt"
        | "invoice"
        | "report"
        | "certificate"
        | "other"
      notification_type:
        | "stage_approved"
        | "stage_rejected"
        | "stage_submitted"
        | "substage_updated"
        | "payment_recorded"
        | "payment_released"
        | "contractor_invited"
        | "contractor_accepted"
        | "contractor_rejected"
        | "certificate_issued"
        | "project_created"
        | "message_received"
        | "system"
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
      app_role: [
        "client",
        "admin",
        "super_admin",
        "jala_professional",
        "contractor",
      ],
      document_category: [
        "contract",
        "permit",
        "receipt",
        "invoice",
        "report",
        "certificate",
        "other",
      ],
      notification_type: [
        "stage_approved",
        "stage_rejected",
        "stage_submitted",
        "substage_updated",
        "payment_recorded",
        "payment_released",
        "contractor_invited",
        "contractor_accepted",
        "contractor_rejected",
        "certificate_issued",
        "project_created",
        "message_received",
        "system",
      ],
    },
  },
} as const


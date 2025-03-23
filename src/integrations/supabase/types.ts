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
      ai_analysis_history: {
        Row: {
          created_at: string | null
          executed_sql: string | null
          full_result: Json | null
          id: string
          organization_id: string
          query_text: string
          result_summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          executed_sql?: string | null
          full_result?: Json | null
          id?: string
          organization_id: string
          query_text: string
          result_summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          executed_sql?: string | null
          full_result?: Json | null
          id?: string
          organization_id?: string
          query_text?: string
          result_summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge_index: {
        Row: {
          column_metadata: Json | null
          description: string
          entity_name: string
          entity_type: string
          id: string
          last_updated: string | null
          relationships: Json | null
          sample_queries: Json | null
          schema_name: string
        }
        Insert: {
          column_metadata?: Json | null
          description: string
          entity_name: string
          entity_type: string
          id?: string
          last_updated?: string | null
          relationships?: Json | null
          sample_queries?: Json | null
          schema_name?: string
        }
        Update: {
          column_metadata?: Json | null
          description?: string
          entity_name?: string
          entity_type?: string
          id?: string
          last_updated?: string | null
          relationships?: Json | null
          sample_queries?: Json | null
          schema_name?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          messages?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          created_at: string | null
          credentials: Json | null
          expires_at: string | null
          id: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          last_sync_at: string | null
          metadata: Json | null
          organization_id: string
          settings: Json | null
          status: Database["public"]["Enums"]["integration_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          expires_at?: string | null
          id?: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          expires_at?: string | null
          id?: string
          integration_type?: Database["public"]["Enums"]["integration_type"]
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          answers: Json | null
          created_at: string
          feedback: string | null
          id: string
          respondent_email: string | null
          score: number | null
          survey_id: string
          updated_at: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          respondent_email?: string | null
          score?: number | null
          survey_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          respondent_email?: string | null
          score?: number | null
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "nps_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_id: string
          settings: Json | null
          status: Database["public"]["Enums"]["survey_status"]
          title: string
          type: Database["public"]["Enums"]["survey_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["survey_status"]
          title: string
          type?: Database["public"]["Enums"]["survey_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["survey_status"]
          title?: string
          type?: Database["public"]["Enums"]["survey_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          settings: Json | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          settings?: Json | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          settings?: Json | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          company: string | null
          default_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean | null
          phone: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      organization_members_with_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      ai_query_data: {
        Args: {
          p_sql: string
          p_organization_id: string
          p_user_id: string
        }
        Returns: Json
      }
      calculate_nps_metrics: {
        Args: {
          survey_id: string
        }
        Returns: Json
      }
      create_dynamic_table: {
        Args: {
          p_table_name: string
          p_columns: Json
          p_organization_id: string
        }
        Returns: string
      }
      create_organization_with_owner:
        | {
            Args: {
              p_name: string
              p_slug: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_name: string
              p_slug: string
              p_user_id: string
              p_sector?: string
              p_city?: string
              p_state?: string
              p_description?: string
            }
            Returns: Json
          }
      get_ai_schema_summary: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_table_data:
        | {
            Args: {
              p_table_name: string
              p_organization_id: string
              p_row_limit?: number
            }
            Returns: Json
          }
        | {
            Args: {
              table_name: string
              row_limit?: number
            }
            Returns: Json
          }
      infer_column_type: {
        Args: {
          sample_value: string
          sample_data: Json
        }
        Returns: string
      }
      populate_ai_knowledge_index: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_table_rls: {
        Args: {
          schema_name: string
          table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      analysis_type:
        | "time_series"
        | "correlation"
        | "distribution"
        | "clustering"
        | "segmentation"
        | "forecasting"
        | "anomaly_detection"
      business_objective:
        | "increase_sales"
        | "improve_customer_satisfaction"
        | "expand_market"
        | "optimize_operations"
        | "reduce_costs"
        | "other"
      business_sector:
        | "retail"
        | "technology"
        | "manufacturing"
        | "services"
        | "healthcare"
        | "education"
        | "finance"
        | "other"
      file_type: "excel" | "csv" | "access" | "json"
      import_status:
        | "pending"
        | "uploading"
        | "uploaded"
        | "analyzing"
        | "editing"
        | "processing"
        | "completed"
        | "error"
      integration_status: "pending" | "active" | "error" | "disconnected"
      integration_type:
        | "google_business"
        | "google_analytics"
        | "salesforce"
        | "slack"
        | "facebook"
      processing_status: "pending" | "processing" | "completed" | "error"
      sales_channel:
        | "physical_store"
        | "e-commerce"
        | "marketplace"
        | "direct_sales"
        | "distributors"
        | "other"
      survey_status: "draft" | "active" | "inactive" | "archived"
      survey_type: "simple" | "detailed" | "advanced"
      user_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

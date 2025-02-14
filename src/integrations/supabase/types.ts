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
      column_mappings: {
        Row: {
          created_at: string | null
          data_type: string
          description: string | null
          file_id: string
          id: string
          mapped_name: string
          original_name: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          description?: string | null
          file_id: string
          id?: string
          mapped_name: string
          original_name: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          description?: string | null
          file_id?: string
          id?: string
          mapped_name?: string
          original_name?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "column_mappings_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "data_files_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_concentration: {
        Row: {
          city: string
          created_at: string | null
          customer_count: number
          id: string
          latitude: number
          longitude: number
          neighborhood: string
          organization_id: string
          state: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          customer_count: number
          id?: string
          latitude: number
          longitude: number
          neighborhood: string
          organization_id: string
          state: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          customer_count?: number
          id?: string
          latitude?: number
          longitude?: number
          neighborhood?: string
          organization_id?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_concentration_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_analysis_suggestions: {
        Row: {
          created_at: string | null
          data_import_id: string
          id: string
          organization_id: string
          selected_analyses: Json
          suggested_analyses: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_import_id: string
          id?: string
          organization_id: string
          selected_analyses?: Json
          suggested_analyses?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_import_id?: string
          id?: string
          organization_id?: string
          selected_analyses?: Json
          suggested_analyses?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_analysis_suggestions_data_import_id_fkey"
            columns: ["data_import_id"]
            isOneToOne: false
            referencedRelation: "data_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_analysis_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_files: {
        Row: {
          content_type: string
          created_at: string | null
          created_by: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          id: string
          last_analyzed_at: string | null
          organization_id: string
          preview_data: Json | null
          status: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          id?: string
          last_analyzed_at?: string | null
          organization_id: string
          preview_data?: Json | null
          status?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: Database["public"]["Enums"]["file_type"]
          id?: string
          last_analyzed_at?: string | null
          organization_id?: string
          preview_data?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_files_metadata: {
        Row: {
          columns_metadata: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          organization_id: string
          original_filename: string
          preview_data: Json | null
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          columns_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          organization_id: string
          original_filename: string
          preview_data?: Json | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          columns_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          organization_id?: string
          original_filename?: string
          preview_data?: Json | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_files_metadata_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_files_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_imports: {
        Row: {
          column_analysis: Json | null
          columns_metadata: Json
          created_at: string | null
          created_by: string | null
          data_quality: Json | null
          data_validation: Json | null
          error_message: string | null
          id: string
          name: string
          organization_id: string
          original_filename: string
          row_count: number | null
          status: Database["public"]["Enums"]["import_status"] | null
          suggested_indexes: Json | null
          table_name: string
        }
        Insert: {
          column_analysis?: Json | null
          columns_metadata?: Json
          created_at?: string | null
          created_by?: string | null
          data_quality?: Json | null
          data_validation?: Json | null
          error_message?: string | null
          id?: string
          name: string
          organization_id: string
          original_filename: string
          row_count?: number | null
          status?: Database["public"]["Enums"]["import_status"] | null
          suggested_indexes?: Json | null
          table_name: string
        }
        Update: {
          column_analysis?: Json | null
          columns_metadata?: Json
          created_at?: string | null
          created_by?: string | null
          data_quality?: Json | null
          data_validation?: Json | null
          error_message?: string | null
          id?: string
          name?: string
          organization_id?: string
          original_filename?: string
          row_count?: number | null
          status?: Database["public"]["Enums"]["import_status"] | null
          suggested_indexes?: Json | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      demographic_data: {
        Row: {
          age_distribution: Json | null
          city: string
          created_at: string | null
          education_levels: Json | null
          id: string
          income_distribution: Json | null
          organization_id: string
          state: string
          total_population: number
          updated_at: string | null
        }
        Insert: {
          age_distribution?: Json | null
          city: string
          created_at?: string | null
          education_levels?: Json | null
          id?: string
          income_distribution?: Json | null
          organization_id: string
          state: string
          total_population: number
          updated_at?: string | null
        }
        Update: {
          age_distribution?: Json | null
          city?: string
          created_at?: string | null
          education_levels?: Json | null
          id?: string
          income_distribution?: Json | null
          organization_id?: string
          state?: string
          total_population?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demographic_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          comment: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          respondent_email: string | null
          score: number
          sentiment: string | null
          survey_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          respondent_email?: string | null
          score: number
          sentiment?: string | null
          survey_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          respondent_email?: string | null
          score?: number
          sentiment?: string | null
          survey_id?: string
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
          created_at: string | null
          description: string | null
          id: string
          organization_id: string
          settings: Json | null
          status: Database["public"]["Enums"]["survey_status"]
          title: string
          type: Database["public"]["Enums"]["survey_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["survey_status"]
          title: string
          type?: Database["public"]["Enums"]["survey_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["survey_status"]
          title?: string
          type?: Database["public"]["Enums"]["survey_type"]
          updated_at?: string | null
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
      organization_profiles: {
        Row: {
          created_at: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          main_objectives: Database["public"]["Enums"]["business_objective"][]
          monthly_revenue_range: string | null
          organization_id: string
          region: string | null
          sales_channels: Database["public"]["Enums"]["sales_channel"][]
          sector: Database["public"]["Enums"]["business_sector"]
          target_market: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          main_objectives?: Database["public"]["Enums"]["business_objective"][]
          monthly_revenue_range?: string | null
          organization_id: string
          region?: string | null
          sales_channels?: Database["public"]["Enums"]["sales_channel"][]
          sector: Database["public"]["Enums"]["business_sector"]
          target_market?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          main_objectives?: Database["public"]["Enums"]["business_objective"][]
          monthly_revenue_range?: string | null
          organization_id?: string
          region?: string | null
          sales_channels?: Database["public"]["Enums"]["sales_channel"][]
          sector?: Database["public"]["Enums"]["business_sector"]
          target_market?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
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
          updated_at?: string | null
        }
        Relationships: []
      }
      suggested_analyses: {
        Row: {
          analysis_type: string
          created_at: string | null
          description: string | null
          file_id: string
          id: string
          metrics: Json | null
          status: string
          title: string
          visualization_type: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string | null
          description?: string | null
          file_id: string
          id?: string
          metrics?: Json | null
          status?: string
          title: string
          visualization_type?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string | null
          description?: string | null
          file_id?: string
          id?: string
          metrics?: Json | null
          status?: string
          title?: string
          visualization_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggested_analyses_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "data_files_metadata"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_nps_metrics: {
        Args: {
          survey_id: string
        }
        Returns: Json
      }
      create_organization_with_owner: {
        Args: {
          p_name: string
          p_slug: string
          p_user_id: string
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
      import_status: "pending" | "processing" | "completed" | "error"
      integration_status: "pending" | "active" | "error" | "disconnected"
      integration_type:
        | "google_business"
        | "google_analytics"
        | "salesforce"
        | "slack"
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

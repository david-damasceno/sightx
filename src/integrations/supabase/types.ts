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
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
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
    }
    Enums: {
      file_type: "excel" | "csv" | "access" | "json"
      integration_status: "pending" | "active" | "error" | "disconnected"
      integration_type:
        | "google_business"
        | "google_analytics"
        | "salesforce"
        | "slack"
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

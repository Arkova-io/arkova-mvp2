export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      anchors: {
        Row: {
          chain_block_height: number | null
          chain_timestamp: string | null
          chain_tx_id: string | null
          created_at: string
          deleted_at: string | null
          file_mime: string | null
          file_size: number | null
          filename: string
          fingerprint: string
          id: string
          legal_hold: boolean
          org_id: string | null
          retention_until: string | null
          status: Database["public"]["Enums"]["anchor_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_block_height?: number | null
          chain_timestamp?: string | null
          chain_tx_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_mime?: string | null
          file_size?: number | null
          filename: string
          fingerprint: string
          id?: string
          legal_hold?: boolean
          org_id?: string | null
          retention_until?: string | null
          status?: Database["public"]["Enums"]["anchor_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_block_height?: number | null
          chain_timestamp?: string | null
          chain_tx_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_mime?: string | null
          file_size?: number | null
          filename?: string
          fingerprint?: string
          id?: string
          legal_hold?: boolean
          org_id?: string | null
          retention_until?: string | null
          status?: Database["public"]["Enums"]["anchor_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anchors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anchors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          actor_ip: unknown | null
          actor_user_agent: string | null
          created_at: string
          details: string | null
          event_category: string
          event_type: string
          id: string
          org_id: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown | null
          actor_user_agent?: string | null
          created_at?: string
          details?: string | null
          event_category: string
          event_type: string
          id?: string
          org_id?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown | null
          actor_user_agent?: string | null
          created_at?: string
          details?: string | null
          event_category?: string
          event_type?: string
          id?: string
          org_id?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          display_name: string
          domain: string | null
          id: string
          legal_name: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          display_name: string
          domain?: string | null
          id?: string
          legal_name: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          domain?: string | null
          id?: string
          legal_name?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          manual_review_completed_at: string | null
          manual_review_completed_by: string | null
          manual_review_reason: string | null
          org_id: string | null
          requires_manual_review: boolean
          role: Database["public"]["Enums"]["user_role"] | null
          role_set_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          manual_review_completed_at?: string | null
          manual_review_completed_by?: string | null
          manual_review_reason?: string | null
          org_id?: string | null
          requires_manual_review?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          role_set_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          manual_review_completed_at?: string | null
          manual_review_completed_by?: string | null
          manual_review_reason?: string | null
          org_id?: string | null
          requires_manual_review?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          role_set_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_org_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      anchor_status: "PENDING" | "SECURED" | "REVOKED"
      user_role: "INDIVIDUAL" | "ORG_ADMIN"
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


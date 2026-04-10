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
      leaderboard: {
        Row: {
          best_score: number
          created_at: string
          division: Database["public"]["Enums"]["pearl_division"]
          id: string
          matches_played: number
          period: string
          player_id: string
          rank: number | null
          total_score: number
          updated_at: string
          validated: boolean
        }
        Insert: {
          best_score?: number
          created_at?: string
          division?: Database["public"]["Enums"]["pearl_division"]
          id?: string
          matches_played?: number
          period: string
          player_id: string
          rank?: number | null
          total_score?: number
          updated_at?: string
          validated?: boolean
        }
        Update: {
          best_score?: number
          created_at?: string
          division?: Database["public"]["Enums"]["pearl_division"]
          id?: string
          matches_played?: number
          period?: string
          player_id?: string
          rank?: number | null
          total_score?: number
          updated_at?: string
          validated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_logs: {
        Row: {
          anti_cheat_flags: Json
          combo_efficiency: number
          ended_at: string
          id: string
          is_flagged: boolean
          level_reached: number
          lines_cleared: number
          max_combo: number
          omni_color_count: number
          player_id: string
          score: number
          started_at: string
          survival_time_seconds: number
        }
        Insert: {
          anti_cheat_flags?: Json
          combo_efficiency?: number
          ended_at?: string
          id?: string
          is_flagged?: boolean
          level_reached?: number
          lines_cleared?: number
          max_combo?: number
          omni_color_count?: number
          player_id: string
          score?: number
          started_at?: string
          survival_time_seconds?: number
        }
        Update: {
          anti_cheat_flags?: Json
          combo_efficiency?: number
          ended_at?: string
          id?: string
          is_flagged?: boolean
          level_reached?: number
          lines_cleared?: number
          max_combo?: number
          omni_color_count?: number
          player_id?: string
          score?: number
          started_at?: string
          survival_time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_logs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          display_name: string
          division: Database["public"]["Enums"]["pearl_division"]
          division_points: number
          id: string
          is_banned: boolean
          total_matches: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          division?: Database["public"]["Enums"]["pearl_division"]
          division_points?: number
          id?: string
          is_banned?: boolean
          total_matches?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          division?: Database["public"]["Enums"]["pearl_division"]
          division_points?: number
          id?: string
          is_banned?: boolean
          total_matches?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_payouts: {
        Row: {
          created_at: string
          division: Database["public"]["Enums"]["pearl_division"]
          exported_at: string | null
          id: string
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          player_id: string
          rank: number
          reward_amount_cents: number
          reward_period_id: string
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          created_at?: string
          division: Database["public"]["Enums"]["pearl_division"]
          exported_at?: string | null
          id?: string
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          player_id: string
          rank: number
          reward_amount_cents?: number
          reward_period_id: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          created_at?: string
          division?: Database["public"]["Enums"]["pearl_division"]
          exported_at?: string | null
          id?: string
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          player_id?: string
          rank?: number
          reward_amount_cents?: number
          reward_period_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reward_payouts_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_payouts_reward_period_id_fkey"
            columns: ["reward_period_id"]
            isOneToOne: false
            referencedRelation: "reward_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_periods: {
        Row: {
          created_at: string
          finalized_at: string | null
          id: string
          period: string
          status: Database["public"]["Enums"]["reward_period_status"]
        }
        Insert: {
          created_at?: string
          finalized_at?: string | null
          id?: string
          period: string
          status?: Database["public"]["Enums"]["reward_period_status"]
        }
        Update: {
          created_at?: string
          finalized_at?: string | null
          id?: string
          period?: string
          status?: Database["public"]["Enums"]["reward_period_status"]
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payout_method: "stripe" | "coinbase" | "circle" | "thirdweb"
      payout_status: "pending" | "approved" | "exported" | "paid"
      pearl_division:
        | "pearl_v"
        | "pearl_iv"
        | "pearl_iii"
        | "pearl_ii"
        | "pearl_i"
      reward_period_status: "open" | "validating" | "finalized"
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
      app_role: ["admin", "moderator", "user"],
      payout_method: ["stripe", "coinbase", "circle", "thirdweb"],
      payout_status: ["pending", "approved", "exported", "paid"],
      pearl_division: [
        "pearl_v",
        "pearl_iv",
        "pearl_iii",
        "pearl_ii",
        "pearl_i",
      ],
      reward_period_status: ["open", "validating", "finalized"],
    },
  },
} as const

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
      card_energy: {
        Row: {
          card_id: string
          energy: number
          id: string
          last_reset_at: string
          max_energy: number
          next_reset_at: string | null
        }
        Insert: {
          card_id: string
          energy?: number
          id?: string
          last_reset_at?: string
          max_energy?: number
          next_reset_at?: string | null
        }
        Update: {
          card_id?: string
          energy?: number
          id?: string
          last_reset_at?: string
          max_energy?: number
          next_reset_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_energy_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          color_hex: string
          contract_standard: string
          created_at: string | null
          division: Database["public"]["Enums"]["gem_division"]
          flavor_text: string
          id: string
          image_url: string | null
          is_active: boolean
          max_supply: number | null
          metadata: Json | null
          name: string
          owner_player_id: string | null
          owner_wallet: string | null
          price_cents: number
          sale_lock_until: string | null
          token_id: number
        }
        Insert: {
          color_hex: string
          contract_standard?: string
          created_at?: string | null
          division: Database["public"]["Enums"]["gem_division"]
          flavor_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_supply?: number | null
          metadata?: Json | null
          name: string
          owner_player_id?: string | null
          owner_wallet?: string | null
          price_cents?: number
          sale_lock_until?: string | null
          token_id: number
        }
        Update: {
          color_hex?: string
          contract_standard?: string
          created_at?: string | null
          division?: Database["public"]["Enums"]["gem_division"]
          flavor_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_supply?: number | null
          metadata?: Json | null
          name?: string
          owner_player_id?: string | null
          owner_wallet?: string | null
          price_cents?: number
          sale_lock_until?: string | null
          token_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "gems_owner_player_id_fkey"
            columns: ["owner_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          card_id: string | null
          completed: boolean
          cooldown_until: string | null
          id: string
          player_id: string
          seed: string
          started_at: string
        }
        Insert: {
          card_id?: string | null
          completed?: boolean
          cooldown_until?: string | null
          id?: string
          player_id: string
          seed: string
          started_at?: string
        }
        Update: {
          card_id?: string | null
          completed?: boolean
          cooldown_until?: string | null
          id?: string
          player_id?: string
          seed?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          avg_top3_score: number
          best_score: number
          created_at: string
          division: Database["public"]["Enums"]["gem_division"]
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
          avg_top3_score?: number
          best_score?: number
          created_at?: string
          division?: Database["public"]["Enums"]["gem_division"]
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
          avg_top3_score?: number
          best_score?: number
          created_at?: string
          division?: Database["public"]["Enums"]["gem_division"]
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
      marketplace_listings: {
        Row: {
          buyer_player_id: string | null
          card_id: string
          fee_percent: number
          id: string
          listed_at: string
          price_cents: number
          seller_player_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          buyer_player_id?: string | null
          card_id: string
          fee_percent?: number
          id?: string
          listed_at?: string
          price_cents: number
          seller_player_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          buyer_player_id?: string | null
          card_id?: string
          fee_percent?: number
          id?: string
          listed_at?: string
          price_cents?: number
          seller_player_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_buyer_player_id_fkey"
            columns: ["buyer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_player_id_fkey"
            columns: ["seller_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_logs: {
        Row: {
          anti_cheat_flags: Json
          card_id: string | null
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
          session_id: string | null
          session_seed: string | null
          started_at: string
          survival_time_seconds: number
        }
        Insert: {
          anti_cheat_flags?: Json
          card_id?: string | null
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
          session_id?: string | null
          session_seed?: string | null
          started_at?: string
          survival_time_seconds?: number
        }
        Update: {
          anti_cheat_flags?: Json
          card_id?: string | null
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
          session_id?: string | null
          session_seed?: string | null
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
      player_energy: {
        Row: {
          energy: number | null
          id: string
          last_reset_at: string | null
          max_energy: number | null
          player_id: string
        }
        Insert: {
          energy?: number | null
          id?: string
          last_reset_at?: string | null
          max_energy?: number | null
          player_id: string
        }
        Update: {
          energy?: number | null
          id?: string
          last_reset_at?: string | null
          max_energy?: number | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_energy_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          active_card_id: string | null
          created_at: string
          display_name: string
          division: Database["public"]["Enums"]["gem_division"]
          division_points: number
          id: string
          is_banned: boolean
          main_card_id: string | null
          total_matches: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          active_card_id?: string | null
          created_at?: string
          display_name?: string
          division?: Database["public"]["Enums"]["gem_division"]
          division_points?: number
          id?: string
          is_banned?: boolean
          main_card_id?: string | null
          total_matches?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          active_card_id?: string | null
          created_at?: string
          display_name?: string
          division?: Database["public"]["Enums"]["gem_division"]
          division_points?: number
          id?: string
          is_banned?: boolean
          main_card_id?: string | null
          total_matches?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      reward_payouts: {
        Row: {
          created_at: string
          division: Database["public"]["Enums"]["gem_division"]
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
          division: Database["public"]["Enums"]["gem_division"]
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
          division?: Database["public"]["Enums"]["gem_division"]
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
          ends_at: string | null
          finalized_at: string | null
          freeze_ends_at: string | null
          id: string
          payout_at: string | null
          period: string
          starts_at: string | null
          status: Database["public"]["Enums"]["reward_period_status"]
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          finalized_at?: string | null
          freeze_ends_at?: string | null
          id?: string
          payout_at?: string | null
          period: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["reward_period_status"]
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          finalized_at?: string | null
          freeze_ends_at?: string | null
          id?: string
          payout_at?: string | null
          period?: string
          starts_at?: string | null
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
      gem_division: "gem_v" | "gem_iv" | "gem_iii" | "gem_ii" | "gem_i"
      payout_method: "stripe" | "coinbase" | "circle" | "thirdweb"
      payout_status: "pending" | "approved" | "exported" | "paid"
      reward_period_status:
        | "open"
        | "validating"
        | "finalized"
        | "frozen"
        | "pending_payout"
        | "paid"
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
      gem_division: ["gem_v", "gem_iv", "gem_iii", "gem_ii", "gem_i"],
      payout_method: ["stripe", "coinbase", "circle", "thirdweb"],
      payout_status: ["pending", "approved", "exported", "paid"],
      reward_period_status: [
        "open",
        "validating",
        "finalized",
        "frozen",
        "pending_payout",
        "paid",
      ],
    },
  },
} as const

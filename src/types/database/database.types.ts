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
      accumulators: {
        Row: {
          back_odds: number
          back_stake: number
          bet_category: Database["public"]["Enums"]["bet_categories"]
          created_at: string
          id: string
          lay_odds: number
          lay_stake: number
          liability: number
          offer_id: string
          settled: boolean
        }
        Insert: {
          back_odds: number
          back_stake: number
          bet_category?: Database["public"]["Enums"]["bet_categories"]
          created_at?: string
          id?: string
          lay_odds: number
          lay_stake: number
          liability: number
          offer_id: string
          settled?: boolean
        }
        Update: {
          back_odds?: number
          back_stake?: number
          bet_category?: Database["public"]["Enums"]["bet_categories"]
          created_at?: string
          id?: string
          lay_odds?: number
          lay_stake?: number
          liability?: number
          offer_id?: string
          settled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "accumulators_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "bookmaker_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          accumulator_id: string | null
          back_odds: number | null
          back_stake: number | null
          bet_category: Database["public"]["Enums"]["bet_categories"]
          created_at: string
          id: string
          lay_odds: number | null
          lay_stake: number | null
          liability: number | null
          match_id: string
          offer_id: string
          outcome: Database["public"]["Enums"]["outcomes"]
          settled: boolean
        }
        Insert: {
          accumulator_id?: string | null
          back_odds?: number | null
          back_stake?: number | null
          bet_category: Database["public"]["Enums"]["bet_categories"]
          created_at?: string
          id?: string
          lay_odds?: number | null
          lay_stake?: number | null
          liability?: number | null
          match_id: string
          offer_id: string
          outcome: Database["public"]["Enums"]["outcomes"]
          settled?: boolean
        }
        Update: {
          accumulator_id?: string | null
          back_odds?: number | null
          back_stake?: number | null
          bet_category?: Database["public"]["Enums"]["bet_categories"]
          created_at?: string
          id?: string
          lay_odds?: number | null
          lay_stake?: number | null
          liability?: number | null
          match_id?: string
          offer_id?: string
          outcome?: Database["public"]["Enums"]["outcomes"]
          settled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bets_accumulator_id_fkey"
            columns: ["accumulator_id"]
            isOneToOne: false
            referencedRelation: "accumulators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "bookmaker_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmaker_offers: {
        Row: {
          bookmaker_id: string
          created_at: string
          description: string
          expires_in_days: number | null
          free_bet_amount: number
          id: string
          qualifying_bet_amount: number
          started_date: string | null
          terms_and_conditions: string
        }
        Insert: {
          bookmaker_id: string
          created_at?: string
          description: string
          expires_in_days?: number | null
          free_bet_amount: number
          id?: string
          qualifying_bet_amount: number
          started_date?: string | null
          terms_and_conditions: string
        }
        Update: {
          bookmaker_id?: string
          created_at?: string
          description?: string
          expires_in_days?: number | null
          free_bet_amount?: number
          id?: string
          qualifying_bet_amount?: number
          started_date?: string | null
          terms_and_conditions?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmaker_offers_bookmaker_id_fkey"
            columns: ["bookmaker_id"]
            isOneToOne: false
            referencedRelation: "bookmakers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmakers: {
        Row: {
          created_at: string
          id: string
          initial_balance: number | null
          logo: string
          name: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_balance?: number | null
          logo: string
          name: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_balance?: number | null
          logo?: string
          name?: string
          url?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_team: string
          created_at: string
          home_team: string
          id: string
          match_date: string
          outcome: Database["public"]["Enums"]["outcomes"] | null
        }
        Insert: {
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          match_date: string
          outcome?: Database["public"]["Enums"]["outcomes"] | null
        }
        Update: {
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          match_date?: string
          outcome?: Database["public"]["Enums"]["outcomes"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bet_categories: "QUALIFYING" | "FREE"
      bet_sides: "BACK" | "LAY"
      bet_types: "SINGLE" | "ACCUMULATOR"
      outcomes: "HOME" | "DRAW" | "AWAY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bet_categories: ["QUALIFYING", "FREE"],
      bet_sides: ["BACK", "LAY"],
      bet_types: ["SINGLE", "ACCUMULATOR"],
      outcomes: ["HOME", "DRAW", "AWAY"],
    },
  },
} as const


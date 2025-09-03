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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          is_modelo: boolean | null
          numero_parcelas: number | null
          observacoes: string | null
          pago: boolean | null
          parcela_atual: number | null
          tipo: string | null
          updated_at: string
          user_id: string
          valor: number
          valor_total: number | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          is_modelo?: boolean | null
          numero_parcelas?: number | null
          observacoes?: string | null
          pago?: boolean | null
          parcela_atual?: number | null
          tipo?: string | null
          updated_at?: string
          user_id: string
          valor: number
          valor_total?: number | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          is_modelo?: boolean | null
          numero_parcelas?: number | null
          observacoes?: string | null
          pago?: boolean | null
          parcela_atual?: number | null
          tipo?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "despesas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria_id: string | null
          created_at: string
          data_recebimento: string
          descricao: string
          id: string
          observacoes: string | null
          recebido: boolean | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data_recebimento: string
          descricao: string
          id?: string
          observacoes?: string | null
          recebido?: boolean | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data_recebimento?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          recebido?: boolean | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string | null
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

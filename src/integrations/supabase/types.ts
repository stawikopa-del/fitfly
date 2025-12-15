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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          event_date: string
          event_time: string
          id: string
          reminder_minutes: number | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_time: string
          id?: string
          reminder_minutes?: number | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_time?: string
          id?: string
          reminder_minutes?: number | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          current: number | null
          description: string | null
          duration_days: number
          end_date: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          is_custom: boolean | null
          points: number | null
          start_date: string | null
          target: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current?: number | null
          description?: string | null
          duration_days: number
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          is_custom?: boolean | null
          points?: number | null
          start_date?: string | null
          target: number
          title: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current?: number | null
          description?: string | null
          duration_days?: number
          end_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          is_custom?: boolean | null
          points?: number | null
          start_date?: string | null
          target?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_summaries: {
        Row: {
          created_at: string
          id: string
          key_points: string[] | null
          mood: string | null
          questions_asked: string[] | null
          summary: string
          summary_date: string
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_points?: string[] | null
          mood?: string | null
          questions_asked?: string[] | null
          summary: string
          summary_date: string
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_points?: string[] | null
          mood?: string | null
          questions_asked?: string[] | null
          summary?: string
          summary_date?: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          active_minutes: number
          created_at: string
          id: string
          progress_date: string
          steps: number
          updated_at: string
          user_id: string
          water: number
        }
        Insert: {
          active_minutes?: number
          created_at?: string
          id?: string
          progress_date?: string
          steps?: number
          updated_at?: string
          user_id: string
          water?: number
        }
        Update: {
          active_minutes?: number
          created_at?: string
          id?: string
          progress_date?: string
          steps?: number
          updated_at?: string
          user_id?: string
          water?: number
        }
        Relationships: []
      }
      day_plans: {
        Row: {
          category: string
          created_at: string
          id: string
          is_completed: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          notes: string | null
          order_index: number
          plan_date: string
          priority: string
          recurrence: string | null
          time: string | null
          time_of_day: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          notes?: string | null
          order_index?: number
          plan_date?: string
          priority?: string
          recurrence?: string | null
          time?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          notes?: string | null
          order_index?: number
          plan_date?: string
          priority?: string
          recurrence?: string | null
          time?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          reactions: Json | null
          read_at: string | null
          receiver_id: string
          recipe_data: Json | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          reactions?: Json | null
          read_at?: string | null
          receiver_id: string
          recipe_data?: Json | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          reactions?: Json | null
          read_at?: string | null
          receiver_id?: string
          recipe_data?: Json | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_recipes: {
        Row: {
          created_at: string
          id: string
          recipe_data: Json
          recipe_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_data: Json
          recipe_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_data?: Json
          recipe_name?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_shopping_lists: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          created_at: string
          entry_1: string | null
          entry_2: string | null
          entry_3: string | null
          entry_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_1?: string | null
          entry_2?: string | null
          entry_3?: string | null
          entry_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_1?: string | null
          entry_2?: string | null
          entry_3?: string | null
          entry_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed_value: number | null
          created_at: string
          habit_id: string
          id: string
          is_completed: boolean | null
          log_date: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_value?: number | null
          created_at?: string
          habit_id: string
          id?: string
          is_completed?: boolean | null
          log_date?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_value?: number | null
          created_at?: string
          habit_id?: string
          id?: string
          is_completed?: boolean | null
          log_date?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string
          color: string | null
          created_at: string
          cue: string | null
          description: string | null
          frequency: string
          habit_stack_after: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          reminder_enabled: boolean | null
          reminder_time: string | null
          reward: string | null
          streak_best: number | null
          streak_current: number | null
          target_value: number | null
          title: string
          total_completions: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          cue?: string | null
          description?: string | null
          frequency?: string
          habit_stack_after?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          reward?: string | null
          streak_best?: number | null
          streak_current?: number | null
          target_value?: number | null
          title: string
          total_completions?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          cue?: string | null
          description?: string | null
          frequency?: string
          habit_stack_after?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          reminder_time?: string | null
          reward?: string | null
          streak_best?: number | null
          streak_current?: number | null
          target_value?: number | null
          title?: string
          total_completions?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          meal_date: string
          name: string
          protein: number
          time: string | null
          type: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          meal_date?: string
          name: string
          protein?: number
          time?: string | null
          type: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          meal_date?: string
          name?: string
          protein?: number
          time?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_calories: number | null
          daily_steps_goal: number | null
          daily_water: number | null
          display_name: string | null
          gender: string | null
          goal: string | null
          goal_weight: number | null
          height: number | null
          id: string
          meal_schedule: Json | null
          meals_count: number | null
          sound_theme: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_steps_goal?: number | null
          daily_water?: number | null
          display_name?: string | null
          gender?: string | null
          goal?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          meal_schedule?: Json | null
          meals_count?: number | null
          sound_theme?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_steps_goal?: number | null
          daily_water?: number | null
          display_name?: string | null
          gender?: string | null
          goal?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          meal_schedule?: Json | null
          meals_count?: number | null
          sound_theme?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      saved_diet_plans: {
        Row: {
          created_at: string
          daily_calories: number
          diet_type: string
          id: string
          name: string
          plan_data: Json
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_calories: number
          diet_type: string
          id?: string
          name?: string
          plan_data: Json
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_calories?: number
          diet_type?: string
          id?: string
          name?: string
          plan_data?: Json
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_challenges: {
        Row: {
          challenge_id: string | null
          created_at: string
          id: string
          owner_id: string
          shared_with_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          shared_with_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          shared_with_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_recipes: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          owner_id: string
          recipe_id: string | null
          share_token: string | null
          shared_with_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          owner_id: string
          recipe_id?: string | null
          share_token?: string | null
          shared_with_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          owner_id?: string
          recipe_id?: string | null
          share_token?: string | null
          shared_with_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "favorite_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_shopping_lists: {
        Row: {
          comments: Json | null
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          id: string
          items: Json
          notes: string | null
          owner_id: string
          reactions: Json | null
          shared_with_id: string
        }
        Insert: {
          comments?: Json | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          items?: Json
          notes?: string | null
          owner_id: string
          reactions?: Json | null
          shared_with_id: string
        }
        Update: {
          comments?: Json | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          items?: Json
          notes?: string | null
          owner_id?: string
          reactions?: Json | null
          shared_with_id?: string
        }
        Relationships: []
      }
      shopping_list_checked: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean
          item_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean
          item_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean
          item_name?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          is_checked: boolean
          is_custom: boolean
          name: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          is_checked?: boolean
          is_custom?: boolean
          name?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          current_level: number
          daily_login_streak: number
          id: string
          last_login_date: string | null
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          daily_login_streak?: number
          id?: string
          last_login_date?: string | null
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          daily_login_streak?: number
          id?: string
          last_login_date?: string | null
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          measurement_date: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          measurement_date?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          measurement_date?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          shopify_customer_id: string | null
          shopify_order_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          shopify_customer_id?: string | null
          shopify_order_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          shopify_customer_id?: string | null
          shopify_order_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_friend_activity_stats: {
        Args: { friend_user_id: string }
        Returns: {
          days_tracked: number
          total_active_minutes: number
          total_steps: number
          total_water: number
        }[]
      }
      get_friend_profile: {
        Args: { friend_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          gender: string
          user_id: string
          username: string
        }[]
      }
      get_user_subscription_tier: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["subscription_tier"]
      }
      is_friend_with: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      search_profiles: {
        Args: { search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          username: string
        }[]
      }
    }
    Enums: {
      badge_type:
        | "pierwszy_krok"
        | "wodny_wojownik"
        | "maratonczyk"
        | "konsekwentny"
        | "mistrz_nawykow"
        | "dietetyk"
        | "niezniszczalny"
        | "stuprocentowy"
        | "wczesny_ptaszek"
        | "nocny_marek"
        | "zelazna_wola"
        | "zdrowy_duch"
        | "fit_guru"
        | "legenda"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      subscription_tier: "start" | "fit" | "premium"
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
      badge_type: [
        "pierwszy_krok",
        "wodny_wojownik",
        "maratonczyk",
        "konsekwentny",
        "mistrz_nawykow",
        "dietetyk",
        "niezniszczalny",
        "stuprocentowy",
        "wczesny_ptaszek",
        "nocny_marek",
        "zelazna_wola",
        "zdrowy_duch",
        "fit_guru",
        "legenda",
      ],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      subscription_tier: ["start", "fit", "premium"],
    },
  },
} as const

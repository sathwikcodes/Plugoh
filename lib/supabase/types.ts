export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      campaigns: {
        Row: {
          advance_amount: number | null;
          brief: string | null;
          business_contact_email: string | null;
          business_contact_phone: string | null;
          business_id: string;
          created_at: string;
          id: string;
          influencer_id: string;
          influencer_profile_id: string | null;
          package_type: string | null;
          price_offered: number | null;
          status: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          advance_amount?: number | null;
          brief?: string | null;
          business_contact_email?: string | null;
          business_contact_phone?: string | null;
          business_id: string;
          created_at?: string;
          id?: string;
          influencer_id: string;
          influencer_profile_id?: string | null;
          package_type?: string | null;
          price_offered?: number | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          advance_amount?: number | null;
          brief?: string | null;
          business_contact_email?: string | null;
          business_contact_phone?: string | null;
          business_id?: string;
          created_at?: string;
          id?: string;
          influencer_id?: string;
          influencer_profile_id?: string | null;
          package_type?: string | null;
          price_offered?: number | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_influencer_profile_id_fkey";
            columns: ["influencer_profile_id"];
            isOneToOne: false;
            referencedRelation: "influencer_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      influencer_profiles: {
        Row: {
          access_token: string | null;
          avg_likes_per_reel: number | null;
          avg_views_per_reel: number | null;
          bio: string | null;
          category: string | null;
          city: string | null;
          created_at: string;
          display_name: string | null;
          follower_count: number | null;
          id: string;
          ig_biography: string | null;
          ig_followers_count: number | null;
          ig_follows_count: number | null;
          ig_media_count: number | null;
          ig_profile_picture_url: string | null;
          ig_user_id: string | null;
          ig_username: string | null;
          instagram_handle: string | null;
          instagram_url: string | null;
          is_active: boolean | null;
          languages: string[] | null;
          price_per_post: number | null;
          price_per_reel: number | null;
          price_per_story: number | null;
          token_expires_at: string | null;
          user_id: string;
        };
        Insert: {
          access_token?: string | null;
          avg_likes_per_reel?: number | null;
          avg_views_per_reel?: number | null;
          bio?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string | null;
          follower_count?: number | null;
          id?: string;
          ig_biography?: string | null;
          ig_followers_count?: number | null;
          ig_follows_count?: number | null;
          ig_media_count?: number | null;
          ig_profile_picture_url?: string | null;
          ig_user_id?: string | null;
          ig_username?: string | null;
          instagram_handle?: string | null;
          instagram_url?: string | null;
          is_active?: boolean | null;
          languages?: string[] | null;
          price_per_post?: number | null;
          price_per_reel?: number | null;
          price_per_story?: number | null;
          token_expires_at?: string | null;
          user_id: string;
        };
        Update: {
          access_token?: string | null;
          avg_likes_per_reel?: number | null;
          avg_views_per_reel?: number | null;
          bio?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string | null;
          follower_count?: number | null;
          id?: string;
          ig_biography?: string | null;
          ig_followers_count?: number | null;
          ig_follows_count?: number | null;
          ig_media_count?: number | null;
          ig_profile_picture_url?: string | null;
          ig_user_id?: string | null;
          ig_username?: string | null;
          instagram_handle?: string | null;
          instagram_url?: string | null;
          is_active?: boolean | null;
          languages?: string[] | null;
          price_per_post?: number | null;
          price_per_reel?: number | null;
          price_per_story?: number | null;
          token_expires_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      instagram_media: {
        Row: {
          caption: string | null;
          engagement: number | null;
          id: string;
          ig_media_id: string;
          impressions: number | null;
          like_count: number | null;
          media_type: string | null;
          media_url: string | null;
          comments_count: number | null;
          permalink: string | null;
          reach: number | null;
          saves: number | null;
          synced_at: string;
          thumbnail_url: string | null;
          timestamp: string | null;
          user_id: string;
          video_views: number | null;
        };
        Insert: {
          caption?: string | null;
          engagement?: number | null;
          id?: string;
          ig_media_id: string;
          impressions?: number | null;
          like_count?: number | null;
          media_type?: string | null;
          media_url?: string | null;
          comments_count?: number | null;
          permalink?: string | null;
          reach?: number | null;
          saves?: number | null;
          synced_at?: string;
          thumbnail_url?: string | null;
          timestamp?: string | null;
          user_id: string;
          video_views?: number | null;
        };
        Update: {
          caption?: string | null;
          engagement?: number | null;
          id?: string;
          ig_media_id?: string;
          impressions?: number | null;
          like_count?: number | null;
          media_type?: string | null;
          media_url?: string | null;
          comments_count?: number | null;
          permalink?: string | null;
          reach?: number | null;
          saves?: number | null;
          synced_at?: string;
          thumbnail_url?: string | null;
          timestamp?: string | null;
          user_id?: string;
          video_views?: number | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json | null;
          id: string;
          read: boolean | null;
          type: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          read?: boolean | null;
          type?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          read?: boolean | null;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          location: string | null;
          phone: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          location?: string | null;
          phone?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "business" | "influencer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["business", "influencer"],
    },
  },
} as const;

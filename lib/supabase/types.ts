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
      campaign_messages: {
        Row: {
          id: string;
          campaign_id: string;
          sender_id: string;
          message_type: string;
          content: string | null;
          metadata: Json | null;
          read_by: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          sender_id: string;
          message_type?: string;
          content?: string | null;
          metadata?: Json | null;
          read_by?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          sender_id?: string;
          message_type?: string;
          content?: string | null;
          metadata?: Json | null;
          read_by?: string[] | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_files: {
        Row: {
          id: string;
          campaign_id: string;
          message_id: string | null;
          uploaded_by: string;
          file_name: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          file_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          message_id?: string | null;
          uploaded_by: string;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          file_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          message_id?: string | null;
          uploaded_by?: string;
          file_name?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          file_type?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_files_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_files_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "campaign_messages";
            referencedColumns: ["id"];
          },
        ];
      };
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
          // Payment fields
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_method: string | null;
          payment_status: string | null;
          platform_fee_amount: number | null;
          total_charged_amount: number | null;
          // Timeline fields
          accepted_at: string | null;
          payment_captured_at: string | null;
          delivery_submitted_at: string | null;
          completed_at: string | null;
          expires_at: string | null;
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
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          platform_fee_amount?: number | null;
          total_charged_amount?: number | null;
          accepted_at?: string | null;
          payment_captured_at?: string | null;
          delivery_submitted_at?: string | null;
          completed_at?: string | null;
          expires_at?: string | null;
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
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          platform_fee_amount?: number | null;
          total_charged_amount?: number | null;
          accepted_at?: string | null;
          payment_captured_at?: string | null;
          delivery_submitted_at?: string | null;
          completed_at?: string | null;
          expires_at?: string | null;
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
      deliveries: {
        Row: {
          id: string;
          campaign_id: string;
          submitted_by: string;
          content_url: string;
          notes: string | null;
          submitted_at: string;
          approved_at: string | null;
          approved_by: string | null;
          dispute_reason: string | null;
          disputed_at: string | null;
          admin_resolved_at: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          submitted_by: string;
          content_url: string;
          notes?: string | null;
          submitted_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          dispute_reason?: string | null;
          disputed_at?: string | null;
          admin_resolved_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          submitted_by?: string;
          content_url?: string;
          notes?: string | null;
          submitted_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          dispute_reason?: string | null;
          disputed_at?: string | null;
          admin_resolved_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      escrow_transactions: {
        Row: {
          id: string;
          campaign_id: string;
          type: string;
          amount_paise: number;
          platform_fee_paise: number | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_payout_id: string | null;
          razorpay_refund_id: string | null;
          status: string;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          type: string;
          amount_paise: number;
          platform_fee_paise?: number | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_payout_id?: string | null;
          razorpay_refund_id?: string | null;
          status?: string;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          type?: string;
          amount_paise?: number;
          platform_fee_paise?: number | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_payout_id?: string | null;
          razorpay_refund_id?: string | null;
          status?: string;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      influencer_payout_details: {
        Row: {
          id: string;
          user_id: string;
          upi_id: string | null;
          bank_account_no: string | null;
          bank_ifsc: string | null;
          bank_account_name: string | null;
          preferred_method: string;
          verified: boolean;
          razorpay_contact_id: string | null;
          razorpay_fund_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          upi_id?: string | null;
          bank_account_no?: string | null;
          bank_ifsc?: string | null;
          bank_account_name?: string | null;
          preferred_method?: string;
          verified?: boolean;
          razorpay_contact_id?: string | null;
          razorpay_fund_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          upi_id?: string | null;
          bank_account_no?: string | null;
          bank_ifsc?: string | null;
          bank_account_name?: string | null;
          preferred_method?: string;
          verified?: boolean;
          razorpay_contact_id?: string | null;
          razorpay_fund_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_profiles: {
        Row: {
          access_token: string | null;
          brand_location: string | null;
          brand_name: string | null;
          brand_summary: string | null;
          brand_type: string | null;
          created_at: string;
          has_instagram_account: boolean | null;
          id: string;
          ig_biography: string | null;
          ig_followers_count: number | null;
          ig_follows_count: number | null;
          ig_media_count: number | null;
          ig_profile_picture_url: string | null;
          ig_user_id: string | null;
          ig_username: string | null;
          instagram_connected_at: string | null;
          instagram_url: string | null;
          tagline: string | null;
          token_expires_at: string | null;
          user_id: string;
        };
        Insert: {
          access_token?: string | null;
          brand_location?: string | null;
          brand_name?: string | null;
          brand_summary?: string | null;
          brand_type?: string | null;
          created_at?: string;
          has_instagram_account?: boolean | null;
          id?: string;
          ig_biography?: string | null;
          ig_followers_count?: number | null;
          ig_follows_count?: number | null;
          ig_media_count?: number | null;
          ig_profile_picture_url?: string | null;
          ig_user_id?: string | null;
          ig_username?: string | null;
          instagram_connected_at?: string | null;
          instagram_url?: string | null;
          tagline?: string | null;
          token_expires_at?: string | null;
          user_id: string;
        };
        Update: {
          access_token?: string | null;
          brand_location?: string | null;
          brand_name?: string | null;
          brand_summary?: string | null;
          brand_type?: string | null;
          created_at?: string;
          has_instagram_account?: boolean | null;
          id?: string;
          ig_biography?: string | null;
          ig_followers_count?: number | null;
          ig_follows_count?: number | null;
          ig_media_count?: number | null;
          ig_profile_picture_url?: string | null;
          ig_user_id?: string | null;
          ig_username?: string | null;
          instagram_connected_at?: string | null;
          instagram_url?: string | null;
          tagline?: string | null;
          token_expires_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
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
          content_types: string[] | null;
          is_active: boolean | null;
          languages: string[] | null;
          portfolio_media_ids: string[] | null;
          previous_brands: string[] | null;
          price_per_post: number | null;
          price_per_reel: number | null;
          price_per_story: number | null;
          token_expires_at: string | null;
          turnaround_time: string | null;
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
          content_types?: string[] | null;
          is_active?: boolean | null;
          languages?: string[] | null;
          portfolio_media_ids?: string[] | null;
          previous_brands?: string[] | null;
          price_per_post?: number | null;
          price_per_reel?: number | null;
          price_per_story?: number | null;
          token_expires_at?: string | null;
          turnaround_time?: string | null;
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
          content_types?: string[] | null;
          is_active?: boolean | null;
          languages?: string[] | null;
          portfolio_media_ids?: string[] | null;
          previous_brands?: string[] | null;
          price_per_post?: number | null;
          price_per_reel?: number | null;
          price_per_story?: number | null;
          token_expires_at?: string | null;
          turnaround_time?: string | null;
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
          business_name: string | null;
          business_type: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          location: string | null;
          phone: string | null;
        };
        Insert: {
          business_name?: string | null;
          business_type?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          location?: string | null;
          phone?: string | null;
        };
        Update: {
          business_name?: string | null;
          business_type?: string | null;
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

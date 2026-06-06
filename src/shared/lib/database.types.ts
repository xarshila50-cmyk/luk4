export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          post_id: string | null;
          read_at: string | null;
          recipient_id: string;
          reservation_id: string | null;
          title: string;
          type:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given';
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          read_at?: string | null;
          recipient_id: string;
          reservation_id?: string | null;
          title: string;
          type:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given';
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          read_at?: string | null;
          recipient_id?: string;
          reservation_id?: string | null;
          title?: string;
          type?:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given';
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          },
        ];
      };
      post_images: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          post_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_images_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_expiration_logs: {
        Row: {
          attempt: number;
          created_at: string;
          event:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id: string;
          image_count: number;
          message: string | null;
          post_id: string | null;
        };
        Insert: {
          attempt?: number;
          created_at?: string;
          event:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id?: string;
          image_count?: number;
          message?: string | null;
          post_id?: string | null;
        };
        Update: {
          attempt?: number;
          created_at?: string;
          event?:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id?: string;
          image_count?: number;
          message?: string | null;
          post_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_expiration_logs_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          category:
            | 'clothing'
            | 'home'
            | 'electronics'
            | 'books'
            | 'children'
            | 'sports'
            | 'other';
          condition: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts: number;
          cleanup_error: string | null;
          created_at: string;
          description: string;
          expired_at: string | null;
          expires_at: string;
          id: string;
          location: string;
          owner_id: string;
          storage_cleaned_at: string | null;
          status: 'available' | 'reserved' | 'given' | 'archived';
          title: string;
          updated_at: string;
        };
        Insert: {
          category:
            | 'clothing'
            | 'home'
            | 'electronics'
            | 'books'
            | 'children'
            | 'sports'
            | 'other';
          condition: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts?: number;
          cleanup_error?: string | null;
          created_at?: string;
          description: string;
          expired_at?: string | null;
          expires_at?: string;
          id?: string;
          location: string;
          owner_id: string;
          storage_cleaned_at?: string | null;
          status?: 'available' | 'reserved' | 'given' | 'archived';
          title: string;
          updated_at?: string;
        };
        Update: {
          category?:
            | 'clothing'
            | 'home'
            | 'electronics'
            | 'books'
            | 'children'
            | 'sports'
            | 'other';
          condition?: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts?: number;
          cleanup_error?: string | null;
          created_at?: string;
          description?: string;
          expired_at?: string | null;
          expires_at?: string;
          id?: string;
          location?: string;
          owner_id?: string;
          storage_cleaned_at?: string | null;
          status?: 'available' | 'reserved' | 'given' | 'archived';
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          location: string;
          phone_number: string | null;
          role: 'member' | 'admin';
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          location: string;
          phone_number?: string | null;
          role?: 'member' | 'admin';
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          location?: string;
          phone_number?: string | null;
          role?: 'member' | 'admin';
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          post_id: string | null;
          reporter_id: string | null;
          status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reporter_id?: string | null;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reporter_id?: string | null;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reservations: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          status:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          status?:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          owner_id?: string;
          post_id?: string;
          requester_id?: string;
          status?:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      create_profile_for_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      expire_reservations: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mark_expired_posts: {
        Args: {
          batch_size?: number;
        };
        Returns: number;
      };
      reserve_post: {
        Args: {
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      cancel_reservation: {
        Args: {
          target_reservation_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      mark_post_given: {
        Args: {
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['posts']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Supabase Database Types
 * Defines TypeScript types for all tables in the Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'business_owner';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'business_owner';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'business_owner';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      places: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          address: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          photos_urls: string[] | null;
          operating_hours: Json;
          price_range: string;
          payment_methods: string[] | null;
          tags: string[] | null;
          amenities: string[] | null;
          cuisine_types: string[] | null;
          specialties: string[] | null;
          latitude: number | null;
          longitude: number | null;
          rating: number | null;
          review_count: number | null;
          verified: boolean | null;
          claimed_by: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          address: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          photos_urls?: string[] | null;
          operating_hours: Json;
          price_range: string;
          payment_methods?: string[] | null;
          tags?: string[] | null;
          amenities?: string[] | null;
          cuisine_types?: string[] | null;
          specialties?: string[] | null;
          latitude?: number | null;
          longitude?: number | null;
          rating?: number | null;
          review_count?: number | null;
          verified?: boolean | null;
          claimed_by?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          address?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          photos_urls?: string[] | null;
          operating_hours?: Json;
          price_range?: string;
          payment_methods?: string[] | null;
          tags?: string[] | null;
          amenities?: string[] | null;
          cuisine_types?: string[] | null;
          specialties?: string[] | null;
          latitude?: number | null;
          longitude?: number | null;
          rating?: number | null;
          review_count?: number | null;
          verified?: boolean | null;
          claimed_by?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'places_claimed_by_fkey';
            columns: ['claimed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      contributors: {
        Row: {
          id: string;
          place_id: string;
          user_id: string | null;
          name: string;
          email: string | null;
          github: string | null;
          action: 'created' | 'updated' | 'verified';
          contributed_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id?: string | null;
          name: string;
          email?: string | null;
          github?: string | null;
          action: 'created' | 'updated' | 'verified';
          contributed_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          user_id?: string | null;
          name?: string;
          email?: string | null;
          github?: string | null;
          action?: 'created' | 'updated' | 'verified';
          contributed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contributors_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contributors_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      business_claims: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected';
          claimant_name: string;
          claimant_phone: string | null;
          claimant_role: string | null;
          proof_text: string | null;
          proof_documents: string[] | null;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          claimant_name: string;
          claimant_phone?: string | null;
          claimant_role?: string | null;
          proof_text?: string | null;
          proof_documents?: string[] | null;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          claimant_name?: string;
          claimant_phone?: string | null;
          claimant_role?: string | null;
          proof_text?: string | null;
          proof_documents?: string[] | null;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'business_claims_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_claims_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_claims_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      update_suggestions: {
        Row: {
          id: string;
          place_id: string;
          suggested_by_user_id: string | null;
          suggested_by_name: string;
          suggested_by_email: string | null;
          status: 'pending' | 'approved' | 'rejected';
          changes: Json;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          suggested_by_user_id?: string | null;
          suggested_by_name: string;
          suggested_by_email?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          changes: Json;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          suggested_by_user_id?: string | null;
          suggested_by_name?: string;
          suggested_by_email?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          changes?: Json;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'update_suggestions_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'update_suggestions_suggested_by_user_id_fkey';
            columns: ['suggested_by_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'update_suggestions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      place_submissions: {
        Row: {
          id: string;
          submitted_by_user_id: string | null;
          submitted_by_name: string;
          submitted_by_email: string | null;
          status: 'pending' | 'approved' | 'rejected';
          place_data: Json;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submitted_by_user_id?: string | null;
          submitted_by_name: string;
          submitted_by_email?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          place_data: Json;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submitted_by_user_id?: string | null;
          submitted_by_name?: string;
          submitted_by_email?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          place_data?: Json;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'place_submissions_submitted_by_user_id_fkey';
            columns: ['submitted_by_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_submissions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'user' | 'admin' | 'business_owner';
      claim_status: 'pending' | 'approved' | 'rejected';
      suggestion_status: 'pending' | 'approved' | 'rejected';
      submission_status: 'pending' | 'approved' | 'rejected';
      contributor_action: 'created' | 'updated' | 'verified';
    };
  };
}

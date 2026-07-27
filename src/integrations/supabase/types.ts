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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          entity_id: string | null
          entity_type: string
          id: string
          new_values: Json | null
          occurred_at: string
          old_values: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          new_values?: Json | null
          occurred_at?: string
          old_values?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_values?: Json | null
          occurred_at?: string
          old_values?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: Json
          archived_at: string | null
          code: string
          created_at: string
          id: string
          is_default: boolean
          lifecycle_state: Database["public"]["Enums"]["branch_lifecycle_state"]
          name: string
          organization_id: string
          tenant_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: Json
          archived_at?: string | null
          code: string
          created_at?: string
          id?: string
          is_default?: boolean
          lifecycle_state?: Database["public"]["Enums"]["branch_lifecycle_state"]
          name: string
          organization_id: string
          tenant_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: Json
          archived_at?: string | null
          code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          lifecycle_state?: Database["public"]["Enums"]["branch_lifecycle_state"]
          name?: string
          organization_id?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          organization_id: string | null
          rollout_stage: Database["public"]["Enums"]["feature_flag_stage"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          organization_id?: string | null
          rollout_stage?: Database["public"]["Enums"]["feature_flag_stage"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          organization_id?: string | null
          rollout_stage?: Database["public"]["Enums"]["feature_flag_stage"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_years: {
        Row: {
          archived_at: string | null
          closed_at: string | null
          code: string
          created_at: string
          end_date: string
          id: string
          is_default: boolean
          is_placeholder: boolean
          lifecycle_state: Database["public"]["Enums"]["financial_year_lifecycle_state"]
          opened_at: string | null
          organization_id: string
          start_date: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          closed_at?: string | null
          code: string
          created_at?: string
          end_date: string
          id?: string
          is_default?: boolean
          is_placeholder?: boolean
          lifecycle_state?: Database["public"]["Enums"]["financial_year_lifecycle_state"]
          opened_at?: string | null
          organization_id: string
          start_date: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          closed_at?: string | null
          code?: string
          created_at?: string
          end_date?: string
          id?: string
          is_default?: boolean
          is_placeholder?: boolean
          lifecycle_state?: Database["public"]["Enums"]["financial_year_lifecycle_state"]
          opened_at?: string | null
          organization_id?: string
          start_date?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_years_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_years_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_command_history: {
        Row: {
          id: string
          invoked_at: string
          nav_id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invoked_at?: string
          nav_id: string
          organization_id: string
          user_id: string
        }
        Update: {
          id?: string
          invoked_at?: string
          nav_id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_command_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_favorites: {
        Row: {
          created_at: string
          display_order: number
          id: string
          nav_id: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          nav_id: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          nav_id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_favorites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_recent_pages: {
        Row: {
          id: string
          organization_id: string
          route: string
          title: string | null
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          route: string
          title?: string | null
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          route?: string
          title?: string | null
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_recent_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_user_preferences: {
        Row: {
          command_palette_tab: string
          created_at: string
          id: string
          organization_id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          command_palette_tab?: string
          created_at?: string
          id?: string
          organization_id: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          command_palette_tab?: string
          created_at?: string
          id?: string
          organization_id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_user_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string | null
          channel: string
          created_at: string
          enabled: boolean
          id: string
          metadata: Json
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          channel: string
          created_at?: string
          enabled?: boolean
          id?: string
          metadata?: Json
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          channel?: string
          created_at?: string
          enabled?: boolean
          id?: string
          metadata?: Json
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          archived_at: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          message: string | null
          metadata: Json
          organization_id: string
          read_at: string | null
          recipient_user_id: string
          severity: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          organization_id: string
          read_at?: string | null
          recipient_user_id: string
          severity: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          organization_id?: string
          read_at?: string | null
          recipient_user_id?: string
          severity?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          created_at: string
          created_by: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          metadata: Json
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          theme: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          theme?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          theme?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          metadata: Json
          organization_id: string
          revoked_at: string | null
          revoked_by: string | null
          role: Database["public"]["Enums"]["org_role"]
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          metadata?: Json
          organization_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          metadata?: Json
          organization_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          status: Database["public"]["Enums"]["org_member_status"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: Database["public"]["Enums"]["org_member_status"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: Database["public"]["Enums"]["org_member_status"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string
          display_name: string | null
          email: string | null
          id: string
          industry: string | null
          language: string
          legal_name: string | null
          metadata: Json
          organization_id: string
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          state: string | null
          tax_id: string | null
          timezone: string
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          display_name?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string
          legal_name?: string | null
          metadata?: Json
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          tax_id?: string | null
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          display_name?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string
          legal_name?: string | null
          metadata?: Json
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          tax_id?: string | null
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          default_locale: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_default: boolean
          legal_name: string | null
          lifecycle_state: Database["public"]["Enums"]["company_lifecycle_state"]
          metadata: Json
          name: string
          region: string
          slug: string
          tenant_id: string
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          default_locale?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_default?: boolean
          legal_name?: string | null
          lifecycle_state?: Database["public"]["Enums"]["company_lifecycle_state"]
          metadata?: Json
          name: string
          region?: string
          slug: string
          tenant_id: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          default_locale?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_default?: boolean
          legal_name?: string | null
          lifecycle_state?: Database["public"]["Enums"]["company_lifecycle_state"]
          metadata?: Json
          name?: string
          region?: string
          slug?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          deprecated_at: string | null
          description: string | null
          id: string
          key: string
          module: string
          name: string
          resource: string
          system_permission: boolean
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          id?: string
          key: string
          module: string
          name: string
          resource: string
          system_permission?: boolean
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          deprecated_at?: string | null
          description?: string | null
          id?: string
          key?: string
          module?: string
          name?: string
          resource?: string
          system_permission?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_name: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string | null
          id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      provisioning_jobs: {
        Row: {
          attempt_count: number
          completed_at: string | null
          correlation_id: string
          created_at: string
          created_by: string | null
          current_step_key: string | null
          id: string
          last_error: Json | null
          last_transition_at: string
          provider_key: string
          provider_resource_reference: Json
          started_at: string | null
          state: Database["public"]["Enums"]["provisioning_job_state"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id: string
          created_at?: string
          created_by?: string | null
          current_step_key?: string | null
          id?: string
          last_error?: Json | null
          last_transition_at?: string
          provider_key?: string
          provider_resource_reference?: Json
          started_at?: string | null
          state?: Database["public"]["Enums"]["provisioning_job_state"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          current_step_key?: string | null
          id?: string
          last_error?: Json | null
          last_transition_at?: string
          provider_key?: string
          provider_resource_reference?: Json
          started_at?: string | null
          state?: Database["public"]["Enums"]["provisioning_job_state"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provisioning_steps: {
        Row: {
          attempt_count: number
          completed_at: string | null
          correlation_id: string
          created_at: string
          created_by: string | null
          duration_ms: number | null
          error: Json | null
          id: string
          job_id: string
          sequence: number
          started_at: string | null
          status: Database["public"]["Enums"]["provisioning_step_status"]
          step_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id: string
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error?: Json | null
          id?: string
          job_id: string
          sequence: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["provisioning_step_status"]
          step_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error?: Json | null
          id?: string
          job_id?: string
          sequence?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["provisioning_step_status"]
          step_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_steps_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "provisioning_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          rank: number
          scope: Database["public"]["Enums"]["role_scope"]
          system_role: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          rank?: number
          scope: Database["public"]["Enums"]["role_scope"]
          system_role?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          rank?: number
          scope?: Database["public"]["Enums"]["role_scope"]
          system_role?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          id: string
          organization_id: string
          query: string
          resource_type: string | null
          searched_at: string
          selected_result_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          organization_id: string
          query: string
          resource_type?: string | null
          searched_at?: string
          selected_result_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          query?: string
          resource_type?: string | null
          searched_at?: string
          selected_result_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      search_preferences: {
        Row: {
          created_at: string
          enable_recent_searches: boolean
          enable_suggestions: boolean
          id: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enable_recent_searches?: boolean
          enable_suggestions?: boolean
          id?: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enable_recent_searches?: boolean
          enable_suggestions?: boolean
          id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setting_definitions: {
        Row: {
          category: string
          created_at: string
          data_type: Database["public"]["Enums"]["setting_data_type"]
          default_value: Json | null
          deprecated_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean
          is_system: boolean
          key: string
          readiness_impact: string
          scope: Database["public"]["Enums"]["setting_scope"]
          updated_at: string
          validation_schema: Json
        }
        Insert: {
          category: string
          created_at?: string
          data_type: Database["public"]["Enums"]["setting_data_type"]
          default_value?: Json | null
          deprecated_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean
          is_system?: boolean
          key: string
          readiness_impact?: string
          scope: Database["public"]["Enums"]["setting_scope"]
          updated_at?: string
          validation_schema?: Json
        }
        Update: {
          category?: string
          created_at?: string
          data_type?: Database["public"]["Enums"]["setting_data_type"]
          default_value?: Json | null
          deprecated_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean
          is_system?: boolean
          key?: string
          readiness_impact?: string
          scope?: Database["public"]["Enums"]["setting_scope"]
          updated_at?: string
          validation_schema?: Json
        }
        Relationships: []
      }
      setting_values: {
        Row: {
          created_at: string
          definition_id: string
          id: string
          organization_id: string | null
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          definition_id: string
          id?: string
          organization_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          definition_id?: string
          id?: string
          organization_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "setting_values_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "setting_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setting_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_onboarding: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          blocked_at: string | null
          blocked_reason_code: string | null
          blocked_reason_summary: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          id: string
          last_correlation_id: string | null
          last_readiness_checked_at: string | null
          readiness_applicable_count: number
          readiness_blocking_count: number
          readiness_contract_version: string | null
          readiness_evaluated_by: string | null
          readiness_fingerprint: string | null
          readiness_snapshot: Json | null
          readiness_status: string | null
          readiness_warning_count: number
          readiness_workflow_version: number | null
          ready_at: string | null
          started_at: string | null
          started_by: string | null
          state: string
          tenant_id: string
          updated_at: string
          version: number
          warnings_acknowledged_at: string | null
          warnings_acknowledged_by: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          blocked_at?: string | null
          blocked_reason_code?: string | null
          blocked_reason_summary?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          last_correlation_id?: string | null
          last_readiness_checked_at?: string | null
          readiness_applicable_count?: number
          readiness_blocking_count?: number
          readiness_contract_version?: string | null
          readiness_evaluated_by?: string | null
          readiness_fingerprint?: string | null
          readiness_snapshot?: Json | null
          readiness_status?: string | null
          readiness_warning_count?: number
          readiness_workflow_version?: number | null
          ready_at?: string | null
          started_at?: string | null
          started_by?: string | null
          state?: string
          tenant_id: string
          updated_at?: string
          version?: number
          warnings_acknowledged_at?: string | null
          warnings_acknowledged_by?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          blocked_at?: string | null
          blocked_reason_code?: string | null
          blocked_reason_summary?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          last_correlation_id?: string | null
          last_readiness_checked_at?: string | null
          readiness_applicable_count?: number
          readiness_blocking_count?: number
          readiness_contract_version?: string | null
          readiness_evaluated_by?: string | null
          readiness_fingerprint?: string | null
          readiness_snapshot?: Json | null
          readiness_status?: string | null
          readiness_warning_count?: number
          readiness_workflow_version?: number | null
          ready_at?: string | null
          started_at?: string | null
          started_by?: string | null
          state?: string
          tenant_id?: string
          updated_at?: string
          version?: number
          warnings_acknowledged_at?: string | null
          warnings_acknowledged_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_onboarding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_onboarding_steps: {
        Row: {
          attempt_count: number
          blocked_at: string | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string
          failure_code: string | null
          failure_summary: string | null
          id: string
          started_at: string | null
          status: string
          step_key: string
          tenant_id: string
          tenant_onboarding_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          attempt_count?: number
          blocked_at?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          failure_code?: string | null
          failure_summary?: string | null
          id?: string
          started_at?: string | null
          status?: string
          step_key: string
          tenant_id: string
          tenant_onboarding_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          attempt_count?: number
          blocked_at?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          failure_code?: string | null
          failure_summary?: string | null
          id?: string
          started_at?: string | null
          status?: string
          step_key?: string
          tenant_id?: string
          tenant_onboarding_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_onboarding_steps_parent_fk"
            columns: ["tenant_onboarding_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_onboarding"
            referencedColumns: ["id", "tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          billing_email: string | null
          code: string | null
          created_at: string
          created_by: string | null
          dedicated_database_ref: string | null
          default_locale: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          deletion_scheduled_at: string | null
          deletion_scheduled_by: string | null
          display_name: string
          id: string
          lifecycle_state: Database["public"]["Enums"]["tenant_lifecycle_state"]
          maintenance_reason: string | null
          maintenance_started_at: string | null
          notes: string | null
          plan_tier: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          primary_domain: string | null
          provisioning_status: Database["public"]["Enums"]["tenant_provisioning_status"]
          purge_after: string | null
          region: string
          slug: string
          subscription_ref: string | null
          suspended_at: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          billing_email?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          dedicated_database_ref?: string | null
          default_locale?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          deletion_scheduled_at?: string | null
          deletion_scheduled_by?: string | null
          display_name: string
          id?: string
          lifecycle_state?: Database["public"]["Enums"]["tenant_lifecycle_state"]
          maintenance_reason?: string | null
          maintenance_started_at?: string | null
          notes?: string | null
          plan_tier?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_domain?: string | null
          provisioning_status?: Database["public"]["Enums"]["tenant_provisioning_status"]
          purge_after?: string | null
          region?: string
          slug: string
          subscription_ref?: string | null
          suspended_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          billing_email?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          dedicated_database_ref?: string | null
          default_locale?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          deletion_scheduled_at?: string | null
          deletion_scheduled_by?: string | null
          display_name?: string
          id?: string
          lifecycle_state?: Database["public"]["Enums"]["tenant_lifecycle_state"]
          maintenance_reason?: string | null
          maintenance_started_at?: string | null
          notes?: string | null
          plan_tier?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_domain?: string | null
          provisioning_status?: Database["public"]["Enums"]["tenant_provisioning_status"]
          purge_after?: string | null
          region?: string
          slug?: string
          subscription_ref?: string | null
          suspended_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          job_title: string | null
          language: string | null
          organization_id: string
          phone: string | null
          preferences: Json
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          job_title?: string | null
          language?: string | null
          organization_id: string
          phone?: string | null
          preferences?: Json
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          job_title?: string | null
          language?: string | null
          organization_id?: string
          phone?: string | null
          preferences?: Json
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          role_id: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_activate_company: { Args: { _id: string }; Returns: Json }
      fn_archive_company: { Args: { _id: string }; Returns: Json }
      fn_cancel_tenant_deletion: {
        Args: { _reason: string; _tenant: string }
        Returns: Json
      }
      fn_create_company: {
        Args: {
          _default_locale: string
          _display_name: string
          _legal_name?: string
          _region: string
          _slug: string
          _tenant_id: string
          _timezone: string
        }
        Returns: string
      }
      fn_deactivate_company: { Args: { _id: string }; Returns: Json }
      fn_delete_tenant: {
        Args: { _reason: string; _tenant: string }
        Returns: Json
      }
      fn_enter_maintenance: {
        Args: { _reason: string; _tenant: string }
        Returns: Json
      }
      fn_exit_maintenance: { Args: { _tenant: string }; Returns: Json }
      fn_onboarding_activate_tenant: {
        Args: {
          _acknowledge_warnings?: boolean
          _correlation_id?: string
          _expected_version?: number
          _tenant_id: string
        }
        Returns: Json
      }
      fn_onboarding_admin_role_key: {
        Args: { _invited_role: string }
        Returns: string
      }
      fn_onboarding_assign_admin_role: {
        Args: { _invitation_id: string; _tenant_id: string }
        Returns: Json
      }
      fn_onboarding_evaluate_readiness: {
        Args: { _correlation_id?: string; _tenant_id: string }
        Returns: Json
      }
      fn_onboarding_invite_first_admin: {
        Args: {
          _email: string
          _expires_at: string
          _invited_role: string
          _organization_id: string
          _tenant_id: string
          _token_hash: string
        }
        Returns: Json
      }
      fn_onboarding_invite_first_admin_atomic: {
        Args: {
          _correlation_id: string
          _email: string
          _expected_version: number
          _expires_at: string
          _invited_role: string
          _tenant_id: string
          _token_hash: string
        }
        Returns: Json
      }
      fn_onboarding_persist_readiness: {
        Args: { _correlation_id?: string; _tenant_id: string }
        Returns: Json
      }
      fn_onboarding_record_step: {
        Args: {
          _correlation_id?: string
          _expected_version?: number
          _failure_code?: string
          _failure_summary?: string
          _status: string
          _step_key: string
          _tenant_id: string
        }
        Returns: Json
      }
      fn_onboarding_resend_first_admin_atomic: {
        Args: {
          _correlation_id: string
          _expected_version: number
          _expires_at: string
          _invitation_id: string
          _tenant_id: string
          _token_hash: string
        }
        Returns: Json
      }
      fn_onboarding_resolve_first_admin: {
        Args: { _email?: string; _tenant_id: string }
        Returns: Json
      }
      fn_onboarding_revoke_invitation: {
        Args: { _invitation_id: string; _tenant_id: string }
        Returns: Json
      }
      fn_onboarding_start: {
        Args: { _correlation_id?: string; _tenant_id: string }
        Returns: Json
      }
      fn_restore_tenant: { Args: { _tenant: string }; Returns: Json }
      fn_schedule_tenant_deletion: {
        Args: { _reason: string; _retention_days?: number; _tenant: string }
        Returns: Json
      }
      fn_set_default_company: { Args: { _id: string }; Returns: Json }
      fn_tenant_onboarding_queue: {
        Args: {
          _created_from?: string
          _created_to?: string
          _current_step?: string
          _has_blockers?: boolean
          _invitation_status?: string
          _page?: number
          _page_size?: number
          _readiness_status?: string
          _search?: string
          _sort_by?: string
          _sort_dir?: string
          _state?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "member"
      branch_lifecycle_state: "active" | "archived"
      company_lifecycle_state: "created" | "active" | "inactive" | "archived"
      feature_flag_stage: "off" | "internal" | "beta" | "ga"
      financial_year_lifecycle_state: "created" | "open" | "closed" | "archived"
      org_member_status: "active" | "invited" | "suspended"
      org_role: "owner" | "admin" | "member"
      provisioning_job_state:
        | "pending"
        | "validating"
        | "queued"
        | "provisioning_infrastructure"
        | "running_migrations"
        | "seeding"
        | "creating_admin"
        | "verifying"
        | "completed"
        | "failed"
        | "retrying"
        | "rolled_back"
        | "cancelled"
      provisioning_step_status:
        | "pending"
        | "running"
        | "succeeded"
        | "failed"
        | "skipped"
        | "rolled_back"
      role_scope: "platform" | "organization"
      setting_data_type:
        | "string"
        | "integer"
        | "decimal"
        | "boolean"
        | "enum"
        | "json"
      setting_scope: "platform" | "organization"
      tenant_lifecycle_state:
        | "created"
        | "active"
        | "suspended"
        | "archived"
        | "maintenance"
        | "pending_deletion"
        | "deleted"
      tenant_provisioning_status:
        | "not_started"
        | "in_progress"
        | "provisioned"
        | "failed"
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
      app_role: ["admin", "member"],
      branch_lifecycle_state: ["active", "archived"],
      company_lifecycle_state: ["created", "active", "inactive", "archived"],
      feature_flag_stage: ["off", "internal", "beta", "ga"],
      financial_year_lifecycle_state: ["created", "open", "closed", "archived"],
      org_member_status: ["active", "invited", "suspended"],
      org_role: ["owner", "admin", "member"],
      provisioning_job_state: [
        "pending",
        "validating",
        "queued",
        "provisioning_infrastructure",
        "running_migrations",
        "seeding",
        "creating_admin",
        "verifying",
        "completed",
        "failed",
        "retrying",
        "rolled_back",
        "cancelled",
      ],
      provisioning_step_status: [
        "pending",
        "running",
        "succeeded",
        "failed",
        "skipped",
        "rolled_back",
      ],
      role_scope: ["platform", "organization"],
      setting_data_type: [
        "string",
        "integer",
        "decimal",
        "boolean",
        "enum",
        "json",
      ],
      setting_scope: ["platform", "organization"],
      tenant_lifecycle_state: [
        "created",
        "active",
        "suspended",
        "archived",
        "maintenance",
        "pending_deletion",
        "deleted",
      ],
      tenant_provisioning_status: [
        "not_started",
        "in_progress",
        "provisioned",
        "failed",
      ],
    },
  },
} as const

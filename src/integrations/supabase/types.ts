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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          owner_id: string
          pet_id: string
          reason: string | null
          status: string | null
          updated_at: string | null
          vet_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          owner_id: string
          pet_id: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          vet_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          owner_id?: string
          pet_id?: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          vet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pet_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          established_date: string | null
          id: string
          is_deleted: boolean | null
          license_number: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_deleted?: boolean | null
          license_number?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          is_deleted?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          clinic_id: string
          cost_per_unit: number | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          item_name: string
          item_type: string | null
          last_restocked_date: string | null
          low_stock_threshold: number | null
          quantity: number
          supplier: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          cost_per_unit?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          item_name: string
          item_type?: string | null
          last_restocked_date?: string | null
          low_stock_threshold?: number | null
          quantity: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          cost_per_unit?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          item_name?: string
          item_type?: string | null
          last_restocked_date?: string | null
          low_stock_threshold?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          appointment_id: string | null
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          is_deleted: boolean | null
          issue_date: string
          notes: string | null
          owner_id: string
          pet_id: string
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          is_deleted?: boolean | null
          issue_date: string
          notes?: string | null
          owner_id: string
          pet_id: string
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_deleted?: boolean | null
          issue_date?: string
          notes?: string | null
          owner_id?: string
          pet_id?: string
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pet_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appetite_behavior: string | null
          appointment_id: string | null
          body_condition_score: number | null
          chief_complaint: string | null
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          diagnosis: string | null
          diagnostic_results: string | null
          differential_diagnoses: string | null
          duration_onset: string | null
          follow_up_instructions: string | null
          follow_up_json: Json | null
          heart_rate_bpm: number | null
          id: string
          is_deleted: boolean | null
          next_appointment_recommendation: string | null
          notes: string | null
          pet_id: string
          physical_exam_findings: string | null
          prescriptions_json: Json | null
          primary_diagnosis: string | null
          prior_treatments: string | null
          procedures_performed: string | null
          record_date: string
          respiratory_rate: number | null
          severity: string | null
          symptoms: string | null
          temperature_f: number | null
          treatment: string | null
          updated_at: string | null
          vet_id: string
          weight_kg: number | null
        }
        Insert: {
          appetite_behavior?: string | null
          appointment_id?: string | null
          body_condition_score?: number | null
          chief_complaint?: string | null
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          diagnosis?: string | null
          diagnostic_results?: string | null
          differential_diagnoses?: string | null
          duration_onset?: string | null
          follow_up_instructions?: string | null
          follow_up_json?: Json | null
          heart_rate_bpm?: number | null
          id?: string
          is_deleted?: boolean | null
          next_appointment_recommendation?: string | null
          notes?: string | null
          pet_id: string
          physical_exam_findings?: string | null
          prescriptions_json?: Json | null
          primary_diagnosis?: string | null
          prior_treatments?: string | null
          procedures_performed?: string | null
          record_date: string
          respiratory_rate?: number | null
          severity?: string | null
          symptoms?: string | null
          temperature_f?: number | null
          treatment?: string | null
          updated_at?: string | null
          vet_id: string
          weight_kg?: number | null
        }
        Update: {
          appetite_behavior?: string | null
          appointment_id?: string | null
          body_condition_score?: number | null
          chief_complaint?: string | null
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          diagnosis?: string | null
          diagnostic_results?: string | null
          differential_diagnoses?: string | null
          duration_onset?: string | null
          follow_up_instructions?: string | null
          follow_up_json?: Json | null
          heart_rate_bpm?: number | null
          id?: string
          is_deleted?: boolean | null
          next_appointment_recommendation?: string | null
          notes?: string | null
          pet_id?: string
          physical_exam_findings?: string | null
          prescriptions_json?: Json | null
          primary_diagnosis?: string | null
          prior_treatments?: string | null
          procedures_performed?: string | null
          record_date?: string
          respiratory_rate?: number | null
          severity?: string | null
          symptoms?: string | null
          temperature_f?: number | null
          treatment?: string | null
          updated_at?: string | null
          vet_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          clinic_id: string
          contraindications: string | null
          created_at: string | null
          deleted_at: string | null
          dosage: string | null
          duration_days: number | null
          frequency: string | null
          id: string
          is_deleted: boolean | null
          name: string
          side_effects: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          contraindications?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dosage?: string | null
          duration_days?: number | null
          frequency?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          side_effects?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          contraindications?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dosage?: string | null
          duration_days?: number | null
          frequency?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          side_effects?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicines_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          channel: string | null
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          message_content: string | null
          message_type: string | null
          recipient_id: string | null
          sent_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          channel?: string | null
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_content?: string | null
          message_type?: string | null
          recipient_id?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string | null
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_content?: string | null
          message_type?: string | null
          recipient_id?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "pet_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          invoice_id: string
          is_deleted: boolean | null
          notes: string | null
          payment_date: string
          payment_method: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id: string
          is_deleted?: boolean | null
          notes?: string | null
          payment_date: string
          payment_method: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string
          is_deleted?: boolean | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_owners: {
        Row: {
          address: string | null
          city: string | null
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_deleted: boolean | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_owners_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age_months: number | null
          age_years: number | null
          breed: string | null
          clinic_id: string
          color: string | null
          created_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          gender: string | null
          health_status: string | null
          id: string
          is_deleted: boolean | null
          microchip_id: string | null
          name: string
          owner_id: string
          species: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age_months?: number | null
          age_years?: number | null
          breed?: string | null
          clinic_id: string
          color?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          is_deleted?: boolean | null
          microchip_id?: string | null
          name: string
          owner_id: string
          species: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age_months?: number | null
          age_years?: number | null
          breed?: string | null
          clinic_id?: string
          color?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          is_deleted?: boolean | null
          microchip_id?: string | null
          name?: string
          owner_id?: string
          species?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pet_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          is_deleted: boolean | null
          medical_record_id: string | null
          medicine_id: string
          pet_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_deleted?: boolean | null
          medical_record_id?: string | null
          medicine_id: string
          pet_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_deleted?: boolean | null
          medical_record_id?: string | null
          medicine_id?: string
          pet_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          message: string | null
          owner_id: string
          pet_id: string
          reminder_type: string | null
          scheduled_date: string | null
          sent_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message?: string | null
          owner_id: string
          pet_id: string
          reminder_type?: string | null
          scheduled_date?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message?: string | null
          owner_id?: string
          pet_id?: string
          reminder_type?: string | null
          scheduled_date?: string | null
          sent_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pet_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name: string
          price?: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clinic_id: string
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          name: string
          password_hash: string
          phone: string | null
          role: string
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name: string
          password_hash: string
          phone?: string | null
          role: string
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name?: string
          password_hash?: string
          phone?: string | null
          role?: string
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          administered_by_id: string | null
          batch_number: string | null
          clinic_id: string
          created_at: string | null
          date_administered: string
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          next_due_date: string | null
          notes: string | null
          pet_id: string
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          administered_by_id?: string | null
          batch_number?: string | null
          clinic_id: string
          created_at?: string | null
          date_administered: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          administered_by_id?: string | null
          batch_number?: string | null
          clinic_id?: string
          created_at?: string | null
          date_administered?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_administered_by_id_fkey"
            columns: ["administered_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
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

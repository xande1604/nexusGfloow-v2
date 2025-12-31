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
      access_keys: {
        Row: {
          created_at: string | null
          created_by_admin_id: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          key_code: string
          updated_at: string | null
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin_id: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          key_code: string
          updated_at?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin_id?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          key_code?: string
          updated_at?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          canonical_url: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          og_image: string | null
          owner_admin_id: string | null
          published_at: string | null
          scheduled_at: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          canonical_url?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          og_image?: string | null
          owner_admin_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          canonical_url?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          og_image?: string | null
          owner_admin_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_webhook_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          owner_admin_id: string | null
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          owner_admin_id?: string | null
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          owner_admin_id?: string | null
          token?: string
        }
        Relationships: []
      }
      career_roadmaps: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          owner_admin_id: string | null
          progress: Json | null
          source_role_title: string
          steps: Json
          target_role_title: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          owner_admin_id?: string | null
          progress?: Json | null
          source_role_title: string
          steps: Json
          target_role_title: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          owner_admin_id?: string | null
          progress?: Json | null
          source_role_title?: string
          steps?: Json
          target_role_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_roadmaps_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_roadmaps_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          cbo2002: string | null
          codigocargo: string
          created_at: string | null
          faz_parte_cota_aprendiz: boolean
          hard_skills: string | null
          id: string
          owner_admin_id: string | null
          salary_max: number | null
          salary_min: number | null
          soft_skills: string | null
          technical_knowledge: string | null
          tituloreduzido: string
          updated_at: string | null
        }
        Insert: {
          cbo2002?: string | null
          codigocargo: string
          created_at?: string | null
          faz_parte_cota_aprendiz?: boolean
          hard_skills?: string | null
          id?: string
          owner_admin_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          soft_skills?: string | null
          technical_knowledge?: string | null
          tituloreduzido: string
          updated_at?: string | null
        }
        Update: {
          cbo2002?: string | null
          codigocargo?: string
          created_at?: string | null
          faz_parte_cota_aprendiz?: boolean
          hard_skills?: string | null
          id?: string
          owner_admin_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          soft_skills?: string | null
          technical_knowledge?: string | null
          tituloreduzido?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      centrodecustos: {
        Row: {
          codcentrodecustos: string
          codempresa: string
          created_at: string | null
          id: string
          nomecentrodecustos: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codcentrodecustos: string
          codempresa: string
          created_at?: string | null
          id?: string
          nomecentrodecustos: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codcentrodecustos?: string
          codempresa?: string
          created_at?: string | null
          id?: string
          nomecentrodecustos?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          attempt_id: string
          certificate_code: string
          employee_id: string
          id: string
          issued_at: string
          owner_admin_id: string | null
          test_id: string
          valid_until: string | null
        }
        Insert: {
          attempt_id: string
          certificate_code: string
          employee_id: string
          id?: string
          issued_at?: string
          owner_admin_id?: string | null
          test_id: string
          valid_until?: string | null
        }
        Update: {
          attempt_id?: string
          certificate_code?: string
          employee_id?: string
          id?: string
          issued_at?: string
          owner_admin_id?: string | null
          test_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          id: string
          mission: string | null
          values: string[] | null
          vision: string | null
        }
        Insert: {
          id?: string
          mission?: string | null
          values?: string[] | null
          vision?: string | null
        }
        Update: {
          id?: string
          mission?: string | null
          values?: string[] | null
          vision?: string | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          created_at: string
          email: string
          empresa: string | null
          id: string
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          empresa?: string | null
          id?: string
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      dashboard_insights: {
        Row: {
          created_at: string
          dashboard_type: string
          empresa_id: string
          id: string
          insight_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dashboard_type: string
          empresa_id: string
          id?: string
          insight_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dashboard_type?: string
          empresa_id?: string
          id?: string
          insight_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          cargo: string | null
          created_at: string
          diagnostico_ia: string | null
          email: string
          empresa: string | null
          id: string
          nivel_maturidade: string
          nome: string
          respostas: Json
          score_automacao: number
          score_cultura: number
          score_dados_governanca: number
          score_ia: number
          score_people_analytics: number
          score_total: number
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          diagnostico_ia?: string | null
          email: string
          empresa?: string | null
          id?: string
          nivel_maturidade: string
          nome: string
          respostas: Json
          score_automacao: number
          score_cultura: number
          score_dados_governanca: number
          score_ia: number
          score_people_analytics: number
          score_total: number
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          diagnostico_ia?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nivel_maturidade?: string
          nome?: string
          respostas?: Json
          score_automacao?: number
          score_cultura?: number
          score_dados_governanca?: number
          score_ia?: number
          score_people_analytics?: number
          score_total?: number
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_credentials: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_credentials_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_credentials_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_evaluations: {
        Row: {
          created_at: string | null
          cycle_id: string
          employee_id: string
          id: string
          manager_evaluation_completed_at: string | null
          manager_evaluation_responses: Json | null
          manager_feedback: string | null
          owner_admin_id: string | null
          questions: Json
          self_assessment_completed_at: string | null
          self_assessment_responses: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id: string
          employee_id: string
          id?: string
          manager_evaluation_completed_at?: string | null
          manager_evaluation_responses?: Json | null
          manager_feedback?: string | null
          owner_admin_id?: string | null
          questions?: Json
          self_assessment_completed_at?: string | null
          self_assessment_responses?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string
          employee_id?: string
          id?: string
          manager_evaluation_completed_at?: string | null
          manager_evaluation_responses?: Json | null
          manager_feedback?: string | null
          owner_admin_id?: string | null
          questions?: Json
          self_assessment_completed_at?: string | null
          self_assessment_responses?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_evaluations_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          acquired_at: string
          created_at: string
          employee_id: string
          id: string
          owner_admin_id: string | null
          skill_category: string | null
          skill_name: string
          source_id: string | null
          source_name: string | null
          source_type: string | null
        }
        Insert: {
          acquired_at?: string
          created_at?: string
          employee_id: string
          id?: string
          owner_admin_id?: string | null
          skill_category?: string | null
          skill_name: string
          source_id?: string | null
          source_name?: string | null
          source_type?: string | null
        }
        Update: {
          acquired_at?: string
          created_at?: string
          employee_id?: string
          id?: string
          owner_admin_id?: string | null
          skill_category?: string | null
          skill_name?: string
          source_id?: string | null
          source_name?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          causademissao: string | null
          chave_empresa: string
          codcentrodecustos: string | null
          codempresa: string | null
          codfilial: string | null
          codigocargo: string | null
          codigonacionalidade: string | null
          codlocal: string | null
          codsituacao: string | null
          cpf: string | null
          created_at: string | null
          dataadmissao: string | null
          dataafastamento: string | null
          datainclusao: string | null
          datanascimento: string | null
          email: string | null
          escolaridade: string | null
          estadocivil: string | null
          gestor_id: string | null
          id: string
          matricula: string | null
          nome: string | null
          owner_admin_id: string | null
          pcd: string | null
          periodopagamento: string | null
          racacor: string | null
          sexo: string | null
          situacaoafastamento: string | null
          tipocontrato: string | null
          tipodecolaborador: string | null
          updated_at: string | null
          valorsalario: number | null
        }
        Insert: {
          causademissao?: string | null
          chave_empresa: string
          codcentrodecustos?: string | null
          codempresa?: string | null
          codfilial?: string | null
          codigocargo?: string | null
          codigonacionalidade?: string | null
          codlocal?: string | null
          codsituacao?: string | null
          cpf?: string | null
          created_at?: string | null
          dataadmissao?: string | null
          dataafastamento?: string | null
          datainclusao?: string | null
          datanascimento?: string | null
          email?: string | null
          escolaridade?: string | null
          estadocivil?: string | null
          gestor_id?: string | null
          id?: string
          matricula?: string | null
          nome?: string | null
          owner_admin_id?: string | null
          pcd?: string | null
          periodopagamento?: string | null
          racacor?: string | null
          sexo?: string | null
          situacaoafastamento?: string | null
          tipocontrato?: string | null
          tipodecolaborador?: string | null
          updated_at?: string | null
          valorsalario?: number | null
        }
        Update: {
          causademissao?: string | null
          chave_empresa?: string
          codcentrodecustos?: string | null
          codempresa?: string | null
          codfilial?: string | null
          codigocargo?: string | null
          codigonacionalidade?: string | null
          codlocal?: string | null
          codsituacao?: string | null
          cpf?: string | null
          created_at?: string | null
          dataadmissao?: string | null
          dataafastamento?: string | null
          datainclusao?: string | null
          datanascimento?: string | null
          email?: string | null
          escolaridade?: string | null
          estadocivil?: string | null
          gestor_id?: string | null
          id?: string
          matricula?: string | null
          nome?: string | null
          owner_admin_id?: string | null
          pcd?: string | null
          periodopagamento?: string | null
          racacor?: string | null
          sexo?: string | null
          situacaoafastamento?: string | null
          tipocontrato?: string | null
          tipodecolaborador?: string | null
          updated_at?: string | null
          valorsalario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnae: string | null
          codempresa: string
          created_at: string | null
          grau_risco: number | null
          id: string
          nomeempresa: string
          owner_admin_id: string | null
          percentual_encargos: number | null
          updated_at: string | null
        }
        Insert: {
          cnae?: string | null
          codempresa: string
          created_at?: string | null
          grau_risco?: number | null
          id?: string
          nomeempresa: string
          owner_admin_id?: string | null
          percentual_encargos?: number | null
          updated_at?: string | null
        }
        Update: {
          cnae?: string | null
          codempresa?: string
          created_at?: string | null
          grau_risco?: number | null
          id?: string
          nomeempresa?: string
          owner_admin_id?: string | null
          percentual_encargos?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escolaridade: {
        Row: {
          codgrau: string
          created_at: string | null
          descricaograu: string
          id: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codgrau: string
          created_at?: string | null
          descricaograu: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codgrau?: string
          created_at?: string | null
          descricaograu?: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estadocivil: {
        Row: {
          codigoestadocivil: string
          created_at: string | null
          descricaoestcivil: string
          id: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigoestadocivil: string
          created_at?: string | null
          descricaoestcivil: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigoestadocivil?: string
          created_at?: string | null
          descricaoestcivil?: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluation_cycles: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          owner_admin_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_admin_id?: string | null
          start_date?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_admin_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluation_invite_history: {
        Row: {
          evaluation_id: string
          id: string
          owner_admin_id: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          sent_by_admin_id: string | null
          status: string
          type: string
        }
        Insert: {
          evaluation_id: string
          id?: string
          owner_admin_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          sent_by_admin_id?: string | null
          status?: string
          type: string
        }
        Update: {
          evaluation_id?: string
          id?: string
          owner_admin_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          sent_by_admin_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_invite_history_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "employee_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_folha: {
        Row: {
          codigoevento: string
          created_at: string | null
          descricaoevento: string
          grupoeventos: string | null
          id: string
          owner_admin_id: string | null
          tipoevento: string | null
          updated_at: string | null
        }
        Insert: {
          codigoevento: string
          created_at?: string | null
          descricaoevento: string
          grupoeventos?: string | null
          id?: string
          owner_admin_id?: string | null
          tipoevento?: string | null
          updated_at?: string | null
        }
        Update: {
          codigoevento?: string
          created_at?: string | null
          descricaoevento?: string
          grupoeventos?: string | null
          id?: string
          owner_admin_id?: string | null
          tipoevento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ficha_financeira: {
        Row: {
          codempresa: string
          codigoevento: string
          created_at: string | null
          data: string | null
          id: string
          matricula: string
          owner_admin_id: string | null
          referencia: number | null
          tipcolaborador: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          codempresa: string
          codigoevento: string
          created_at?: string | null
          data?: string | null
          id?: string
          matricula: string
          owner_admin_id?: string | null
          referencia?: number | null
          tipcolaborador?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          codempresa?: string
          codigoevento?: string
          created_at?: string | null
          data?: string | null
          id?: string
          matricula?: string
          owner_admin_id?: string | null
          referencia?: number | null
          tipcolaborador?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      filiais: {
        Row: {
          codempresa: string
          codigofilial: string
          created_at: string | null
          id: string
          nomefilial: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codempresa: string
          codigofilial: string
          created_at?: string | null
          id?: string
          nomefilial: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codempresa?: string
          codigofilial?: string
          created_at?: string | null
          id?: string
          nomefilial?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      headcount_forecast: {
        Row: {
          ano: number
          codcentrodecustos: string
          codempresa: string
          codigocargo: string
          created_at: string
          custo_previsto: number | null
          id: string
          mes: number
          owner_admin_id: string | null
          quantidade_prevista: number
          updated_at: string
        }
        Insert: {
          ano: number
          codcentrodecustos: string
          codempresa: string
          codigocargo: string
          created_at?: string
          custo_previsto?: number | null
          id?: string
          mes: number
          owner_admin_id?: string | null
          quantidade_prevista?: number
          updated_at?: string
        }
        Update: {
          ano?: number
          codcentrodecustos?: string
          codempresa?: string
          codigocargo?: string
          created_at?: string
          custo_previsto?: number | null
          id?: string
          mes?: number
          owner_admin_id?: string | null
          quantidade_prevista?: number
          updated_at?: string
        }
        Relationships: []
      }
      job_role_skills: {
        Row: {
          job_role_id: string
          skill_id: string
        }
        Insert: {
          job_role_id: string
          skill_id: string
        }
        Update: {
          job_role_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_role_skills_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_role_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      job_roles: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          id: string
          level: string
          salary_max: number | null
          salary_min: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          department: string
          description?: string | null
          id?: string
          level: string
          salary_max?: number | null
          salary_min?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          id?: string
          level?: string
          salary_max?: number | null
          salary_min?: number | null
          title?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          cargo_id: string | null
          content: string | null
          cost_center_id: string | null
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          owner_admin_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          cargo_id?: string | null
          content?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          owner_admin_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          cargo_id?: string | null
          content?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          owner_admin_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "centrodecustos"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          codlocal: string
          created_at: string | null
          id: string
          nomelocal: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codlocal: string
          created_at?: string | null
          id?: string
          nomelocal: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codlocal?: string
          created_at?: string | null
          id?: string
          nomelocal?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_reviews: {
        Row: {
          created_at: string | null
          date: string | null
          employee_id: string | null
          id: string
          overall_feedback: string | null
          owner_admin_id: string | null
          questions: Json | null
          responses: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          overall_feedback?: string | null
          owner_admin_id?: string | null
          questions?: Json | null
          responses?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          overall_feedback?: string | null
          owner_admin_id?: string | null
          questions?: Json | null
          responses?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      racas: {
        Row: {
          codigoraca: string
          created_at: string | null
          descricaoraca: string
          id: string
          owner_admin_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigoraca: string
          created_at?: string | null
          descricaoraca: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigoraca?: string
          created_at?: string | null
          descricaoraca?: string
          id?: string
          owner_admin_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_question_templates: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_default: boolean | null
          owner_admin_id: string | null
          question: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          owner_admin_id?: string | null
          question: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          owner_admin_id?: string | null
          question?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sesmt_dimensionamento: {
        Row: {
          aux_enfermagem: number
          aux_engenheiro_trabalho: number
          created_at: string | null
          enfermeiro_trabalho: number
          engenheiro_trabalho: number
          faixa_max: number | null
          faixa_min: number
          grau_risco: number
          id: string
          medico_trabalho: number
          tecnico_seguranca: number
          updated_at: string | null
        }
        Insert: {
          aux_enfermagem?: number
          aux_engenheiro_trabalho?: number
          created_at?: string | null
          enfermeiro_trabalho?: number
          engenheiro_trabalho?: number
          faixa_max?: number | null
          faixa_min: number
          grau_risco: number
          id?: string
          medico_trabalho?: number
          tecnico_seguranca?: number
          updated_at?: string | null
        }
        Update: {
          aux_enfermagem?: number
          aux_engenheiro_trabalho?: number
          created_at?: string | null
          enfermeiro_trabalho?: number
          engenheiro_trabalho?: number
          faixa_max?: number | null
          faixa_min?: number
          grau_risco?: number
          id?: string
          medico_trabalho?: number
          tecnico_seguranca?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_admin_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_admin_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_admin_id?: string | null
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          auto_score: number | null
          completed_at: string | null
          employee_id: string
          feedback: string | null
          final_score: number | null
          id: string
          manual_score: number | null
          owner_admin_id: string | null
          responses: Json
          reviewed_at: string | null
          reviewed_by: string | null
          started_at: string
          status: string
          test_id: string
        }
        Insert: {
          auto_score?: number | null
          completed_at?: string | null
          employee_id: string
          feedback?: string | null
          final_score?: number | null
          id?: string
          manual_score?: number | null
          owner_admin_id?: string | null
          responses?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string
          status?: string
          test_id: string
        }
        Update: {
          auto_score?: number | null
          completed_at?: string | null
          employee_id?: string
          feedback?: string | null
          final_score?: number | null
          id?: string
          manual_score?: number | null
          owner_admin_id?: string | null
          responses?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string
          status?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_enrollments: {
        Row: {
          employee_id: string
          enrolled_at: string
          id: string
          test_id: string
        }
        Insert: {
          employee_id: string
          enrolled_at?: string
          id?: string
          test_id: string
        }
        Update: {
          employee_id?: string
          enrolled_at?: string
          id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_enrollments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_participants: {
        Row: {
          employee_id: string
          id: string
          invited_at: string
          invited_by: string | null
          test_id: string
        }
        Insert: {
          employee_id: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          test_id: string
        }
        Update: {
          employee_id?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_participants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          category: string | null
          correct_answer: string | null
          created_at: string
          id: string
          options: Json | null
          owner_admin_id: string | null
          points: number
          question_text: string
          question_type: string
          test_id: string | null
        }
        Insert: {
          category?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          owner_admin_id?: string | null
          points?: number
          question_text: string
          question_type: string
          test_id?: string | null
        }
        Update: {
          category?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          owner_admin_id?: string | null
          points?: number
          question_text?: string
          question_type?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          cargo_id: string | null
          cost_center_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          owner_admin_id: string | null
          participation_mode: string
          passing_score: number
          questions: Json
          time_limit_minutes: number | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          cargo_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_admin_id?: string | null
          participation_mode?: string
          passing_score?: number
          questions?: Json
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          cargo_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_admin_id?: string | null
          participation_mode?: string
          passing_score?: number
          questions?: Json
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "centrodecustos"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamentos: {
        Row: {
          carga_horaria: number | null
          certificado_url: string | null
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          employee_id: string | null
          id: string
          instituicao: string | null
          nome_treinamento: string
          observacoes: string | null
          owner_admin_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          carga_horaria?: number | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          employee_id?: string | null
          id?: string
          instituicao?: string | null
          nome_treinamento: string
          observacoes?: string | null
          owner_admin_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          carga_horaria?: number | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          employee_id?: string | null
          id?: string
          instituicao?: string | null
          nome_treinamento?: string
          observacoes?: string | null
          owner_admin_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamentos_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invites: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          owner_admin_id: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          owner_admin_id?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          owner_admin_id?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          analysis_access: string[] | null
          branch_access: string[] | null
          company_access: string[] | null
          cost_center_access: string[] | null
          created_at: string | null
          created_by_admin_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          analysis_access?: string[] | null
          branch_access?: string[] | null
          company_access?: string[] | null
          cost_center_access?: string[] | null
          created_at?: string | null
          created_by_admin_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          analysis_access?: string[] | null
          branch_access?: string[] | null
          company_access?: string[] | null
          cost_center_access?: string[] | null
          created_at?: string | null
          created_by_admin_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      diagnosticos_masked: {
        Row: {
          cargo: string | null
          created_at: string | null
          diagnostico_ia: string | null
          email: string | null
          empresa: string | null
          id: string | null
          nivel_maturidade: string | null
          nome: string | null
          respostas: Json | null
          score_automacao: number | null
          score_cultura: number | null
          score_dados_governanca: number | null
          score_ia: number | null
          score_people_analytics: number | null
          score_total: number | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          diagnostico_ia?: string | null
          email?: never
          empresa?: string | null
          id?: string | null
          nivel_maturidade?: string | null
          nome?: never
          respostas?: Json | null
          score_automacao?: number | null
          score_cultura?: number | null
          score_dados_governanca?: number | null
          score_ia?: number | null
          score_people_analytics?: number | null
          score_total?: number | null
          telefone?: never
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          diagnostico_ia?: string | null
          email?: never
          empresa?: string | null
          id?: string | null
          nivel_maturidade?: string | null
          nome?: never
          respostas?: Json | null
          score_automacao?: number | null
          score_cultura?: number | null
          score_dados_governanca?: number | null
          score_ia?: number | null
          score_people_analytics?: number | null
          score_total?: number | null
          telefone?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      employees_masked: {
        Row: {
          causademissao: string | null
          chave_empresa: string | null
          codcentrodecustos: string | null
          codempresa: string | null
          codfilial: string | null
          codigocargo: string | null
          codigonacionalidade: string | null
          codlocal: string | null
          codsituacao: string | null
          cpf: string | null
          created_at: string | null
          dataadmissao: string | null
          dataafastamento: string | null
          datainclusao: string | null
          datanascimento: string | null
          escolaridade: string | null
          estadocivil: string | null
          id: string | null
          matricula: string | null
          nome: string | null
          owner_admin_id: string | null
          pcd: string | null
          periodopagamento: string | null
          racacor: string | null
          sexo: string | null
          situacaoafastamento: string | null
          tipocontrato: string | null
          tipodecolaborador: string | null
          updated_at: string | null
          valorsalario: number | null
        }
        Insert: {
          causademissao?: string | null
          chave_empresa?: string | null
          codcentrodecustos?: string | null
          codempresa?: string | null
          codfilial?: string | null
          codigocargo?: string | null
          codigonacionalidade?: string | null
          codlocal?: string | null
          codsituacao?: string | null
          cpf?: never
          created_at?: string | null
          dataadmissao?: string | null
          dataafastamento?: string | null
          datainclusao?: string | null
          datanascimento?: string | null
          escolaridade?: string | null
          estadocivil?: string | null
          id?: string | null
          matricula?: string | null
          nome?: never
          owner_admin_id?: string | null
          pcd?: string | null
          periodopagamento?: string | null
          racacor?: string | null
          sexo?: string | null
          situacaoafastamento?: string | null
          tipocontrato?: string | null
          tipodecolaborador?: string | null
          updated_at?: string | null
          valorsalario?: never
        }
        Update: {
          causademissao?: string | null
          chave_empresa?: string | null
          codcentrodecustos?: string | null
          codempresa?: string | null
          codfilial?: string | null
          codigocargo?: string | null
          codigonacionalidade?: string | null
          codlocal?: string | null
          codsituacao?: string | null
          cpf?: never
          created_at?: string | null
          dataadmissao?: string | null
          dataafastamento?: string | null
          datainclusao?: string | null
          datanascimento?: string | null
          escolaridade?: string | null
          estadocivil?: string | null
          id?: string | null
          matricula?: string | null
          nome?: never
          owner_admin_id?: string | null
          pcd?: string | null
          periodopagamento?: string | null
          racacor?: string | null
          sexo?: string | null
          situacaoafastamento?: string | null
          tipocontrato?: string | null
          tipodecolaborador?: string | null
          updated_at?: string | null
          valorsalario?: never
        }
        Relationships: []
      }
    }
    Functions: {
      admin_has_own_employees: { Args: { _user_id: string }; Returns: boolean }
      get_owner_admin_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mask_cpf: { Args: { cpf: string }; Returns: string }
      mask_email: { Args: { email: string }; Returns: string }
      mask_phone: { Args: { phone: string }; Returns: string }
      mask_salary: { Args: { salary: number }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "gestor" | "analista" | "visualizador"
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
      app_role: ["admin", "gestor", "analista", "visualizador"],
    },
  },
} as const

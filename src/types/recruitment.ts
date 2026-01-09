// Tipos para o módulo de Recrutamento e Seleção

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  curriculo_url?: string;
  foto_url?: string;
  resumo_profissional?: string;
  pretensao_salarial?: number;
  disponibilidade?: string;
  fonte?: string;
  status: 'ativo' | 'inativo' | 'contratado' | 'arquivado';
  created_at?: string;
  updated_at?: string;
  skills?: CandidatoSkill[];
  experiencias?: CandidatoExperiencia[];
  formacoes?: CandidatoFormacao[];
}

export interface CandidatoSkill {
  id: string;
  candidato_id: string;
  skill_name: string;
  skill_category?: string;
  nivel?: 'basico' | 'intermediario' | 'avancado' | 'especialista';
  anos_experiencia?: number;
}

export interface CandidatoExperiencia {
  id: string;
  candidato_id: string;
  empresa: string;
  cargo: string;
  data_inicio?: string;
  data_fim?: string;
  atual: boolean;
  descricao?: string;
}

export interface CandidatoFormacao {
  id: string;
  candidato_id: string;
  instituicao: string;
  curso: string;
  nivel?: 'tecnico' | 'graduacao' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  data_inicio?: string;
  data_conclusao?: string;
  em_andamento: boolean;
}

export interface Vaga {
  id: string;
  titulo: string;
  cargo_id?: string;
  cargo_titulo?: string;
  codcentrodecustos?: string;
  codempresa?: string;
  descricao?: string;
  requisitos?: string;
  beneficios?: string;
  tipo_contrato?: 'clt' | 'pj' | 'estagio' | 'temporario' | 'freelancer';
  modalidade?: 'presencial' | 'hibrido' | 'remoto';
  local?: string;
  salario_min?: number;
  salario_max?: number;
  quantidade_vagas: number;
  data_abertura: string;
  data_limite?: string;
  status: 'aberta' | 'em_analise' | 'fechada' | 'cancelada' | 'pausada';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  publicado?: boolean;
  created_at?: string;
  updated_at?: string;
  skills?: VagaSkill[];
}

export interface VagaSkill {
  id: string;
  vaga_id: string;
  skill_name: string;
  skill_category?: string;
  nivel_minimo?: 'basico' | 'intermediario' | 'avancado' | 'especialista';
  obrigatoria: boolean;
}

export type EtapaCandidatura = 'triagem' | 'entrevista_rh' | 'teste_tecnico' | 'entrevista_gestor' | 'proposta' | 'contratado' | 'reprovado' | 'desistencia';

export interface Candidatura {
  id: string;
  candidato_id: string;
  vaga_id: string;
  etapa: EtapaCandidatura;
  status: 'em_analise' | 'aprovado' | 'reprovado' | 'aguardando';
  match_score?: number;
  match_detalhes?: MatchDetalhes;
  data_candidatura: string;
  data_atualizacao?: string;
  notas?: string;
  candidato?: Candidato;
  vaga?: Vaga;
  entrevistas?: Entrevista[];
  feedbacks?: CandidaturaFeedback[];
}

export interface MatchDetalhes {
  score_skills: number;
  score_experiencia: number;
  score_formacao: number;
  score_salario: number;
  skills_match: { skill: string; candidato_nivel?: string; vaga_nivel?: string; match: boolean }[];
  gaps: string[];
  pontos_fortes: string[];
  resumo_ia?: string;
}

export interface Entrevista {
  id: string;
  candidatura_id: string;
  tipo: 'rh' | 'tecnica' | 'gestor' | 'cultura' | 'final';
  data_hora: string;
  duracao_minutos: number;
  local?: string;
  link_online?: string;
  entrevistadores?: string[];
  status: 'agendada' | 'realizada' | 'cancelada' | 'remarcada' | 'nao_compareceu';
  notas?: string;
}

export interface CandidaturaFeedback {
  id: string;
  candidatura_id: string;
  entrevista_id?: string;
  avaliador_id?: string;
  avaliador_nome?: string;
  tipo: 'triagem' | 'entrevista' | 'teste' | 'final';
  nota_geral?: number;
  criterios?: {
    criterio: string;
    nota: number;
    peso?: number;
    comentario?: string;
  }[];
  pontos_fortes?: string;
  pontos_melhoria?: string;
  recomendacao?: 'aprovar' | 'reprovar' | 'reavaliar';
  comentarios?: string;
  created_at?: string;
}

export const ETAPAS_PIPELINE: { key: EtapaCandidatura; label: string; color: string }[] = [
  { key: 'triagem', label: 'Triagem', color: 'bg-slate-500' },
  { key: 'entrevista_rh', label: 'Entrevista RH', color: 'bg-blue-500' },
  { key: 'teste_tecnico', label: 'Teste Técnico', color: 'bg-purple-500' },
  { key: 'entrevista_gestor', label: 'Entrevista Gestor', color: 'bg-amber-500' },
  { key: 'proposta', label: 'Proposta', color: 'bg-emerald-500' },
  { key: 'contratado', label: 'Contratado', color: 'bg-green-600' },
  { key: 'reprovado', label: 'Reprovado', color: 'bg-red-500' },
  { key: 'desistencia', label: 'Desistência', color: 'bg-gray-400' },
];

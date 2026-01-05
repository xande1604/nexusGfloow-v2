import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, UserCheck, Clock, TrendingUp, Calendar } from 'lucide-react';
import { ETAPAS_PIPELINE, type Candidato, type Vaga, type Candidatura } from '@/types/recruitment';
import { Progress } from '@/components/ui/progress';

interface RecruitmentDashboardProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  candidaturas: Candidatura[];
}

export const RecruitmentDashboard = ({ candidatos, vagas, candidaturas }: RecruitmentDashboardProps) => {
  const vagasAbertas = vagas.filter(v => v.status === 'aberta').length;
  const candidatosAtivos = candidatos.filter(c => c.status === 'ativo').length;
  const candidaturasEmAnalise = candidaturas.filter(c => c.status === 'em_analise').length;
  const contratados = candidaturas.filter(c => c.etapa === 'contratado').length;

  // Pipeline stats
  const pipelineStats = ETAPAS_PIPELINE.slice(0, 6).map(etapa => ({
    ...etapa,
    count: candidaturas.filter(c => c.etapa === etapa.key).length,
  }));

  // Recent candidaturas (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCandidaturas = candidaturas.filter(c => 
    new Date(c.data_candidatura) >= sevenDaysAgo
  ).length;

  // Average match score
  const avgMatchScore = candidaturas.length > 0
    ? Math.round(
        candidaturas
          .filter(c => c.match_score != null)
          .reduce((acc, c) => acc + (c.match_score || 0), 0) / 
        candidaturas.filter(c => c.match_score != null).length || 0
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vagasAbertas}</p>
                <p className="text-sm text-muted-foreground">Vagas Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidatosAtivos}</p>
                <p className="text-sm text-muted-foreground">Candidatos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidaturasEmAnalise}</p>
                <p className="text-sm text-muted-foreground">Em Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contratados}</p>
                <p className="text-sm text-muted-foreground">Contratados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pipeline de Recrutamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineStats.map((etapa) => (
              <div key={etapa.key} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{etapa.label}</div>
                <div className="flex-1">
                  <Progress 
                    value={candidaturas.length > 0 ? (etapa.count / candidaturas.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className={`w-8 h-8 rounded-full ${etapa.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {etapa.count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm">Novas candidaturas (7 dias)</span>
                <span className="text-lg font-bold text-brand-600">{recentCandidaturas}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm">Score médio de match</span>
                <span className="text-lg font-bold text-brand-600">{avgMatchScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm">Taxa de conversão</span>
                <span className="text-lg font-bold text-brand-600">
                  {candidaturas.length > 0 ? Math.round((contratados / candidaturas.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Vagas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Vagas com Mais Candidatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vagas
                .filter(v => v.status === 'aberta')
                .map(vaga => ({
                  ...vaga,
                  candidatosCount: candidaturas.filter(c => c.vaga_id === vaga.id).length
                }))
                .sort((a, b) => b.candidatosCount - a.candidatosCount)
                .slice(0, 5)
                .map((vaga) => (
                  <div key={vaga.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{vaga.titulo}</p>
                      <p className="text-xs text-muted-foreground">{vaga.modalidade || 'Não definido'}</p>
                    </div>
                    <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded text-sm font-medium">
                      {vaga.candidatosCount} candidatos
                    </span>
                  </div>
                ))}
              {vagas.filter(v => v.status === 'aberta').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma vaga aberta no momento
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

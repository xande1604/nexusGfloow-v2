import { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  Route, 
  ClipboardCheck, 
  Building2, 
  Users,
  Play,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TutorialModal } from './TutorialModal';

// Import tutorial images
import dashboardImg from '@/assets/tutorials/dashboard-overview.png';
import rolesImg from '@/assets/tutorials/roles-management.png';
import rolesListImg from '@/assets/tutorials/roles-list.png';
import rolesEditFormImg from '@/assets/tutorials/roles-edit-form.png';
import rolesAiRefinementImg from '@/assets/tutorials/roles-ai-refinement.png';
import skillsImg from '@/assets/tutorials/skills-repository.png';
import roadmapImg from '@/assets/tutorials/career-roadmap.png';
import performanceImg from '@/assets/tutorials/performance-reviews.png';
import employeesImg from '@/assets/tutorials/employees-management.png';
import costCentersImg from '@/assets/tutorials/cost-centers-management.png';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  steps: TutorialStep[];
  category: 'basics' | 'advanced';
}

export interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Aprenda a interpretar os indicadores e métricas do painel principal.',
    icon: LayoutDashboard,
    duration: '3 min',
    category: 'basics',
    steps: [
      {
        title: 'Visão geral do Dashboard',
        description: 'O Dashboard é sua central de comando. Aqui você encontra uma visão consolidada de todos os indicadores importantes da gestão de talentos: total de colaboradores, cargos, habilidades mapeadas e roadmaps criados.',
        image: dashboardImg
      },
      {
        title: 'Cards de estatísticas',
        description: 'Cada card no topo mostra uma métrica chave. Clique nos cards para navegar diretamente para o módulo relacionado e explorar os dados em detalhes.',
        image: dashboardImg
      },
      {
        title: 'Análise rápida',
        description: 'Use o Dashboard como ponto de partida para identificar áreas que precisam de atenção, como falta de habilidades mapeadas ou avaliações pendentes.',
        image: dashboardImg
      }
    ]
  },
  {
    id: 'roles',
    title: 'Cargos e Salários',
    description: 'Configure cargos, níveis hierárquicos e faixas salariais da empresa.',
    icon: Briefcase,
    duration: '5 min',
    category: 'basics',
    steps: [
      {
        title: 'Cadastro de cargos',
        description: 'Clique em "Novo Cargo" para adicionar um cargo. Preencha o título, nível hierárquico (Estagiário a C-Level), departamento e faixa salarial.',
        image: rolesListImg
      },
      {
        title: 'Refinamento com IA',
        description: 'Use o botão "Refinar com IA" para gerar automaticamente descrições, conhecimentos técnicos, hard skills, soft skills e entregas esperadas baseadas no título do cargo.',
        image: rolesAiRefinementImg
      },
      {
        title: 'Vinculação de habilidades',
        description: 'Associe habilidades existentes ao cargo para definir o perfil técnico e comportamental esperado. Isso alimenta os roadmaps de carreira.',
        image: rolesEditFormImg
      },
      {
        title: 'Gestão de salários',
        description: 'Defina faixas salariais mínimas e máximas para cada cargo. Isso ajuda no planejamento de headcount e orçamento.',
        image: rolesEditFormImg
      }
    ]
  },
  {
    id: 'skills',
    title: 'Habilidades',
    description: 'Crie e organize o repositório de competências da organização.',
    icon: Sparkles,
    duration: '4 min',
    category: 'basics',
    steps: [
      {
        title: 'Categorias de habilidades',
        description: 'As habilidades são organizadas em 4 categorias: Technical (habilidades técnicas), Soft Skill (comportamentais), Language (idiomas) e Leadership (liderança).',
        image: skillsImg
      },
      {
        title: 'Criação manual',
        description: 'Clique em "Nova Habilidade" para adicionar manualmente. Informe nome, categoria e uma descrição opcional.',
        image: skillsImg
      },
      {
        title: 'Geração com IA',
        description: 'Use "Gerar com IA" para criar habilidades automaticamente. Selecione um cargo existente ou digite um título, e o sistema sugere habilidades relevantes.',
        image: skillsImg
      },
      {
        title: 'Filtros e busca',
        description: 'Use os filtros por categoria e a busca por nome para encontrar rapidamente as habilidades cadastradas.',
        image: skillsImg
      }
    ]
  },
  {
    id: 'employees',
    title: 'Colaboradores',
    description: 'Gerencie o cadastro de funcionários e suas informações.',
    icon: Users,
    duration: '4 min',
    category: 'basics',
    steps: [
      {
        title: 'Listagem de colaboradores',
        description: 'Visualize todos os colaboradores com nome, cargo, e-mail e data de admissão. Use a busca para encontrar pessoas específicas.',
        image: employeesImg
      },
      {
        title: 'Cadastro de colaborador',
        description: 'Adicione colaboradores com nome, e-mail (necessário para avaliações), cargo e data de admissão. O e-mail permite acesso ao portal de autoavaliação.',
        image: employeesImg
      },
      {
        title: 'Gestor responsável',
        description: 'Vincule cada colaborador a um gestor. O gestor será responsável por realizar a avaliação de desempenho após a autoavaliação.',
        image: employeesImg
      },
      {
        title: 'Integração com avaliações',
        description: 'Colaboradores com e-mail cadastrado podem participar de ciclos de avaliação, recebendo convites para autoavaliação.',
        image: employeesImg
      }
    ]
  },
  {
    id: 'cost-centers',
    title: 'Centros de Custos',
    description: 'Organize colaboradores por centros de custos e departamentos.',
    icon: Building2,
    duration: '3 min',
    category: 'basics',
    steps: [
      {
        title: 'Estrutura organizacional',
        description: 'Centros de custos representam a estrutura departamental da empresa. Cada centro pode ter múltiplos colaboradores vinculados.',
        image: costCentersImg
      },
      {
        title: 'Filtro por empresa',
        description: 'Se você gerencia múltiplas empresas, use o filtro para visualizar os centros de custos de cada uma separadamente.',
        image: costCentersImg
      },
      {
        title: 'Contagem de colaboradores',
        description: 'Cada centro de custos exibe o número de colaboradores vinculados, facilitando a análise de distribuição de headcount.',
        image: costCentersImg
      }
    ]
  },
  {
    id: 'roadmap',
    title: 'Roadmap de Carreira',
    description: 'Crie planos de desenvolvimento personalizados com IA.',
    icon: Route,
    duration: '5 min',
    category: 'advanced',
    steps: [
      {
        title: 'O que é um Roadmap',
        description: 'Um roadmap de carreira é um plano estruturado que mostra os passos necessários para um colaborador evoluir de um cargo atual para um cargo alvo.',
        image: roadmapImg
      },
      {
        title: 'Geração com IA',
        description: 'Selecione o cargo atual, o cargo desejado e opcionalmente o colaborador. A IA gera automaticamente os passos, habilidades necessárias e duração estimada.',
        image: roadmapImg
      },
      {
        title: 'Passos do roadmap',
        description: 'Cada passo inclui título, descrição detalhada, habilidades a desenvolver e tempo estimado. Use isso para criar PDIs (Planos de Desenvolvimento Individual).',
        image: roadmapImg
      },
      {
        title: 'Exportação em PDF',
        description: 'Exporte o roadmap em PDF para compartilhar com o colaborador ou arquivar no prontuário. O PDF inclui todos os detalhes do plano.',
        image: roadmapImg
      }
    ]
  },
  {
    id: 'performance',
    title: 'Avaliações de Desempenho',
    description: 'Configure ciclos de avaliação e acompanhe autoavaliações.',
    icon: ClipboardCheck,
    duration: '7 min',
    category: 'advanced',
    steps: [
      {
        title: 'Ciclos de avaliação',
        description: 'Crie ciclos com período definido (ex: Avaliação Anual 2024). Cada ciclo agrupa as avaliações de múltiplos colaboradores.',
        image: performanceImg
      },
      {
        title: 'Adicionando colaboradores',
        description: 'Dentro do ciclo, adicione colaboradores individualmente. A IA gera perguntas personalizadas baseadas no cargo de cada pessoa.',
        image: performanceImg
      },
      {
        title: 'Fluxo de avaliação',
        description: 'O processo tem 2 etapas: primeiro o colaborador faz a autoavaliação (portal público), depois o gestor realiza a avaliação final.',
        image: performanceImg
      },
      {
        title: 'Envio de convites',
        description: 'Envie convites por e-mail via webhook n8n. O sistema envia automaticamente para o participante correto (colaborador ou gestor) baseado no status.',
        image: performanceImg
      },
      {
        title: 'Histórico de convites',
        description: 'Visualize o histórico de todos os convites enviados para cada avaliação, incluindo data, hora e destinatário.',
        image: performanceImg
      },
      {
        title: 'Templates de perguntas',
        description: 'Configure templates de perguntas por categoria (Técnica, Cultural, Soft Skill, Metas) para reutilizar em futuras avaliações.',
        image: performanceImg
      }
    ]
  }
];

export const TutorialsView = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed-tutorials');
    return saved ? JSON.parse(saved) : [];
  });

  const handleCompleteTutorial = (tutorialId: string) => {
    const updated = [...completedTutorials, tutorialId];
    setCompletedTutorials(updated);
    localStorage.setItem('completed-tutorials', JSON.stringify(updated));
  };

  const basicTutorials = tutorials.filter(t => t.category === 'basics');
  const advancedTutorials = tutorials.filter(t => t.category === 'advanced');
  
  const completedCount = completedTutorials.length;
  const totalCount = tutorials.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tutoriais</h1>
          <p className="text-muted-foreground mt-1">
            Aprenda a usar todas as funcionalidades do sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progresso</p>
            <p className="text-lg font-semibold text-foreground">
              {completedCount} de {totalCount} concluídos
            </p>
          </div>
          <div className="w-32">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Basic Tutorials */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Badge variant="secondary">Básico</Badge>
          Fundamentos do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {basicTutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            const isCompleted = completedTutorials.includes(tutorial.id);
            
            return (
              <Card 
                key={tutorial.id} 
                className={`cursor-pointer transition-all hover:shadow-medium hover:border-brand-300 ${
                  isCompleted ? 'border-success/50 bg-success/5' : ''
                }`}
                onClick={() => setSelectedTutorial(tutorial)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        {tutorial.duration}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{tutorial.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={isCompleted ? "outline" : "default"} 
                    size="sm" 
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isCompleted ? 'Rever Tutorial' : 'Iniciar Tutorial'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Advanced Tutorials */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Badge variant="outline" className="border-brand-500 text-brand-600">Avançado</Badge>
          Funcionalidades com IA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedTutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            const isCompleted = completedTutorials.includes(tutorial.id);
            
            return (
              <Card 
                key={tutorial.id} 
                className={`cursor-pointer transition-all hover:shadow-medium hover:border-brand-300 ${
                  isCompleted ? 'border-success/50 bg-success/5' : ''
                }`}
                onClick={() => setSelectedTutorial(tutorial)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        {tutorial.duration}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{tutorial.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={isCompleted ? "outline" : "default"} 
                    size="sm" 
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isCompleted ? 'Rever Tutorial' : 'Iniciar Tutorial'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        tutorial={selectedTutorial}
        allTutorials={tutorials}
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
        onComplete={handleCompleteTutorial}
        onNavigateToTutorial={(tutorial) => setSelectedTutorial(tutorial)}
        isCompleted={selectedTutorial ? completedTutorials.includes(selectedTutorial.id) : false}
        completedTutorials={completedTutorials}
      />
    </div>
  );
};

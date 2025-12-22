import { useState, useMemo } from 'react';
import { Award, Filter, BookOpen, Calendar, Search, X, Sparkles, Target, Languages, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmployeeSkill } from '@/hooks/useEmployeeSkills';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeSkillsPanelProps {
  skills: EmployeeSkill[];
  employeeName: string;
  loading?: boolean;
}

export const EmployeeSkillsPanel = ({ skills, employeeName, loading }: EmployeeSkillsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Extract unique categories and sources
  const categories = useMemo(() => {
    const cats = new Set(skills.map(s => s.skill_category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [skills]);

  const sources = useMemo(() => {
    const srcs = new Set(skills.map(s => s.source_name).filter(Boolean));
    return Array.from(srcs) as string[];
  }, [skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || skill.skill_category === categoryFilter;
      const matchesSource = sourceFilter === 'all' || skill.source_name === sourceFilter;
      return matchesSearch && matchesCategory && matchesSource;
    });
  }, [skills, searchTerm, categoryFilter, sourceFilter]);

  // Group by category for display
  const groupedSkills = useMemo(() => {
    const groups: Record<string, EmployeeSkill[]> = {};
    filteredSkills.forEach(skill => {
      const cat = skill.skill_category || 'Outros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  }, [filteredSkills]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical':
        return <Target className="w-4 h-4" />;
      case 'Soft Skill':
        return <Users className="w-4 h-4" />;
      case 'Leadership':
        return <Sparkles className="w-4 h-4" />;
      case 'Language':
        return <Languages className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-info/10 text-info border-info/20';
      case 'Soft Skill':
        return 'bg-success/10 text-success border-success/20';
      case 'Leadership':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Language':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'training':
        return 'Treinamento';
      case 'evaluation':
        return 'Avaliação';
      case 'manual':
        return 'Manual';
      default:
        return sourceType;
    }
  };

  const hasFilters = searchTerm || categoryFilter !== 'all' || sourceFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSourceFilter('all');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Carregando habilidades...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Habilidades de {employeeName}</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          {skills.length} habilidade{skills.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar habilidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Fontes</SelectItem>
            {sources.map(src => (
              <SelectItem key={src} value={src}>{src}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              {skills.length === 0 ? 'Nenhuma habilidade registrada' : 'Nenhuma habilidade encontrada'}
            </h4>
            <p className="text-muted-foreground text-sm max-w-md">
              {skills.length === 0
                ? 'As habilidades serão adicionadas automaticamente quando treinamentos forem concluídos e analisados pela IA.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`p-1.5 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </span>
                  {category}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {categorySkills.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 rounded-lg border border-border bg-background hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{skill.skill_name}</span>
                            <Badge className={getCategoryColor(skill.skill_category || '')}>
                              {skill.skill_category}
                            </Badge>
                          </div>
                          {skill.source_name && (
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {skill.source_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getSourceTypeLabel(skill.source_type)}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(skill.acquired_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {skills.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-info">
                {skills.filter(s => s.skill_category === 'Technical').length}
              </div>
              <div className="text-xs text-muted-foreground">Técnicas</div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {skills.filter(s => s.skill_category === 'Soft Skill').length}
              </div>
              <div className="text-xs text-muted-foreground">Soft Skills</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {skills.filter(s => s.skill_category === 'Leadership').length}
              </div>
              <div className="text-xs text-muted-foreground">Liderança</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {skills.filter(s => s.skill_category === 'Language').length}
              </div>
              <div className="text-xs text-muted-foreground">Idiomas</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

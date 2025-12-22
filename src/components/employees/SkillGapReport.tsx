import { useState, useMemo } from 'react';
import { Search, AlertTriangle, CheckCircle2, TrendingUp, Target, User, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { EmployeeSkill } from '@/hooks/useEmployeeSkills';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SkillGapReportProps {
  employees: Employee[];
  roles: JobRole[];
  allSkills: EmployeeSkill[];
}

interface EmployeeGapData {
  employee: Employee;
  role: JobRole | undefined;
  requiredSkills: string[];
  acquiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  coveragePercent: number;
}

export const SkillGapReport = ({ employees, roles, allSkills }: SkillGapReportProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterCoverage, setFilterCoverage] = useState<string>('all');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  // Parse required skills from role fields
  const parseSkillsFromRole = (role: JobRole): string[] => {
    const skillsSet = new Set<string>();
    
    const parseField = (field: string | undefined) => {
      if (!field) return;
      // Split by common delimiters and clean up
      const items = field.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
      items.forEach(item => skillsSet.add(item.toLowerCase()));
    };

    parseField(role.technicalKnowledge);
    parseField(role.hardSkills);
    parseField(role.softSkills);

    return Array.from(skillsSet);
  };

  // Calculate gap data for each employee
  const gapData: EmployeeGapData[] = useMemo(() => {
    return employees.map(employee => {
      const role = roles.find(r => r.id === employee.roleId);
      const requiredSkills = role ? parseSkillsFromRole(role) : [];
      
      // Get employee's acquired skills
      const employeeSkills = allSkills.filter(s => s.employee_id === employee.id);
      const acquiredSkills = employeeSkills.map(s => s.skill_name.toLowerCase());
      
      // Calculate matches and gaps
      const matchedSkills = requiredSkills.filter(req => 
        acquiredSkills.some(acq => 
          acq.includes(req) || req.includes(acq) || 
          acq.split(' ').some(word => req.includes(word) && word.length > 3)
        )
      );
      
      const missingSkills = requiredSkills.filter(req => !matchedSkills.includes(req));
      
      const coveragePercent = requiredSkills.length > 0 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

      return {
        employee,
        role,
        requiredSkills,
        acquiredSkills,
        matchedSkills,
        missingSkills,
        coveragePercent,
      };
    });
  }, [employees, roles, allSkills]);

  // Filter and search
  const filteredData = useMemo(() => {
    return gapData.filter(item => {
      // Search filter
      const matchesSearch = item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role?.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const matchesRole = filterRole === 'all' || item.role?.id === filterRole;
      
      // Coverage filter
      let matchesCoverage = true;
      if (filterCoverage === 'critical') matchesCoverage = item.coveragePercent < 30;
      else if (filterCoverage === 'low') matchesCoverage = item.coveragePercent >= 30 && item.coveragePercent < 60;
      else if (filterCoverage === 'medium') matchesCoverage = item.coveragePercent >= 60 && item.coveragePercent < 80;
      else if (filterCoverage === 'high') matchesCoverage = item.coveragePercent >= 80;
      
      return matchesSearch && matchesRole && matchesCoverage;
    });
  }, [gapData, searchTerm, filterRole, filterCoverage]);

  // Summary stats
  const stats = useMemo(() => {
    const total = gapData.length;
    const withRole = gapData.filter(d => d.role && d.requiredSkills.length > 0).length;
    const criticalGap = gapData.filter(d => d.coveragePercent < 30 && d.requiredSkills.length > 0).length;
    const avgCoverage = withRole > 0 
      ? Math.round(gapData.filter(d => d.requiredSkills.length > 0).reduce((sum, d) => sum + d.coveragePercent, 0) / withRole)
      : 0;
    
    return { total, withRole, criticalGap, avgCoverage };
  }, [gapData]);

  const getCoverageColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-600';
    if (percent >= 60) return 'text-amber-600';
    if (percent >= 30) return 'text-orange-600';
    return 'text-destructive';
  };

  const getCoverageBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 60) return 'bg-amber-500';
    if (percent >= 30) return 'bg-orange-500';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Relatório de Gap de Habilidades
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Comparativo entre habilidades requeridas pelo cargo e habilidades adquiridas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.withRole}</p>
                <p className="text-sm text-muted-foreground">Com Skills Mapeadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.criticalGap}</p>
                <p className="text-sm text-muted-foreground">Gap Crítico (&lt;30%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgCoverage}%</p>
                <p className="text-sm text-muted-foreground">Cobertura Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaborador ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cargos</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.id}>{role.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCoverage} onValueChange={setFilterCoverage}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por cobertura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Coberturas</SelectItem>
            <SelectItem value="critical">Crítico (&lt;30%)</SelectItem>
            <SelectItem value="low">Baixo (30-59%)</SelectItem>
            <SelectItem value="medium">Médio (60-79%)</SelectItem>
            <SelectItem value="high">Alto (≥80%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gap Report List */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum colaborador encontrado com os filtros aplicados
            </CardContent>
          </Card>
        ) : (
          filteredData.map(item => (
            <Collapsible
              key={item.employee.id}
              open={expandedEmployee === item.employee.id}
              onOpenChange={(open) => setExpandedEmployee(open ? item.employee.id : null)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-medium">{item.employee.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {item.role?.title || 'Cargo não definido'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className={`text-lg font-bold ${getCoverageColor(item.coveragePercent)}`}>
                            {item.coveragePercent}%
                          </p>
                          <p className="text-xs text-muted-foreground">cobertura</p>
                        </div>

                        <div className="w-24 hidden md:block">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${getCoverageBarColor(item.coveragePercent)}`}
                              style={{ width: `${item.coveragePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.missingSkills.length > 0 && (
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              {item.missingSkills.length} gaps
                            </Badge>
                          )}
                          {expandedEmployee === item.employee.id ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 border-t border-border">
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      {/* Habilidades Adquiridas */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Habilidades Adquiridas ({item.matchedSkills.length})
                        </h4>
                        {item.matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.matchedSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Nenhuma habilidade adquirida mapeada
                          </p>
                        )}

                        {item.acquiredSkills.length > item.matchedSkills.length && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-2">
                              Outras habilidades do colaborador:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.acquiredSkills
                                .filter(s => !item.matchedSkills.some(m => s.includes(m) || m.includes(s)))
                                .slice(0, 5)
                                .map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Gap de Habilidades */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          Gap de Habilidades ({item.missingSkills.length})
                        </h4>
                        {item.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.missingSkills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="border-destructive/30 text-destructive">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : item.requiredSkills.length > 0 ? (
                          <p className="text-sm text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Todas as habilidades requeridas foram adquiridas!
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Cargo sem habilidades mapeadas
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Recomendação */}
                    {item.missingSkills.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>Recomendação:</strong> Considere treinamentos focados em{' '}
                          {item.missingSkills.slice(0, 3).join(', ')}
                          {item.missingSkills.length > 3 && ` e mais ${item.missingSkills.length - 3} habilidades`}.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

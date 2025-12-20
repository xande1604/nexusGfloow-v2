import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  Target,
  Award,
  GraduationCap,
  Filter,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { CareerRoadmap, JobRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EmployeeWithDetails {
  id: string;
  nome: string;
  codempresa: string;
  codcentrodecustos: string;
  codigocargo: string;
}

interface CareerProgressDashboardProps {
  roadmaps: CareerRoadmap[];
  roles: JobRole[];
}

interface Empresa {
  codempresa: string;
  nomeempresa: string;
}

interface CostCenter {
  codcentrodecustos: string;
  nomecentrodecustos: string;
  codempresa: string;
}

export const CareerProgressDashboard = ({ roadmaps, roles }: CareerProgressDashboardProps) => {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('all');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('all');
  const [selectedCargo, setSelectedCargo] = useState<string>('all');

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empResult, empresasResult, ccResult] = await Promise.all([
          supabase.from('employees').select('id, nome, codempresa, codcentrodecustos, codigocargo'),
          supabase.from('empresas').select('codempresa, nomeempresa'),
          supabase.from('centrodecustos').select('codcentrodecustos, nomecentrodecustos, codempresa')
        ]);

        setEmployees(empResult.data || []);
        setEmpresas(empresasResult.data || []);
        setCostCenters(ccResult.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter cost centers based on selected empresa
  const filteredCostCenters = useMemo(() => {
    if (selectedEmpresa === 'all') return costCenters;
    return costCenters.filter(cc => cc.codempresa === selectedEmpresa);
  }, [costCenters, selectedEmpresa]);

  // Get unique cargos from roles
  const uniqueCargos = useMemo(() => {
    return roles.map(r => ({ id: r.id, title: r.title }));
  }, [roles]);

  // Filter roadmaps based on selections
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(roadmap => {
      if (!roadmap.employeeId) return false;
      
      const employee = employees.find(e => e.id === roadmap.employeeId);
      if (!employee) return false;

      if (selectedEmpresa !== 'all' && employee.codempresa !== selectedEmpresa) return false;
      if (selectedCostCenter !== 'all' && employee.codcentrodecustos !== selectedCostCenter) return false;
      if (selectedCargo !== 'all' && employee.codigocargo !== selectedCargo) return false;

      return true;
    });
  }, [roadmaps, employees, selectedEmpresa, selectedCostCenter, selectedCargo]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRoadmaps = filteredRoadmaps.length;
    const withProgress = filteredRoadmaps.filter(r => r.progress);
    const avgProgress = withProgress.length > 0
      ? Math.round(withProgress.reduce((acc, r) => acc + (r.progress?.progressPercentage || 0), 0) / withProgress.length)
      : 0;
    
    const totalSkillsAcquired = filteredRoadmaps.reduce((acc, r) => {
      const skills = r.progress?.updateHistory?.flatMap(u => u.acquiredSkills) || [];
      return acc + new Set(skills).size;
    }, 0);

    const totalTrainings = filteredRoadmaps.reduce((acc, r) => {
      return acc + (r.progress?.updateHistory?.reduce((t, u) => t + (u.completedTrainings?.length || 0), 0) || 0);
    }, 0);

    const completed = filteredRoadmaps.filter(r => (r.progress?.progressPercentage || 0) === 100).length;

    return { totalRoadmaps, avgProgress, totalSkillsAcquired, totalTrainings, completed };
  }, [filteredRoadmaps]);

  // Progress distribution by range
  const progressDistribution = useMemo(() => {
    const ranges = [
      { name: '0-25%', min: 0, max: 25, count: 0, color: '#ef4444' },
      { name: '26-50%', min: 26, max: 50, count: 0, color: '#f97316' },
      { name: '51-75%', min: 51, max: 75, count: 0, color: '#eab308' },
      { name: '76-99%', min: 76, max: 99, count: 0, color: '#22c55e' },
      { name: '100%', min: 100, max: 100, count: 0, color: '#10b981' },
    ];

    filteredRoadmaps.forEach(r => {
      const progress = r.progress?.progressPercentage || 0;
      const range = ranges.find(range => progress >= range.min && progress <= range.max);
      if (range) range.count++;
    });

    return ranges;
  }, [filteredRoadmaps]);

  // Progress by empresa
  const progressByEmpresa = useMemo(() => {
    const empresaMap = new Map<string, { name: string; total: number; avgProgress: number; count: number }>();

    filteredRoadmaps.forEach(roadmap => {
      const employee = employees.find(e => e.id === roadmap.employeeId);
      if (!employee?.codempresa) return;

      const empresa = empresas.find(e => e.codempresa === employee.codempresa);
      const empresaName = empresa?.nomeempresa || employee.codempresa;

      const existing = empresaMap.get(employee.codempresa) || { name: empresaName, total: 0, avgProgress: 0, count: 0 };
      existing.total += roadmap.progress?.progressPercentage || 0;
      existing.count++;
      existing.avgProgress = Math.round(existing.total / existing.count);
      empresaMap.set(employee.codempresa, existing);
    });

    return Array.from(empresaMap.values());
  }, [filteredRoadmaps, employees, empresas]);

  // Progress by cost center
  const progressByCostCenter = useMemo(() => {
    const ccMap = new Map<string, { name: string; total: number; avgProgress: number; count: number }>();

    filteredRoadmaps.forEach(roadmap => {
      const employee = employees.find(e => e.id === roadmap.employeeId);
      if (!employee?.codcentrodecustos) return;

      const cc = costCenters.find(c => c.codcentrodecustos === employee.codcentrodecustos);
      const ccName = cc?.nomecentrodecustos || employee.codcentrodecustos;

      const existing = ccMap.get(employee.codcentrodecustos) || { name: ccName, total: 0, avgProgress: 0, count: 0 };
      existing.total += roadmap.progress?.progressPercentage || 0;
      existing.count++;
      existing.avgProgress = Math.round(existing.total / existing.count);
      ccMap.set(employee.codcentrodecustos, existing);
    });

    return Array.from(ccMap.values()).slice(0, 10);
  }, [filteredRoadmaps, employees, costCenters]);

  // Progress by target role
  const progressByTargetRole = useMemo(() => {
    const roleMap = new Map<string, { name: string; total: number; avgProgress: number; count: number }>();

    filteredRoadmaps.forEach(roadmap => {
      const roleName = roadmap.targetRoleTitle;
      const existing = roleMap.get(roleName) || { name: roleName, total: 0, avgProgress: 0, count: 0 };
      existing.total += roadmap.progress?.progressPercentage || 0;
      existing.count++;
      existing.avgProgress = Math.round(existing.total / existing.count);
      roleMap.set(roleName, existing);
    });

    return Array.from(roleMap.values()).slice(0, 10);
  }, [filteredRoadmaps]);

  // Top skills acquired
  const topSkills = useMemo(() => {
    const skillCount = new Map<string, number>();

    filteredRoadmaps.forEach(roadmap => {
      roadmap.progress?.updateHistory?.forEach(update => {
        update.acquiredSkills.forEach(skill => {
          skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
        });
      });
    });

    return Array.from(skillCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRoadmaps]);

  // Monthly progress evolution
  const monthlyEvolution = useMemo(() => {
    const monthMap = new Map<string, { updates: number; skills: number }>();

    filteredRoadmaps.forEach(roadmap => {
      roadmap.progress?.updateHistory?.forEach(update => {
        const date = new Date(update.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthMap.get(monthKey) || { updates: 0, skills: 0 };
        existing.updates++;
        existing.skills += update.acquiredSkills.length;
        monthMap.set(monthKey, existing);
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        updates: data.updates,
        skills: data.skills
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [filteredRoadmaps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Empresa Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1" />
              Empresa
            </label>
            <div className="relative">
              <select
                value={selectedEmpresa}
                onChange={(e) => {
                  setSelectedEmpresa(e.target.value);
                  setSelectedCostCenter('all');
                }}
                className="w-full h-10 pl-3 pr-8 bg-secondary border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">Todas as empresas</option>
                {empresas.map(e => (
                  <option key={e.codempresa} value={e.codempresa}>{e.nomeempresa}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Cost Center Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Centro de Custos
            </label>
            <div className="relative">
              <select
                value={selectedCostCenter}
                onChange={(e) => setSelectedCostCenter(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-secondary border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">Todos os centros</option>
                {filteredCostCenters.map(cc => (
                  <option key={cc.codcentrodecustos} value={cc.codcentrodecustos}>{cc.nomecentrodecustos}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Cargo Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Users className="w-4 h-4 inline mr-1" />
              Cargo
            </label>
            <div className="relative">
              <select
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-secondary border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">Todos os cargos</option>
                {uniqueCargos.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Roadmaps</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalRoadmaps}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Progresso Médio</span>
          </div>
          <p className="text-3xl font-bold">{stats.avgProgress}%</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Habilidades</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSkillsAcquired}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Treinamentos</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalTrainings}</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Concluídos</span>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Distribution */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Progresso</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={progressDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                label={({ name, count }) => count > 0 ? `${name}: ${count}` : ''}
              >
                {progressDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Evolution */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Evolução Mensal</h3>
          {monthlyEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="updates" name="Atualizações" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="skills" name="Habilidades" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados de evolução
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Empresa */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Progresso por Empresa</h3>
          {progressByEmpresa.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressByEmpresa} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 11 }} 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progresso Médio']}
                />
                <Bar dataKey="avgProgress" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados por empresa
            </div>
          )}
        </div>

        {/* Progress by Cost Center */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Progresso por Centro de Custos</h3>
          {progressByCostCenter.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressByCostCenter} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 11 }} 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progresso Médio']}
                />
                <Bar dataKey="avgProgress" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados por centro de custos
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Target Role */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Progresso por Cargo Alvo</h3>
          {progressByTargetRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressByTargetRole}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progresso Médio']}
                />
                <Bar dataKey="avgProgress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados por cargo
            </div>
          )}
        </div>

        {/* Top Skills */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Habilidades Adquiridas</h3>
          {topSkills.length > 0 ? (
            <div className="space-y-3">
              {topSkills.map((skill, index) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index < 3 ? "bg-brand-100 text-brand-700" : "bg-secondary text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.count} colaboradores</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all"
                        style={{ width: `${(skill.count / (topSkills[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem habilidades registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

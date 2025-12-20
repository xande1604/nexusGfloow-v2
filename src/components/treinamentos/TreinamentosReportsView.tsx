import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Users, Building2, Calendar, Clock, TrendingUp, GraduationCap, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Treinamento } from '@/hooks/useTreinamentos';
import { Employee } from '@/types';
import { CostCenterWithCount } from '@/hooks/useCostCenters';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeWithCostCenter {
  id: string;
  nome: string | null;
  codcentrodecustos: string | null;
}

interface TreinamentosReportsViewProps {
  treinamentos: Treinamento[];
  employees: Employee[];
  costCenters: CostCenterWithCount[];
}

export const TreinamentosReportsView = ({ 
  treinamentos, 
  employees, 
  costCenters 
}: TreinamentosReportsViewProps) => {
  const [periodFilter, setPeriodFilter] = useState<string>('6');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employeesWithCostCenter, setEmployeesWithCostCenter] = useState<EmployeeWithCostCenter[]>([]);

  // Fetch employees with cost center info
  useEffect(() => {
    const fetchEmployeesWithCostCenter = async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, nome, codcentrodecustos');
      if (data) {
        setEmployeesWithCostCenter(data);
      }
    };
    fetchEmployeesWithCostCenter();
  }, []);

  // Get employee cost center mapping
  const employeeCostCenterMap = useMemo(() => {
    const map = new Map<string, string>();
    employeesWithCostCenter.forEach(emp => {
      if (emp.codcentrodecustos) {
        map.set(emp.id, emp.codcentrodecustos);
      }
    });
    return map;
  }, [employeesWithCostCenter]);

  // Get cost center name mapping
  const costCenterNameMap = useMemo(() => {
    const map = new Map<string, string>();
    costCenters.forEach(cc => {
      map.set(cc.codcentrodecustos, cc.nomecentrodecustos);
    });
    return map;
  }, [costCenters]);

  // Filter trainings by period
  const filteredTreinamentos = useMemo(() => {
    const months = parseInt(periodFilter);
    const startDate = subMonths(new Date(), months);
    
    let filtered = treinamentos.filter(t => {
      const date = t.data_conclusao ? parseISO(t.data_conclusao) : parseISO(t.created_at);
      return date >= startDate;
    });

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(t => {
        if (!t.employee_id) return false;
        const empCostCenter = employeeCostCenterMap.get(t.employee_id);
        return empCostCenter === departmentFilter;
      });
    }

    return filtered;
  }, [treinamentos, periodFilter, departmentFilter, employeeCostCenterMap]);

  // Stats summary
  const stats = useMemo(() => {
    const total = filteredTreinamentos.length;
    const concluidos = filteredTreinamentos.filter(t => t.status === 'concluido').length;
    const totalHoras = filteredTreinamentos.reduce((acc, t) => acc + (t.carga_horaria || 0), 0);
    const uniqueEmployees = new Set(filteredTreinamentos.map(t => t.employee_id).filter(Boolean)).size;
    
    return { total, concluidos, totalHoras, uniqueEmployees };
  }, [filteredTreinamentos]);

  // Data by employee
  const dataByEmployee = useMemo(() => {
    const map = new Map<string, { name: string; count: number; hours: number }>();
    
    filteredTreinamentos.forEach(t => {
      if (t.employee_id) {
        const emp = employees.find(e => e.id === t.employee_id);
        const name = emp?.name || 'Desconhecido';
        const existing = map.get(t.employee_id) || { name, count: 0, hours: 0 };
        map.set(t.employee_id, {
          name,
          count: existing.count + 1,
          hours: existing.hours + (t.carga_horaria || 0),
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredTreinamentos, employees]);

  // Data by department
  const dataByDepartment = useMemo(() => {
    const map = new Map<string, { name: string; count: number; hours: number }>();
    
    filteredTreinamentos.forEach(t => {
      if (t.employee_id) {
        const costCenterCode = employeeCostCenterMap.get(t.employee_id);
        if (costCenterCode) {
          const name = costCenterNameMap.get(costCenterCode) || costCenterCode;
          const existing = map.get(costCenterCode) || { name, count: 0, hours: 0 };
          map.set(costCenterCode, {
            name,
            count: existing.count + 1,
            hours: existing.hours + (t.carga_horaria || 0),
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredTreinamentos, employeeCostCenterMap, costCenterNameMap]);

  // Data by month (timeline)
  const dataByMonth = useMemo(() => {
    const months = parseInt(periodFilter);
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const monthlyData = monthsInterval.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTrainings = filteredTreinamentos.filter(t => {
        const date = t.data_conclusao ? parseISO(t.data_conclusao) : parseISO(t.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      const concluidos = monthTrainings.filter(t => t.status === 'concluido').length;
      const emAndamento = monthTrainings.filter(t => t.status === 'em_andamento').length;
      
      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        concluidos,
        emAndamento,
        total: monthTrainings.length,
        horas: monthTrainings.reduce((acc, t) => acc + (t.carga_horaria || 0), 0),
      };
    });

    return monthlyData;
  }, [filteredTreinamentos, periodFilter]);

  // Status distribution
  const statusData = useMemo(() => {
    const concluidos = filteredTreinamentos.filter(t => t.status === 'concluido').length;
    const emAndamento = filteredTreinamentos.filter(t => t.status === 'em_andamento').length;
    const cancelados = filteredTreinamentos.filter(t => t.status === 'cancelado').length;

    return [
      { name: 'Concluídos', value: concluidos, color: 'hsl(var(--success))' },
      { name: 'Em Andamento', value: emAndamento, color: 'hsl(var(--info))' },
      { name: 'Cancelados', value: cancelados, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [filteredTreinamentos]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
                <SelectItem value="24">Últimos 2 anos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[220px] bg-background border-input">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {costCenters.map(cc => (
                  <SelectItem key={cc.id} value={cc.codcentrodecustos}>
                    {cc.nomecentrodecustos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Treinamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total > 0 ? Math.round((stats.concluidos / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <Users className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.uniqueEmployees}</p>
                <p className="text-sm text-muted-foreground">Colaboradores Treinados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalHoras}h</p>
                <p className="text-sm text-muted-foreground">Total de Horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Treinamentos por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataByMonth.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="concluidos"
                      name="Concluídos"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="emAndamento"
                      name="Em Andamento"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-72 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Employee */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top 10 Colaboradores por Treinamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataByEmployee.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dataByEmployee} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      width={100}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="count" name="Treinamentos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="hours" name="Horas" fill="hsl(var(--info))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Department */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Treinamentos por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataByDepartment.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dataByDepartment} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="count" name="Treinamentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hours" name="Horas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hours per Month */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horas de Treinamento por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataByMonth.some(d => d.horas > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" name="Horas" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

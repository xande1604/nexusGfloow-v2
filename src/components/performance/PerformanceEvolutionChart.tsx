import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, ChevronDown } from 'lucide-react';
import { PerformanceReview } from '@/hooks/usePerformanceReviews';
import { cn } from '@/lib/utils';

interface PerformanceEvolutionChartProps {
  reviews: PerformanceReview[];
}

export const PerformanceEvolutionChart = ({ reviews }: PerformanceEvolutionChartProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get unique employees from completed reviews
  const employees = useMemo(() => {
    const uniqueEmployees = new Map<string, string>();
    reviews
      .filter(r => r.status === 'Completed' && r.employeeId)
      .forEach(r => {
        if (r.employeeId && r.employeeName) {
          uniqueEmployees.set(r.employeeId, r.employeeName);
        }
      });
    return Array.from(uniqueEmployees, ([id, name]) => ({ id, name }));
  }, [reviews]);

  // Calculate average score for a review
  const calculateScore = (review: PerformanceReview) => {
    const ratings = review.responses.filter(r => r.rating).map(r => r.rating!);
    if (ratings.length === 0) return null;
    return Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const completedReviews = reviews
      .filter(r => r.status === 'Completed')
      .filter(r => selectedEmployee === 'all' || r.employeeId === selectedEmployee)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (selectedEmployee === 'all') {
      // Group by month and calculate average
      const monthlyData = new Map<string, { total: number; count: number }>();
      
      completedReviews.forEach(review => {
        const date = new Date(review.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const score = calculateScore(review);
        
        if (score !== null) {
          const existing = monthlyData.get(monthKey) || { total: 0, count: 0 };
          monthlyData.set(monthKey, {
            total: existing.total + score,
            count: existing.count + 1,
          });
        }
      });

      return Array.from(monthlyData, ([month, data]) => ({
        date: month,
        displayDate: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        score: Number((data.total / data.count).toFixed(1)),
        reviews: data.count,
      }));
    } else {
      // Individual employee data
      return completedReviews
        .map(review => {
          const score = calculateScore(review);
          if (score === null) return null;
          return {
            date: review.date,
            displayDate: new Date(review.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            score,
            reviews: 1,
          };
        })
        .filter(Boolean) as { date: string; displayDate: string; score: number; reviews: number }[];
    }
  }, [reviews, selectedEmployee]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    const change = ((last - first) / first) * 100;
    return {
      value: change.toFixed(1),
      isPositive: change >= 0,
    };
  }, [chartData]);

  const selectedEmployeeName = selectedEmployee === 'all' 
    ? 'Todos os Colaboradores' 
    : employees.find(e => e.id === selectedEmployee)?.name || 'Colaborador';

  if (reviews.filter(r => r.status === 'Completed').length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Evolução de Desempenho</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Nenhuma avaliação concluída para exibir
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-medium">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Evolução de Desempenho</h3>
            {trend && (
              <p className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% desde a primeira avaliação
              </p>
            )}
          </div>
        </div>

        {/* Employee selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 h-10 px-4 bg-secondary border border-border rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="max-w-[150px] truncate">{selectedEmployeeName}</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-lg shadow-lg z-10 py-1 max-h-64 overflow-auto">
              <button
                onClick={() => {
                  setSelectedEmployee('all');
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors",
                  selectedEmployee === 'all' && "bg-brand-50 text-brand-700"
                )}
              >
                Todos os Colaboradores
              </button>
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployee(emp.id);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors truncate",
                    selectedEmployee === emp.id && "bg-brand-50 text-brand-700"
                  )}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [`${value} / 5`, 'Nota']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="Nota Média"
                stroke="hsl(var(--brand-500))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--brand-500))', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: 'hsl(var(--brand-600))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Nenhum dado disponível para este colaborador
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.length > 0 ? chartData[chartData.length - 1].score : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Última Nota</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.length > 0 
                ? (chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length).toFixed(1) 
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Média Geral</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.reduce((acc, d) => acc + d.reviews, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Avaliações</p>
          </div>
        </div>
      )}
    </div>
  );
};

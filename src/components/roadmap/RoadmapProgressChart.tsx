import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { RoadmapProgress } from '@/types';
import { TrendingUp } from 'lucide-react';

interface RoadmapProgressChartProps {
  progress: RoadmapProgress;
}

export const RoadmapProgressChart = ({ progress }: RoadmapProgressChartProps) => {
  // Create chart data from progress history
  const chartData = progress.history?.map((entry, index) => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    progresso: entry.percentage,
    conquistas: entry.achievementsCount || 0,
  })) || [
    { date: 'Início', progresso: 0, conquistas: 0 },
    { date: 'Atual', progresso: progress.progressPercentage, conquistas: progress.achievements.length },
  ];

  // If no history, show at least initial and current state
  if (chartData.length < 2) {
    chartData.unshift({ date: 'Início', progresso: 0, conquistas: 0 });
    if (chartData.length < 2) {
      chartData.push({ 
        date: 'Atual', 
        progresso: progress.progressPercentage, 
        conquistas: progress.achievements.length 
      });
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
        <TrendingUp className="w-5 h-5 text-brand-600" />
        Evolução do Progresso
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--brand-500))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--brand-500))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              formatter={(value: number, name: string) => [
                name === 'progresso' ? `${value}%` : value,
                name === 'progresso' ? 'Progresso' : 'Conquistas'
              ]}
            />
            <Area
              type="monotone"
              dataKey="progresso"
              stroke="hsl(var(--brand-600))"
              strokeWidth={3}
              fill="url(#progressGradient)"
              dot={{ fill: 'hsl(var(--brand-600))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--brand-500))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-600" />
          <span className="text-muted-foreground">Progresso</span>
        </div>
      </div>
    </div>
  );
};

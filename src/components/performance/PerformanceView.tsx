import { useState } from 'react';
import { ClipboardCheck, Plus, Calendar, User, Star, ChevronRight, Search } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { cn } from '@/lib/utils';

interface PerformanceViewProps {
  employees: Employee[];
  roles: JobRole[];
}

// Demo data for reviews
const demoReviews = [
  { id: '1', employeeName: 'Maria Silva', role: 'Designer Sênior', date: '2024-01-15', status: 'Completed', score: 4.5 },
  { id: '2', employeeName: 'João Santos', role: 'Desenvolvedor Pleno', date: '2024-01-10', status: 'PendingManager', score: null },
  { id: '3', employeeName: 'Ana Costa', role: 'Product Manager', date: '2024-01-08', status: 'PendingSelf', score: null },
];

export const PerformanceView = ({ employees, roles }: PerformanceViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return { label: 'Concluído', className: 'bg-emerald-100 text-emerald-700' };
      case 'PendingManager':
        return { label: 'Aguardando Gestor', className: 'bg-amber-100 text-amber-700' };
      case 'PendingSelf':
        return { label: 'Aguardando Auto-avaliação', className: 'bg-brand-100 text-brand-700' };
      default:
        return { label: status, className: 'bg-secondary text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Todos status</option>
            <option value="Completed">Concluídos</option>
            <option value="PendingManager">Aguardando Gestor</option>
            <option value="PendingSelf">Aguardando Auto-avaliação</option>
          </select>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-primary-foreground rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-soft">
          <Plus className="w-4 h-4" />
          Nova Avaliação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Total de Avaliações</p>
          <p className="text-2xl font-bold text-foreground">{demoReviews.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Concluídas</p>
          <p className="text-2xl font-bold text-emerald-600">
            {demoReviews.filter(r => r.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600">
            {demoReviews.filter(r => r.status !== 'Completed').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Média Geral</p>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <p className="text-2xl font-bold text-foreground">4.5</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-card rounded-xl shadow-medium overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Avaliações Recentes</h3>
        </div>

        <div className="divide-y divide-border">
          {demoReviews.map((review, index) => {
            const statusBadge = getStatusBadge(review.status);
            return (
              <div
                key={review.id}
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{review.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  {review.score && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-foreground">{review.score}</span>
                    </div>
                  )}
                  
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    statusBadge.className
                  )}>
                    {statusBadge.label}
                  </span>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>

        {demoReviews.length === 0 && (
          <div className="text-center py-16">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

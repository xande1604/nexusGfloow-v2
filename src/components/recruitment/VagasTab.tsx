import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Briefcase, MapPin, Clock, Users, 
  MoreVertical, Edit, Trash2, Eye, Calendar, Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VagaFormModal } from './VagaFormModal';
import type { Vaga, Candidatura, VagaSkill } from '@/types/recruitment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VagasTabProps {
  vagas: Vaga[];
  candidaturas: Candidatura[];
  onSaveVaga: (vaga: Partial<Vaga>, skills?: Partial<VagaSkill>[]) => Promise<any>;
  onDeleteVaga: (id: string) => Promise<void>;
  isDemoMode?: boolean;
}

export const VagasTab = ({
  vagas,
  candidaturas,
  onSaveVaga,
  onDeleteVaga,
  isDemoMode,
}: VagasTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

  const filteredVagas = vagas.filter(v => {
    const matchesSearch = v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.local?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedVaga(null);
    setIsFormOpen(true);
  };

  const getCandidaturasCount = (vagaId: string) => {
    return candidaturas.filter(c => c.vaga_id === vagaId).length;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aberta': return { label: 'Aberta', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
      case 'em_analise': return { label: 'Em Análise', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      case 'fechada': return { label: 'Fechada', class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' };
      case 'cancelada': return { label: 'Cancelada', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
      case 'pausada': return { label: 'Pausada', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
      default: return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  const getPrioridadeConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return { label: 'Urgente', class: 'bg-red-500 text-white' };
      case 'alta': return { label: 'Alta', class: 'bg-orange-500 text-white' };
      case 'normal': return { label: 'Normal', class: 'bg-blue-500 text-white' };
      case 'baixa': return { label: 'Baixa', class: 'bg-gray-500 text-white' };
      default: return { label: prioridade, class: 'bg-gray-500 text-white' };
    }
  };

  const getModalidadeLabel = (modalidade?: string) => {
    switch (modalidade) {
      case 'presencial': return 'Presencial';
      case 'hibrido': return 'Híbrido';
      case 'remoto': return 'Remoto';
      default: return modalidade || 'Não definido';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberta">Abertas</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="pausada">Pausadas</SelectItem>
              <SelectItem value="fechada">Fechadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate} disabled={isDemoMode}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVagas.map((vaga) => {
          const statusConfig = getStatusConfig(vaga.status);
          const prioridadeConfig = getPrioridadeConfig(vaga.prioridade);
          
          return (
            <Card key={vaga.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={prioridadeConfig.class} variant="secondary">
                        {prioridadeConfig.label}
                      </Badge>
                      <Badge className={statusConfig.class}>
                        {statusConfig.label}
                      </Badge>
                      {vaga.publicado && (
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">
                          <Globe className="w-3 h-3" />
                          Portal
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{vaga.titulo}</h3>
                    {vaga.cargo_titulo && (
                      <p className="text-sm text-muted-foreground">{vaga.cargo_titulo}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(vaga)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteVaga(vaga.id)}
                        className="text-destructive"
                        disabled={isDemoMode}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {vaga.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{vaga.local}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{getModalidadeLabel(vaga.modalidade)}</span>
                  </div>
                  {vaga.data_limite && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Até {format(new Date(vaga.data_limite), "dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                  )}
                </div>

                {/* Salary */}
                {(vaga.salario_min || vaga.salario_max) && (
                  <div className="mt-3 p-2 bg-secondary rounded-lg text-sm">
                    <span className="font-medium">
                      {vaga.salario_min && vaga.salario_max
                        ? `R$ ${vaga.salario_min.toLocaleString()} - R$ ${vaga.salario_max.toLocaleString()}`
                        : vaga.salario_min
                        ? `A partir de R$ ${vaga.salario_min.toLocaleString()}`
                        : `Até R$ ${vaga.salario_max?.toLocaleString()}`
                      }
                    </span>
                  </div>
                )}

                {/* Skills */}
                {vaga.skills && vaga.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {vaga.skills.slice(0, 3).map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant={skill.obrigatoria ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {skill.skill_name}
                      </Badge>
                    ))}
                    {vaga.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{vaga.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{getCandidaturasCount(vaga.id)} candidatos</span>
                  </div>
                  <span className="text-muted-foreground">
                    {vaga.quantidade_vagas} {vaga.quantidade_vagas === 1 ? 'vaga' : 'vagas'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVagas.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma vaga encontrada</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || statusFilter !== 'all' ? 'Tente ajustar seus filtros' : 'Comece criando uma nova vaga'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={handleCreate} className="mt-4" disabled={isDemoMode}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Vaga
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      <VagaFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vaga={selectedVaga}
        onSave={onSaveVaga}
      />
    </div>
  );
};

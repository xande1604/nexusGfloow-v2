import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, User, Mail, Phone, MapPin, Briefcase, 
  MoreVertical, Edit, Trash2, FileText, ExternalLink 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getStorageBlobUrl } from '@/lib/storageUrls';
import { CandidatoFormModal } from './CandidatoFormModal';
import { CandidatoDetailsModal } from './CandidatoDetailsModal';
import type { Candidato, Vaga, Candidatura, CandidatoSkill } from '@/types/recruitment';

interface CandidatosTabProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  candidaturas: Candidatura[];
  onSaveCandidato: (candidato: Partial<Candidato>, skills?: Partial<CandidatoSkill>[]) => Promise<any>;
  onDeleteCandidato: (id: string) => Promise<void>;
  onCreateCandidatura: (candidatoId: string, vagaId: string) => Promise<any>;
  isDemoMode?: boolean;
}

export const CandidatosTab = ({
  candidatos,
  vagas,
  candidaturas,
  onSaveCandidato,
  onDeleteCandidato,
  onCreateCandidatura,
  isDemoMode,
}: CandidatosTabProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);

  const handleOpenCurriculo = async (curriculoUrl: string) => {
    try {
      const blobUrl = await getStorageBlobUrl(curriculoUrl);
      const w = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (!w) throw new Error('Pop-up bloqueado');
      // mantém a URL viva por um tempo para o PDF carregar
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000 * 60 * 10);
    } catch (err: any) {
      console.error('Erro ao abrir currículo:', err);
      toast({
        title: 'Não foi possível abrir o currículo',
        description: 'Tente novamente. Se persistir, verifique bloqueadores/extensões do navegador.',
        variant: 'destructive',
      });
    }
  };

  const filteredCandidatos = candidatos.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsFormOpen(true);
  };

  const handleView = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedCandidato(null);
    setIsFormOpen(true);
  };

  const getCandidaturasCount = (candidatoId: string) => {
    return candidaturas.filter(c => c.candidato_id === candidatoId).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'inativo': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'contratado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'arquivado': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar candidatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreate} disabled={isDemoMode}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Candidato
        </Button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidatos.map((candidato) => (
          <Card key={candidato.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleView(candidato)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    {candidato.foto_url ? (
                      <img src={candidato.foto_url} alt={candidato.nome} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{candidato.nome}</h3>
                    <Badge className={getStatusColor(candidato.status)}>
                      {candidato.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(candidato); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {candidato.curriculo_url && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleOpenCurriculo(candidato.curriculo_url!);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Currículo
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDeleteCandidato(candidato.id); }}
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
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{candidato.email}</span>
                </div>
                {candidato.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{candidato.telefone}</span>
                  </div>
                )}
                {candidato.cidade && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{candidato.cidade}{candidato.estado ? `, ${candidato.estado}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {candidato.skills && candidato.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {candidato.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.skill_name}
                    </Badge>
                  ))}
                  {candidato.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidato.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>{getCandidaturasCount(candidato.id)} candidaturas</span>
                </div>
                {candidato.linkedin_url && (
                  <a 
                    href={candidato.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidatos.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum candidato encontrado</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando um novo candidato'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate} className="mt-4" disabled={isDemoMode}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Candidato
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <CandidatoFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        candidato={selectedCandidato}
        onSave={onSaveCandidato}
      />

      <CandidatoDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        candidato={selectedCandidato}
        vagas={vagas}
        candidaturas={candidaturas}
        onCreateCandidatura={onCreateCandidatura}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};

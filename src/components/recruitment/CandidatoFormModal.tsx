import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { Candidato, CandidatoSkill } from '@/types/recruitment';

interface CandidatoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidato?: Candidato | null;
  onSave: (candidato: Partial<Candidato>, skills?: Partial<CandidatoSkill>[]) => Promise<any>;
}

export const CandidatoFormModal = ({
  open,
  onOpenChange,
  candidato,
  onSave,
}: CandidatoFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Candidato>>({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    linkedin_url: '',
    resumo_profissional: '',
    pretensao_salarial: undefined,
    disponibilidade: '',
    fonte: '',
    status: 'ativo',
  });

  const [skills, setSkills] = useState<Partial<CandidatoSkill>[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', nivel: 'intermediario' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (candidato) {
      setFormData({
        id: candidato.id,
        nome: candidato.nome,
        email: candidato.email,
        telefone: candidato.telefone || '',
        cidade: candidato.cidade || '',
        estado: candidato.estado || '',
        linkedin_url: candidato.linkedin_url || '',
        resumo_profissional: candidato.resumo_profissional || '',
        pretensao_salarial: candidato.pretensao_salarial,
        disponibilidade: candidato.disponibilidade || '',
        fonte: candidato.fonte || '',
        status: candidato.status,
      });
      setSkills(candidato.skills || []);
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        estado: '',
        linkedin_url: '',
        resumo_profissional: '',
        pretensao_salarial: undefined,
        disponibilidade: '',
        fonte: '',
        status: 'ativo',
      });
      setSkills([]);
    }
  }, [candidato, open]);

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, { skill_name: newSkill.name, nivel: newSkill.nivel as any }]);
      setNewSkill({ name: '', nivel: 'intermediario' });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData, skills);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {candidato ? 'Editar Candidato' : 'Novo Candidato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="pretensao">Pretensão Salarial (R$)</Label>
              <Input
                id="pretensao"
                type="number"
                value={formData.pretensao_salarial || ''}
                onChange={(e) => setFormData({ ...formData, pretensao_salarial: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="disponibilidade">Disponibilidade</Label>
              <Select
                value={formData.disponibilidade}
                onValueChange={(v) => setFormData({ ...formData, disponibilidade: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imediata">Imediata</SelectItem>
                  <SelectItem value="15_dias">15 dias</SelectItem>
                  <SelectItem value="30_dias">30 dias</SelectItem>
                  <SelectItem value="60_dias">60 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="resumo">Resumo Profissional</Label>
              <Textarea
                id="resumo"
                value={formData.resumo_profissional}
                onChange={(e) => setFormData({ ...formData, resumo_profissional: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fonte">Fonte</Label>
              <Select
                value={formData.fonte}
                onValueChange={(v) => setFormData({ ...formData, fonte: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Como conheceu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="site">Site da empresa</SelectItem>
                  <SelectItem value="indeed">Indeed</SelectItem>
                  <SelectItem value="gupy">Gupy</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="contratado">Contratado</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Competências</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="Nome da competência"
                className="flex-1"
              />
              <Select
                value={newSkill.nivel}
                onValueChange={(v) => setNewSkill({ ...newSkill, nivel: v })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="py-1 px-2">
                    {skill.skill_name} ({skill.nivel})
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import type { Vaga, VagaSkill } from '@/types/recruitment';

interface VagaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaga?: Vaga | null;
  onSave: (vaga: Partial<Vaga>, skills?: Partial<VagaSkill>[]) => Promise<any>;
}

export const VagaFormModal = ({
  open,
  onOpenChange,
  vaga,
  onSave,
}: VagaFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Vaga>>({
    titulo: '',
    descricao: '',
    requisitos: '',
    beneficios: '',
    tipo_contrato: 'clt',
    modalidade: 'presencial',
    local: '',
    salario_min: undefined,
    salario_max: undefined,
    quantidade_vagas: 1,
    data_limite: '',
    status: 'aberta',
    prioridade: 'normal',
  });

  const [skills, setSkills] = useState<Partial<VagaSkill>[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', nivel: 'intermediario', obrigatoria: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vaga) {
      setFormData({
        id: vaga.id,
        titulo: vaga.titulo,
        descricao: vaga.descricao || '',
        requisitos: vaga.requisitos || '',
        beneficios: vaga.beneficios || '',
        tipo_contrato: vaga.tipo_contrato || 'clt',
        modalidade: vaga.modalidade || 'presencial',
        local: vaga.local || '',
        salario_min: vaga.salario_min,
        salario_max: vaga.salario_max,
        quantidade_vagas: vaga.quantidade_vagas,
        data_limite: vaga.data_limite || '',
        status: vaga.status,
        prioridade: vaga.prioridade,
      });
      setSkills(vaga.skills || []);
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        requisitos: '',
        beneficios: '',
        tipo_contrato: 'clt',
        modalidade: 'presencial',
        local: '',
        salario_min: undefined,
        salario_max: undefined,
        quantidade_vagas: 1,
        data_limite: '',
        status: 'aberta',
        prioridade: 'normal',
      });
      setSkills([]);
    }
  }, [vaga, open]);

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, { 
        skill_name: newSkill.name, 
        nivel_minimo: newSkill.nivel as any,
        obrigatoria: newSkill.obrigatoria
      }]);
      setNewSkill({ name: '', nivel: 'intermediario', obrigatoria: true });
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
            {vaga ? 'Editar Vaga' : 'Nova Vaga'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="titulo">Título da Vaga *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
              <Select
                value={formData.tipo_contrato}
                onValueChange={(v) => setFormData({ ...formData, tipo_contrato: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="pj">PJ</SelectItem>
                  <SelectItem value="estagio">Estágio</SelectItem>
                  <SelectItem value="temporario">Temporário</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(v) => setFormData({ ...formData, modalidade: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <Label htmlFor="quantidade">Quantidade de Vagas</Label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                value={formData.quantidade_vagas}
                onChange={(e) => setFormData({ ...formData, quantidade_vagas: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="salario_min">Salário Mínimo (R$)</Label>
              <Input
                id="salario_min"
                type="number"
                value={formData.salario_min || ''}
                onChange={(e) => setFormData({ ...formData, salario_min: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="salario_max">Salário Máximo (R$)</Label>
              <Input
                id="salario_max"
                type="number"
                value={formData.salario_max || ''}
                onChange={(e) => setFormData({ ...formData, salario_max: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(v) => setFormData({ ...formData, prioridade: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_limite">Data Limite</Label>
              <Input
                id="data_limite"
                type="date"
                value={formData.data_limite}
                onChange={(e) => setFormData({ ...formData, data_limite: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="requisitos">Requisitos</Label>
              <Textarea
                id="requisitos"
                value={formData.requisitos}
                onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="beneficios">Benefícios</Label>
              <Textarea
                id="beneficios"
                value={formData.beneficios}
                onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                rows={2}
              />
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
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="fechada">Fechada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Competências Requeridas</Label>
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
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Switch
                  checked={newSkill.obrigatoria}
                  onCheckedChange={(c) => setNewSkill({ ...newSkill, obrigatoria: c })}
                />
                <span className="text-xs">Obrig.</span>
              </div>
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant={skill.obrigatoria ? 'default' : 'outline'} 
                    className="py-1 px-2"
                  >
                    {skill.skill_name} ({skill.nivel_minimo})
                    {skill.obrigatoria && <span className="ml-1 text-xs">*</span>}
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

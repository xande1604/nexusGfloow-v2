import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Upload, CheckCircle2 } from 'lucide-react';

interface VagaSimples {
  id: string;
  titulo: string;
}

interface CandidaturaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaga: VagaSimples | null;
  onSuccess: () => void;
}

export const CandidaturaFormModal = ({
  open,
  onOpenChange,
  vaga,
  onSuccess,
}: CandidaturaFormModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    endereco: '',
    linkedin_url: '',
    portfolio_url: '',
    resumo_profissional: '',
    pretensao_salarial: '',
    disponibilidade: '',
    curriculo_url: '',
  });

  const [skills, setSkills] = useState<{ skill_name: string; nivel: string }[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', nivel: 'intermediario' });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cidade: '',
      estado: '',
      endereco: '',
      linkedin_url: '',
      portfolio_url: '',
      resumo_profissional: '',
      pretensao_salarial: '',
      disponibilidade: '',
      curriculo_url: '',
    });
    setSkills([]);
    setIsSuccess(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, envie um arquivo PDF.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingFile(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage
        .from('curriculos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('curriculos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, curriculo_url: urlData.publicUrl }));
      toast({
        title: 'Currículo enviado',
        description: 'Seu currículo foi enviado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o currículo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, { skill_name: newSkill.name, nivel: newSkill.nivel }]);
      setNewSkill({ name: '', nivel: 'intermediario' });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaga) return;

    setIsSubmitting(true);
    try {
      // 1. Create candidato
      const { data: candidato, error: candidatoError } = await supabase
        .from('candidatos')
        .insert({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          cidade: formData.cidade || null,
          estado: formData.estado || null,
          endereco: formData.endereco || null,
          linkedin_url: formData.linkedin_url || null,
          portfolio_url: formData.portfolio_url || null,
          resumo_profissional: formData.resumo_profissional || null,
          pretensao_salarial: formData.pretensao_salarial ? Number(formData.pretensao_salarial) : null,
          disponibilidade: formData.disponibilidade || null,
          curriculo_url: formData.curriculo_url || null,
          status: 'ativo',
          fonte: 'portal_vagas',
        })
        .select('id')
        .single();

      if (candidatoError) throw candidatoError;

      // 2. Insert skills
      if (skills.length > 0 && candidato) {
        const skillsToInsert = skills.map(s => ({
          candidato_id: candidato.id,
          skill_name: s.skill_name,
          nivel: s.nivel,
        }));

        const { error: skillsError } = await supabase
          .from('candidato_skills')
          .insert(skillsToInsert);

        if (skillsError) console.error('Erro ao inserir skills:', skillsError);
      }

      // 3. Create candidatura
      const { error: candidaturaError } = await supabase
        .from('candidaturas')
        .insert({
          candidato_id: candidato.id,
          vaga_id: vaga.id,
          etapa: 'triagem',
          status: 'em_analise',
          data_candidatura: new Date().toISOString(),
        });

      if (candidaturaError) throw candidaturaError;

      setIsSuccess(true);
      toast({
        title: 'Candidatura enviada!',
        description: 'Sua candidatura foi recebida com sucesso. Entraremos em contato em breve.',
      });
    } catch (error: any) {
      console.error('Erro ao enviar candidatura:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Ocorreu um erro ao enviar sua candidatura. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
    if (isSuccess) onSuccess();
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md text-center">
          <div className="py-8">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Candidatura Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Obrigado por se candidatar à vaga de <strong>{vaga?.titulo}</strong>. 
              Analisaremos seu perfil e entraremos em contato em breve.
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidatar-se para {vaga?.titulo}</DialogTitle>
          <DialogDescription>
            Preencha seus dados para se candidatar a esta vaga.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
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
                  placeholder="(00) 00000-0000"
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
                <Select
                  value={formData.estado}
                  onValueChange={(v) => setFormData({ ...formData, estado: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Links Profissionais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Links Profissionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/seu-perfil"
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfólio / GitHub</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Resumo e Expectativas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Sobre Você
            </h3>
            
            <div>
              <Label htmlFor="resumo">Resumo Profissional</Label>
              <Textarea
                id="resumo"
                value={formData.resumo_profissional}
                onChange={(e) => setFormData({ ...formData, resumo_profissional: e.target.value })}
                rows={3}
                placeholder="Conte um pouco sobre sua experiência e objetivos profissionais..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pretensao">Pretensão Salarial (R$)</Label>
                <Input
                  id="pretensao"
                  type="number"
                  value={formData.pretensao_salarial}
                  onChange={(e) => setFormData({ ...formData, pretensao_salarial: e.target.value })}
                  placeholder="5000"
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
                    <SelectItem value="45_dias">45 dias</SelectItem>
                    <SelectItem value="60_dias">60 dias ou mais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Suas Competências
            </h3>
            <div className="flex gap-2">
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="Ex: JavaScript, Gestão de Projetos..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Select
                value={newSkill.nivel}
                onValueChange={(v) => setNewSkill({ ...newSkill, nivel: v })}
              >
                <SelectTrigger className="w-[130px]">
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
              <div className="flex flex-wrap gap-2">
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

          {/* Currículo */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Currículo
            </h3>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {formData.curriculo_url ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Currículo enviado!</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, curriculo_url: '' })}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingFile}
                  />
                  {isUploadingFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="w-8 h-8" />
                      <span>Clique para enviar seu currículo (PDF, máx. 5MB)</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Candidatura'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

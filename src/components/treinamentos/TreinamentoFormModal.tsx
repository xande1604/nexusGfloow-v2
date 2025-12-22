import { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Building2, Calendar, Clock, FileText, User, Upload, File, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Treinamento, TreinamentoInput } from '@/hooks/useTreinamentos';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
}

interface TreinamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TreinamentoInput) => Promise<{ success: boolean }>;
  onUpdate: (id: string, data: Partial<TreinamentoInput>) => Promise<{ success: boolean }>;
  editingTreinamento: Treinamento | null;
  employees: Employee[];
}

export const TreinamentoFormModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingTreinamento,
  employees,
}: TreinamentoFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [existingCertificateUrl, setExistingCertificateUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<TreinamentoInput>({
    employee_id: null,
    nome_treinamento: '',
    instituicao: '',
    data_inicio: '',
    data_conclusao: '',
    carga_horaria: null,
    status: 'concluido',
    observacoes: '',
    certificado_url: null,
  });

  useEffect(() => {
    if (editingTreinamento) {
      setFormData({
        employee_id: editingTreinamento.employee_id,
        nome_treinamento: editingTreinamento.nome_treinamento,
        instituicao: editingTreinamento.instituicao || '',
        data_inicio: editingTreinamento.data_inicio || '',
        data_conclusao: editingTreinamento.data_conclusao || '',
        carga_horaria: editingTreinamento.carga_horaria,
        status: editingTreinamento.status,
        observacoes: editingTreinamento.observacoes || '',
        certificado_url: editingTreinamento.certificado_url,
      });
      setExistingCertificateUrl(editingTreinamento.certificado_url);
      setCertificateFile(null);
    } else {
      setFormData({
        employee_id: null,
        nome_treinamento: '',
        instituicao: '',
        data_inicio: '',
        data_conclusao: '',
        carga_horaria: null,
        status: 'concluido',
        observacoes: '',
        certificado_url: null,
      });
      setExistingCertificateUrl(null);
      setCertificateFile(null);
    }
  }, [editingTreinamento, isOpen]);

  const uploadCertificate = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('certificados')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione um PDF ou imagem (JPG, PNG, WebP)',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB',
          variant: 'destructive',
        });
        return;
      }
      setCertificateFile(file);
      setExistingCertificateUrl(null);
    }
  };

  const handleRemoveCertificate = () => {
    setCertificateFile(null);
    setExistingCertificateUrl(null);
    setFormData(prev => ({ ...prev, certificado_url: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_treinamento.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let certificateUrl = existingCertificateUrl;

      // Upload new certificate if selected
      if (certificateFile) {
        setIsUploading(true);
        certificateUrl = await uploadCertificate(certificateFile);
        setIsUploading(false);
      }

      const dataToSave: TreinamentoInput = {
        ...formData,
        carga_horaria: formData.carga_horaria ? Number(formData.carga_horaria) : null,
        data_inicio: formData.data_inicio || null,
        data_conclusao: formData.data_conclusao || null,
        certificado_url: certificateUrl,
      };

      let result;
      if (editingTreinamento) {
        result = await onUpdate(editingTreinamento.id, dataToSave);
      } else {
        result = await onSave(dataToSave);
      }

      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            {editingTreinamento ? 'Editar Treinamento' : 'Registrar Treinamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Nome do Treinamento */}
          <div className="space-y-2">
            <Label htmlFor="nome_treinamento" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Nome do Treinamento *
            </Label>
            <Input
              id="nome_treinamento"
              value={formData.nome_treinamento}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_treinamento: e.target.value }))}
              placeholder="Ex: Gestão de Projetos com Scrum"
              required
              className="bg-background border-input"
            />
          </div>

          {/* Colaborador */}
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Colaborador
            </Label>
            <Select 
              value={formData.employee_id || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value === 'none' ? null : value }))}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não vincular a colaborador</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name || 'Sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instituição */}
          <div className="space-y-2">
            <Label htmlFor="instituicao" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Instituição
            </Label>
            <Input
              id="instituicao"
              value={formData.instituicao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instituicao: e.target.value }))}
              placeholder="Ex: Udemy, Coursera, SENAC..."
              className="bg-background border-input"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data de Início
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_conclusao" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data de Conclusão
              </Label>
              <Input
                id="data_conclusao"
                type="date"
                value={formData.data_conclusao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_conclusao: e.target.value }))}
                className="bg-background border-input"
              />
            </div>
          </div>

          {/* Carga Horária e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carga_horaria" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Carga Horária (horas)
              </Label>
              <Input
                id="carga_horaria"
                type="number"
                min="0"
                value={formData.carga_horaria || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Ex: 40"
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'em_andamento' | 'concluido' | 'cancelado') => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o treinamento..."
              rows={3}
              className="bg-background border-input resize-none"
            />
          </div>

          {/* Certificado Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-muted-foreground" />
              Certificado
            </Label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />

            {!certificateFile && !existingCertificateUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para anexar um certificado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG ou WebP (máx. 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <File className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {certificateFile ? certificateFile.name : 'Certificado anexado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {certificateFile 
                      ? `${(certificateFile.size / 1024).toFixed(1)} KB` 
                      : 'Arquivo existente'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCertificate}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading || !formData.nome_treinamento.trim()}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : isSubmitting ? (
                'Salvando...'
              ) : (
                editingTreinamento ? 'Salvar Alterações' : 'Registrar Treinamento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

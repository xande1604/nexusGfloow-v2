import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { demoKnowledgeBase } from '@/components/demo/demoData';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useCostCenters } from '@/hooks/useCostCenters';
import { Plus, Upload, FileText, Trash2, Search, Edit, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeBaseTabProps {
  isDemoMode?: boolean;
}

export const KnowledgeBaseTab = ({ isDemoMode = false }: KnowledgeBaseTabProps) => {
  const { items: realItems, loading, saveItem, deleteItem, uploadFile } = useKnowledgeBase();
  const items = isDemoMode ? demoKnowledgeBase : realItems;
  const { roles } = useJobRoles();
  const { costCenters } = useCostCenters();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    cargoId: '',
    costCenterId: '',
    tags: '',
    fileUrl: '',
    fileType: '',
  });

  const handleSubmit = async () => {
    if (isDemoMode) {
      toast({ title: 'Modo demonstração', description: 'Edição não disponível.', variant: 'destructive' });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'O título é obrigatório.', variant: 'destructive' });
      return;
    }

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    await saveItem({
      title: formData.title,
      description: formData.description || undefined,
      content: formData.content || undefined,
      cargoId: formData.cargoId || undefined,
      costCenterId: formData.costCenterId || undefined,
      tags,
      fileUrl: formData.fileUrl || undefined,
      fileType: formData.fileType || undefined,
    });

    setFormData({
      title: '',
      description: '',
      content: '',
      cargoId: '',
      costCenterId: '',
      tags: '',
      fileUrl: '',
      fileType: '',
    });
    setIsOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        fileUrl: url,
        fileType: file.type,
      }));
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemoMode) {
      toast({ title: 'Modo demonstração', description: 'Exclusão não disponível.', variant: 'destructive' });
      return;
    }
    await deleteItem(id);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isDemoMode && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar na base de conhecimento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Conteúdo na Base de Conhecimento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Manual de Procedimentos"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição do conteúdo"
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Insira o texto ou conteúdo aqui..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="file">Arquivo (PDF, Word, etc.)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="flex-1"
                  />
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {formData.fileUrl && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <FileText className="w-4 h-4" />
                    <span>Arquivo carregado</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, fileUrl: '', fileType: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo Relacionado</Label>
                  <Select
                    value={formData.cargoId || "none"}
                    onValueChange={value => setFormData(prev => ({ ...prev, cargoId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="costCenter">Centro de Custo</Label>
                  <Select
                    value={formData.costCenterId || "none"}
                    onValueChange={value => setFormData(prev => ({ ...prev, costCenterId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um centro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {costCenters.map(cc => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.nomecentrodecustos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: procedimentos, segurança, qualidade"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchTerm ? 'Tente buscar por outros termos.' : 'Adicione conteúdos à base de conhecimento para criar testes.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.fileUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Ver arquivo
                      </a>
                    </div>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Adicionado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

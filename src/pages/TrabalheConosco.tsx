import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Briefcase, Clock, Search, Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CandidaturaFormModal } from '@/components/recruitment/CandidaturaFormModal';

interface VagaPublica {
  id: string;
  titulo: string;
  descricao: string | null;
  requisitos: string | null;
  beneficios: string | null;
  tipo_contrato: string | null;
  modalidade: string | null;
  local: string | null;
  salario_min: number | null;
  salario_max: number | null;
  data_limite: string | null;
  created_at: string;
}

const TrabalheConosco = () => {
  const [vagas, setVagas] = useState<VagaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaga, setSelectedVaga] = useState<VagaPublica | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  useEffect(() => {
    fetchVagas();
  }, []);

  const fetchVagas = async () => {
    try {
      const { data, error } = await supabase
        .from('vagas')
        .select('id, titulo, descricao, requisitos, beneficios, tipo_contrato, modalidade, local, salario_min, salario_max, data_limite, created_at')
        .eq('publicado', true)
        .eq('status', 'aberta')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVagas(data || []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVagas = vagas.filter(vaga =>
    vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaga.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaga.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModalidadeLabel = (modalidade: string | null) => {
    switch (modalidade) {
      case 'presencial': return 'Presencial';
      case 'hibrido': return 'Híbrido';
      case 'remoto': return 'Remoto';
      default: return modalidade;
    }
  };

  const getContratoLabel = (tipo: string | null) => {
    switch (tipo) {
      case 'clt': return 'CLT';
      case 'pj': return 'PJ';
      case 'estagio': return 'Estágio';
      case 'temporario': return 'Temporário';
      case 'freelancer': return 'Freelancer';
      default: return tipo;
    }
  };

  const handleApply = (vaga: VagaPublica) => {
    setSelectedVaga(vaga);
    setFormModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Trabalhe Conosco | Oportunidades de Carreira</title>
        <meta name="description" content="Confira nossas vagas abertas e faça parte da nossa equipe. Encontre a oportunidade perfeita para sua carreira." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Trabalhe Conosco</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              Encontre a oportunidade perfeita para sua carreira. Estamos sempre em busca de talentos para fazer parte da nossa equipe.
            </p>
          </div>
        </header>

        {/* Search Section */}
        <div className="container mx-auto px-4 -mt-8">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar vagas por título, local ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vagas List */}
        <main className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVagas.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma vaga encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente buscar com outros termos.' 
                    : 'No momento não temos vagas abertas. Volte em breve!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                {filteredVagas.length} {filteredVagas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
              </p>
              
              {filteredVagas.map((vaga) => (
                <Card key={vaga.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">{vaga.titulo}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-3 mt-2">
                          {vaga.local && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {vaga.local}
                            </span>
                          )}
                          {vaga.modalidade && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {getModalidadeLabel(vaga.modalidade)}
                            </span>
                          )}
                          {vaga.tipo_contrato && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {getContratoLabel(vaga.tipo_contrato)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Button size="lg" onClick={() => handleApply(vaga)}>
                        Candidatar-se
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(vaga.salario_min || vaga.salario_max) && (
                      <div>
                        <Badge variant="secondary" className="text-sm">
                          {vaga.salario_min && vaga.salario_max
                            ? `R$ ${vaga.salario_min.toLocaleString()} - R$ ${vaga.salario_max.toLocaleString()}`
                            : vaga.salario_min
                              ? `A partir de R$ ${vaga.salario_min.toLocaleString()}`
                              : `Até R$ ${vaga.salario_max?.toLocaleString()}`}
                        </Badge>
                      </div>
                    )}

                    {vaga.descricao && (
                      <div>
                        <h4 className="font-semibold mb-1">Descrição</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{vaga.descricao}</p>
                      </div>
                    )}

                    {vaga.requisitos && (
                      <div>
                        <h4 className="font-semibold mb-1">Requisitos</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{vaga.requisitos}</p>
                      </div>
                    )}

                    {vaga.beneficios && (
                      <div>
                        <h4 className="font-semibold mb-1">Benefícios</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{vaga.beneficios}</p>
                      </div>
                    )}

                    {vaga.data_limite && (
                      <p className="text-sm text-muted-foreground">
                        Inscrições até {new Date(vaga.data_limite).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-muted py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>

      <CandidaturaFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        vaga={selectedVaga}
        onSuccess={() => {
          setFormModalOpen(false);
          setSelectedVaga(null);
        }}
      />
    </>
  );
};

export default TrabalheConosco;

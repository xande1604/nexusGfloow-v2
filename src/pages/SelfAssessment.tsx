import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, User, LogOut, ClipboardCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Employee {
  id: string;
  name: string;
  email: string;
  roleCode: string;
}

interface PendingEvaluation {
  id: string;
  cycle_id: string;
  questions: Array<{ id: string; question: string; category: string; type: string }>;
  status: string;
  evaluation_cycles: {
    title: string;
    description: string;
    status: string;
  };
}

export default function SelfAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null);
  const [responses, setResponses] = useState<Record<string, { rating?: number; response?: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee_session');
    if (storedEmployee) {
      const data = JSON.parse(storedEmployee);
      setEmployee(data.employee);
      setPendingEvaluations(data.pendingEvaluations || []);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('employee-auth', {
        body: { action: authMode, email, password }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(authMode === 'login' ? 'Login realizado!' : 'Cadastro realizado!');
      setEmployee(data.employee);
      setPendingEvaluations(data.pendingEvaluations || []);
      localStorage.setItem('employee_session', JSON.stringify(data));
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_session');
    setEmployee(null);
    setPendingEvaluations([]);
    setSelectedEvaluation(null);
    setResponses({});
  };

  const handleResponseChange = (questionId: string, field: 'rating' | 'response', value: number | string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedEvaluation || !employee) return;

    const unansweredQuestions = selectedEvaluation.questions.filter(q => {
      const response = responses[q.id];
      return !response || (!response.rating && !response.response);
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Por favor, responda todas as ${unansweredQuestions.length} perguntas restantes`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedResponses = selectedEvaluation.questions.map(q => ({
        questionId: q.id,
        ...responses[q.id]
      }));

      const { data, error } = await supabase.functions.invoke('submit-self-assessment', {
        body: {
          evaluationId: selectedEvaluation.id,
          employeeId: employee.id,
          responses: formattedResponses
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Autoavaliação enviada com sucesso!');
      setPendingEvaluations(prev => prev.filter(e => e.id !== selectedEvaluation.id));
      setSelectedEvaluation(null);
      setResponses({});

      // Update session storage
      const stored = JSON.parse(localStorage.getItem('employee_session') || '{}');
      stored.pendingEvaluations = stored.pendingEvaluations?.filter((e: PendingEvaluation) => e.id !== selectedEvaluation.id);
      localStorage.setItem('employee_session', JSON.stringify(stored));
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth Screen
  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-brand-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Autoavaliação</CardTitle>
            <CardDescription>
              Acesse com o email cadastrado na empresa para realizar sua autoavaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Primeiro Acesso</TabsTrigger>
              </TabsList>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {authMode === 'login' ? 'Entrar' : 'Criar Cadastro'}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Evaluation Form
  if (selectedEvaluation) {
    const categorizedQuestions = selectedEvaluation.questions.reduce((acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {} as Record<string, typeof selectedEvaluation.questions>);

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{selectedEvaluation.evaluation_cycles.title}</h1>
              <p className="text-sm text-muted-foreground">{employee.name}</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedEvaluation(null)}>
              Voltar
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {Object.entries(categorizedQuestions).map(([category, questions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
                    <p className="font-medium text-foreground">
                      {idx + 1}. {q.question}
                    </p>
                    
                    {q.type === 'rating' || q.type === 'scale' ? (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleResponseChange(q.id, 'rating', rating)}
                            className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                              responses[q.id]?.rating === rating
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-border hover:border-brand-400 text-foreground'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={responses[q.id]?.response || ''}
                        onChange={(e) => handleResponseChange(q.id, 'response', e.target.value)}
                        placeholder="Sua resposta..."
                        rows={3}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => setSelectedEvaluation(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar Autoavaliação
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{employee.name}</p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Avaliações</h1>

        {pendingEvaluations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Tudo em dia!</h3>
              <p className="text-muted-foreground">Você não possui avaliações pendentes no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingEvaluations.map(evaluation => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvaluation(evaluation)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{evaluation.evaluation_cycles.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {evaluation.questions.length} perguntas
                      </p>
                      {evaluation.evaluation_cycles.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {evaluation.evaluation_cycles.description}
                        </p>
                      )}
                    </div>
                    <Button>Responder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

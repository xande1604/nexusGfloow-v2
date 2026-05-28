import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, User, LogOut, ClipboardCheck, ExternalLink } from 'lucide-react';
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

interface PendingStandaloneReview {
  id: string;
  date: string;
  questions: Array<{ id: string; question: string; type: 'rating' | 'text' }>;
  status: string;
}

export default function SelfAssessment() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
  const [pendingStandaloneReviews, setPendingStandaloneReviews] = useState<PendingStandaloneReview[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null);
  const [selectedStandaloneReview, setSelectedStandaloneReview] = useState<PendingStandaloneReview | null>(null);
  const [responses, setResponses] = useState<Record<string, { rating?: number; response?: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadEmployeeFromUser(session.user.id);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const loadEmployeeFromUser = async (userId: string) => {
    const { data: emp } = await supabase
      .from('nexus_employees')
      .select('id, nome, email, codigocargo')
      .eq('linked_user_id', userId)
      .maybeSingle();

    if (!emp) return;

    setEmployee({ id: emp.id, name: emp.nome, email: emp.email || '', roleCode: emp.codigocargo || '' });

    // Fetch cycle-based evaluations (employee_evaluations)
    const { data: evals } = await supabase
      .from('employee_evaluations')
      .select(`
        id,
        cycle_id,
        questions,
        status,
        evaluation_cycles!inner(title, description, status)
      `)
      .eq('employee_id', emp.id)
      .eq('status', 'pending')
      .eq('evaluation_cycles.status', 'active');

    setPendingEvaluations((evals as PendingEvaluation[]) || []);

    // Fetch standalone reviews (performance_reviews) pending self-assessment
    const { data: standaloneReviews } = await supabase
      .from('performance_reviews')
      .select('id, date, questions, status')
      .eq('employee_id', emp.id)
      .eq('status', 'PendingSelf');

    setPendingStandaloneReviews((standaloneReviews as PendingStandaloneReview[]) || []);
  };

  // ── Auth handler ──────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'register') {
        // Call edge function to create Supabase Auth user + user_roles + link employee
        const { data, error } = await supabase.functions.invoke('employee-auth', {
          body: { action: 'register', email, password },
        });

        if (error) throw error;
        if (data.error) {
          toast.error(data.error);
          return;
        }

        // Now sign in with the newly created account
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await loadEmployeeFromUser(session.user.id);

        toast.success('Cadastro realizado! Bem-vindo ao portal.');

      } else {
        // Login — use Supabase Auth directly
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          if (
            signInError.message.includes('Invalid login credentials') ||
            signInError.message.includes('invalid_credentials')
          ) {
            toast.error('Email ou senha incorretos. Verifique seus dados.');
          } else if (signInError.message.includes('Email not confirmed')) {
            toast.error('Email não confirmado. Entre em contato com o RH.');
          } else {
            toast.error(signInError.message || 'Erro ao fazer login');
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error('Sessão não encontrada. Tente novamente.');
          return;
        }

        await loadEmployeeFromUser(session.user.id);

        if (!employee) {
          // Edge case: has Supabase Auth account but no linked employee
          // Try to link via employee-auth
          const { data, error } = await supabase.functions.invoke('employee-auth', {
            body: { action: 'login', email, password },
          });
          if (!error && data?.employee) {
            setEmployee(data.employee);
            setPendingEvaluations(data.pendingEvaluations || []);
          }
        }

        toast.success('Login realizado!');
      }

    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmployee(null);
    setPendingEvaluations([]);
    setPendingStandaloneReviews([]);
    setSelectedEvaluation(null);
    setSelectedStandaloneReview(null);
    setResponses({});
    setEmail('');
    setPassword('');
  };

  const handleResponseChange = (questionId: string, field: 'rating' | 'response', value: number | string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
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
        ...responses[q.id],
      }));

      const { data, error } = await supabase.functions.invoke('submit-self-assessment', {
        body: {
          evaluationId: selectedEvaluation.id,
          employeeId: employee.id,
          responses: formattedResponses,
        },
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
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitStandalone = async () => {
    if (!selectedStandaloneReview || !employee) return;

    const unansweredQuestions = selectedStandaloneReview.questions.filter(q => {
      const response = responses[q.id];
      return !response || (!response.rating && !response.response);
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Por favor, responda todas as ${unansweredQuestions.length} perguntas restantes`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedResponses = selectedStandaloneReview.questions.map(q => ({
        questionId: q.id,
        rating: responses[q.id]?.rating,
        text: responses[q.id]?.response,
      }));

      const { error } = await supabase
        .from('performance_reviews')
        .update({
          responses: formattedResponses as any,
          status: 'PendingManager',
        })
        .eq('id', selectedStandaloneReview.id);

      if (error) throw error;

      toast.success('Autoavaliação enviada com sucesso!');
      setPendingStandaloneReviews(prev => prev.filter(r => r.id !== selectedStandaloneReview.id));
      setSelectedStandaloneReview(null);
      setResponses({});
    } catch (error) {
      console.error('Submit standalone error:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading inicial ───────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ── Tela de autenticação ──────────────────────────────────────
  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-brand-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Portal do Colaborador</CardTitle>
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
                  <Label htmlFor="password">
                    {authMode === 'register' ? 'Crie uma senha' : 'Senha'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  {authMode === 'register' && (
                    <p className="text-xs text-muted-foreground">Mínimo 6 caracteres. Use esta senha também no portal completo.</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {authMode === 'login' ? 'Entrar' : 'Criar Cadastro'}
                </Button>
              </form>

              {authMode === 'login' && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Primeiro acesso? Clique em <button className="text-brand-600 font-medium" onClick={() => setAuthMode('register')}>Primeiro Acesso</button> para criar sua conta.
                </p>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Formulário de avaliação ───────────────────────────────────
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
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Enviar Autoavaliação
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Formulário de avaliação avulsa ───────────────────────────
  if (selectedStandaloneReview) {
    const reviewDate = new Date(selectedStandaloneReview.date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Autoavaliação — {reviewDate}</h1>
              <p className="text-sm text-muted-foreground">{employee.name}</p>
            </div>
            <Button variant="ghost" onClick={() => { setSelectedStandaloneReview(null); setResponses({}); }}>
              Voltar
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perguntas de Autoavaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedStandaloneReview.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
                  <p className="font-medium text-foreground">
                    {idx + 1}. {q.question}
                  </p>

                  {q.type === 'rating' ? (
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

          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => { setSelectedStandaloneReview(null); setResponses({}); }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitStandalone} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Enviar Autoavaliação
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Dashboard do colaborador ──────────────────────────────────
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://nexus.gfloow.com.br', '_blank')}
              className="hidden sm:flex items-center gap-1.5 text-brand-600 border-brand-200 hover:bg-brand-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Portal Completo
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner portal completo */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-800">Acesse o portal completo</p>
            <p className="text-xs text-brand-600 mt-0.5">
              Veja seu roadmap, treinamentos, habilidades e histórico de avaliações em <strong>nexus.gfloow.com.br</strong>
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-brand-600 hover:bg-brand-700"
            onClick={() => window.open('https://nexus.gfloow.com.br', '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Acessar
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Avaliações</h1>

        {pendingEvaluations.length === 0 && pendingStandaloneReviews.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Tudo em dia!</h3>
              <p className="text-muted-foreground">Você não possui avaliações pendentes no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Avaliações de ciclo */}
            {pendingEvaluations.map(evaluation => (
              <Card
                key={evaluation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedEvaluation(evaluation)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Ciclo de Avaliação</span>
                      </div>
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

            {/* Avaliações avulsas */}
            {pendingStandaloneReviews.map(review => {
              const reviewDate = new Date(review.date).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
              });
              return (
                <Card
                  key={review.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedStandaloneReview(review); setResponses({}); }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Avaliação Avulsa</span>
                        </div>
                        <h3 className="font-semibold text-foreground">Autoavaliação — {reviewDate}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {review.questions.length} perguntas
                        </p>
                      </div>
                      <Button>Responder</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

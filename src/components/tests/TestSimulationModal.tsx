import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Flag, Eye } from 'lucide-react';
import { Test, TestQuestion } from '@/types/tests';
import { cn } from '@/lib/utils';

interface TestSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test | null;
}

interface Response {
  questionIndex: number;
  answer: string;
  flagged: boolean;
}

export const TestSimulationModal = ({ isOpen, onClose, test }: TestSimulationModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const questions: TestQuestion[] = test?.questions || [];
  const totalQuestions = questions.length;

  // Initialize responses and timer when modal opens
  useEffect(() => {
    if (isOpen && test) {
      setCurrentQuestion(0);
      setIsFinished(false);
      setShowResults(false);
      setTimeRemaining((test.timeLimitMinutes || 60) * 60);
      setResponses(
        questions.map((_, idx) => ({
          questionIndex: idx,
          answer: '',
          flagged: false,
        }))
      );
    }
  }, [isOpen, test]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isFinished || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsFinished(true);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isFinished, timeRemaining]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleAnswerChange = (answer: string) => {
    setResponses(prev =>
      prev.map((r, idx) =>
        idx === currentQuestion ? { ...r, answer } : r
      )
    );
  };

  const toggleFlag = () => {
    setResponses(prev =>
      prev.map((r, idx) =>
        idx === currentQuestion ? { ...r, flagged: !r.flagged } : r
      )
    );
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    setShowResults(true);
  };

  const calculateResults = () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, idx) => {
      totalPoints += q.points || 1;
      if (q.type === 'multiple_choice' && q.correctAnswer) {
        // correctAnswer stores the option id
        if (responses[idx]?.answer === q.correctAnswer) {
          correctCount++;
          earnedPoints += q.points || 1;
        }
      }
    });

    const multipleChoiceQuestions = questions.filter(q => q.type === 'multiple_choice');
    const essayQuestions = questions.filter(q => q.type === 'essay');
    const answeredQuestions = responses.filter(r => r.answer.trim() !== '').length;

    return {
      correctCount,
      totalMultipleChoice: multipleChoiceQuestions.length,
      totalEssay: essayQuestions.length,
      totalPoints,
      earnedPoints,
      answeredQuestions,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      passed: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 >= (test?.passingScore || 70) : false,
    };
  };

  if (!test || !isOpen) return null;

  const currentQ = questions[currentQuestion];
  const currentResponse = responses[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Results view
  if (showResults) {
    const results = calculateResults();

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Resultado da Simulação
            </DialogTitle>
            <DialogDescription>
              Revisão do teste: {test.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Summary Card */}
            <Card className={cn(
              "border-2",
              results.passed ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {results.passed ? (
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">
                        {results.passed ? 'Aprovado' : 'Reprovado'}
                      </h3>
                      <p className="text-muted-foreground">
                        Nota mínima: {test.passingScore}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{results.percentage}%</div>
                    <p className="text-sm text-muted-foreground">
                      {results.earnedPoints} de {results.totalPoints} pontos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">{results.answeredQuestions}</div>
                  <p className="text-sm text-muted-foreground">Respondidas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.correctCount}</div>
                  <p className="text-sm text-muted-foreground">Corretas (objetivas)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">{results.totalMultipleChoice}</div>
                  <p className="text-sm text-muted-foreground">Múltipla Escolha</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">{results.totalEssay}</div>
                  <p className="text-sm text-muted-foreground">Dissertativas</p>
                </CardContent>
              </Card>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Revisão das Questões</h4>
              {questions.map((q, idx) => {
                const response = responses[idx];
                const isCorrect = q.type === 'multiple_choice' && q.correctAnswer === response?.answer;
                const isIncorrect = q.type === 'multiple_choice' && response?.answer && q.correctAnswer !== response?.answer;

                return (
                  <Card key={idx} className={cn(
                    "border-l-4",
                    q.type === 'essay' ? "border-l-blue-500" :
                    isCorrect ? "border-l-green-500" :
                    isIncorrect ? "border-l-red-500" : "border-l-gray-300"
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{idx + 1}</Badge>
                            <Badge variant="secondary">{q.category || 'Geral'}</Badge>
                            <Badge variant={q.type === 'essay' ? 'default' : 'outline'}>
                              {q.type === 'essay' ? 'Dissertativa' : 'Objetiva'}
                            </Badge>
                            {q.type === 'multiple_choice' && (
                              isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : isIncorrect ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : null
                            )}
                          </div>
                          <p className="font-medium mb-2">{q.questionText}</p>
                          
                          {q.type === 'multiple_choice' && q.options && (
                            <div className="space-y-1 text-sm">
                              {q.options.map((opt) => {
                                const isCorrectOption = opt.id === q.correctAnswer;
                                const isUserAnswer = opt.id === response?.answer;
                                return (
                                  <div
                                    key={opt.id}
                                    className={cn(
                                      "p-2 rounded",
                                      isCorrectOption && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                                      isUserAnswer && !isCorrectOption && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                    )}
                                  >
                                    {opt.text}
                                    {isCorrectOption && " ✓"}
                                    {isUserAnswer && !isCorrectOption && " (sua resposta)"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'essay' && (
                            <div className="mt-2 p-3 bg-muted rounded text-sm">
                              <p className="font-medium text-muted-foreground mb-1">Sua resposta:</p>
                              <p>{response?.answer || <em className="text-muted-foreground">Não respondida</em>}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {q.points} pts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>Fechar Simulação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Test simulation view
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Simulação: {test.title}
            </span>
            <Badge variant={timeRemaining < 300 ? 'destructive' : 'secondary'} className="text-lg px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Modo de simulação para verificar questões e funcionamento
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Questão {currentQuestion + 1} de {totalQuestions}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question navigation pills */}
          <div className="flex flex-wrap gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                  idx === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : responses[idx]?.answer
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-muted hover:bg-muted/80",
                  responses[idx]?.flagged && "ring-2 ring-orange-500"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Current question */}
          {currentQ && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Questão {currentQuestion + 1}</Badge>
                    <Badge variant="secondary">{currentQ.category || 'Geral'}</Badge>
                    <Badge variant={currentQ.type === 'essay' ? 'default' : 'outline'}>
                      {currentQ.type === 'essay' ? 'Dissertativa' : 'Objetiva'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{currentQ.points} pts</span>
                    <Button
                      variant={currentResponse?.flagged ? 'default' : 'ghost'}
                      size="sm"
                      onClick={toggleFlag}
                      className={currentResponse?.flagged ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{currentQ.questionText}</p>

                {currentQ.type === 'multiple_choice' && currentQ.options ? (
                  <RadioGroup
                    value={currentResponse?.answer || ''}
                    onValueChange={handleAnswerChange}
                    className="space-y-2"
                  >
                    {currentQ.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                          currentResponse?.answer === option.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={currentResponse?.answer || ''}
                    onChange={e => handleAnswerChange(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={6}
                    className="resize-none"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={handleFinish}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Finalizar Simulação
              </Button>
            ) : (
              <Button onClick={() => goToQuestion(currentQuestion + 1)}>
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Briefcase, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePricingQuestionnaire, PricingProfileType, PricingQuestion } from '@/hooks/usePricingQuestionnaire';

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  Briefcase: <Briefcase className="h-8 w-8" />,
};

interface PricingQuestionnaireProps {
  onComplete?: () => void;
}

export function PricingQuestionnaire({ onComplete }: PricingQuestionnaireProps) {
  const { profiles, loading, submitting, getQuestionsForProfile, submitResponse } = usePricingQuestionnaire();
  
  const [step, setStep] = useState<'profile' | 'questions' | 'contact' | 'success'>('profile');
  const [selectedProfile, setSelectedProfile] = useState<PricingProfileType | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const questions = selectedProfile ? getQuestionsForProfile(selectedProfile) : [];

  const handleProfileSelect = (profileType: PricingProfileType) => {
    setSelectedProfile(profileType);
    setStep('questions');
    setAnswers({});
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiselectChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((o: string) => o !== option) };
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedProfile) return;
    
    const success = await submitResponse({
      profile_type: selectedProfile,
      contact_name: contactInfo.name,
      contact_email: contactInfo.email,
      contact_phone: contactInfo.phone,
      company_name: contactInfo.company,
      responses: answers
    });

    if (success) {
      setStep('success');
      onComplete?.();
    }
  };

  const isQuestionsValid = () => {
    return questions.every(q => {
      if (!q.is_required) return true;
      const answer = answers[q.id];
      if (Array.isArray(answer)) return answer.length > 0;
      return answer && answer.toString().trim() !== '';
    });
  };

  const isContactValid = () => {
    return contactInfo.name.trim() !== '' && 
           contactInfo.email.trim() !== '' && 
           contactInfo.email.includes('@');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Como você pretende usar o GFloow?</h2>
              <p className="text-muted-foreground">
                Selecione o perfil que melhor descreve seu uso para personalizarmos sua proposta.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {profiles.map((profile) => (
                <Card 
                  key={profile.id}
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleProfileSelect(profile.profile_type)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit text-primary">
                      {iconMap[profile.icon || 'Building2']}
                    </div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-sm">
                      {profile.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'questions' && selectedProfile && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep('profile')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Conte-nos mais sobre sua necessidade</h2>
                <p className="text-muted-foreground text-sm">
                  Responda as perguntas abaixo para personalizarmos sua proposta.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  onMultiselectChange={(option, checked) => 
                    handleMultiselectChange(question.id, option, checked)
                  }
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep('contact')} 
                disabled={!isQuestionsValid()}
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep('questions')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Seus dados de contato</h2>
                <p className="text-muted-foreground text-sm">
                  Informe como podemos entrar em contato com você.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa/Consultoria</Label>
                    <Input
                      id="company"
                      value={contactInfo.company}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!isContactValid() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-4"
          >
            <div className="mx-auto w-fit p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Obrigado pelo interesse!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Recebemos suas respostas e entraremos em contato em breve com uma proposta personalizada para você.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface QuestionFieldProps {
  question: PricingQuestion;
  value: any;
  onChange: (value: any) => void;
  onMultiselectChange: (option: string, checked: boolean) => void;
  index: number;
}

function QuestionField({ question, value, onChange, onMultiselectChange, index }: QuestionFieldProps) {
  const options = question.options || [];
  const metadata = question.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      <Label className="text-base font-medium">
        {question.question_text}
        {question.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {question.question_type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
        />
      )}

      {question.question_type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
          min={metadata.min}
          max={metadata.max}
        />
      )}

      {question.question_type === 'select' && (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="grid gap-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.question_type === 'multiselect' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option}`}
                checked={(value || []).includes(option)}
                onCheckedChange={(checked) => onMultiselectChange(option, checked as boolean)}
              />
              <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      )}

      {question.question_type === 'range' && metadata.ranges && (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(metadata.ranges as Array<{ label: string; value: string }>).map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <RadioGroupItem value={range.value} id={`${question.id}-${range.value}`} />
                <Label htmlFor={`${question.id}-${range.value}`} className="font-normal cursor-pointer">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}
    </motion.div>
  );
}

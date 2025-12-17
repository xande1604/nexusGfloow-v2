import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Lightbulb, 
  Brain, 
  Users, 
  TrendingUp,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  GraduationCap,
  LineChart,
  Settings,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 'intro',
    title: 'GFloow Nexus',
    subtitle: 'Gestão Inteligente de Talentos',
    content: 'A plataforma SaaS que transforma a gestão de pessoas em PMEs com Inteligência Artificial',
    icon: Sparkles,
    gradient: 'from-indigo-600 via-purple-600 to-blue-600',
  },
  {
    id: 'problem',
    title: 'O Problema',
    subtitle: 'PMEs enfrentam desafios críticos',
    items: [
      { icon: Target, text: 'Falta de estruturação de cargos e salários' },
      { icon: Users, text: 'Dificuldade em mapear e desenvolver competências' },
      { icon: TrendingUp, text: 'Avaliações de desempenho inconsistentes' },
      { icon: Lightbulb, text: 'Ausência de planos de carreira claros' },
    ],
    gradient: 'from-red-500 via-orange-500 to-amber-500',
  },
  {
    id: 'solution',
    title: 'Nossa Solução',
    subtitle: 'Plataforma integrada com IA',
    content: 'GFloow Nexus oferece uma solução completa que automatiza e inteligencia a gestão de talentos, permitindo que PMEs tenham acesso às mesmas ferramentas de grandes corporações.',
    icon: Brain,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'modules',
    title: 'Módulos Principais',
    subtitle: '5 pilares da gestão de talentos',
    modules: [
      { icon: Briefcase, name: 'Cargos e Salários', desc: 'Estruturação completa de funções' },
      { icon: GraduationCap, name: 'Repositório de Habilidades', desc: 'Mapeamento de competências' },
      { icon: TrendingUp, name: 'Roadmap de Carreira', desc: 'Planos de desenvolvimento com IA' },
      { icon: LineChart, name: 'Avaliações de Desempenho', desc: 'Ciclos estruturados de feedback' },
      { icon: Building2, name: 'Centros de Custo', desc: 'Organização por departamento' },
    ],
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
  },
  {
    id: 'ai',
    title: 'Diferenciais de IA',
    subtitle: 'Inteligência Artificial aplicada',
    features: [
      { title: 'Refinamento de Cargos', desc: 'Geração automática de descrições, skills e entregas esperadas' },
      { title: 'Perguntas Personalizadas', desc: 'Questões de avaliação baseadas no cargo e valores da empresa' },
      { title: 'Roadmap Inteligente', desc: 'Plano de carreira personalizado com base no perfil do colaborador' },
    ],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'metrics',
    title: 'Números que Comprovam',
    subtitle: 'Resultados reais',
    stats: [
      { value: '10+', label: 'Empresas Ativas' },
      { value: '5.000+', label: 'Colaboradores Gerenciados' },
      { value: '100%', label: 'Baseado em IA' },
      { value: '24/7', label: 'Disponibilidade' },
    ],
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    id: 'business',
    title: 'Modelo de Negócio',
    subtitle: 'SaaS escalável',
    pricing: [
      { tier: 'Starter', price: 'R$ 299/mês', features: ['Até 50 colaboradores', 'Módulos básicos', 'Suporte por email'] },
      { tier: 'Professional', price: 'R$ 599/mês', features: ['Até 200 colaboradores', 'Todos os módulos', 'IA inclusa', 'Suporte prioritário'] },
      { tier: 'Enterprise', price: 'Sob consulta', features: ['Ilimitado', 'Customizações', 'API dedicada', 'Suporte 24/7'] },
    ],
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
  },
  {
    id: 'cta',
    title: 'Pronto para Transformar?',
    subtitle: 'Comece sua jornada hoje',
    content: 'Agende uma demonstração e descubra como o GFloow Nexus pode revolucionar a gestão de talentos da sua empresa.',
    icon: ArrowRight,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
  },
];

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const renderSlideContent = () => {
    switch (slide.id) {
      case 'intro':
      case 'solution':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {slide.icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"
              >
                <slide.icon className="w-12 h-12 text-white" />
              </motion.div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold text-white">{slide.title}</h1>
            <p className="text-2xl md:text-3xl text-white/80">{slide.subtitle}</p>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">{slide.content}</p>
          </motion.div>
        );

      case 'problem':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mt-4">{slide.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {slide.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-lg text-white">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'modules':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mt-4">{slide.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {slide.modules?.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{module.name}</h3>
                  <p className="text-sm text-white/70">{module.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'ai':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mt-4">{slide.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {slide.features?.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'metrics':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mt-4">{slide.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {slide.stats?.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: index * 0.15 + 0.3 }}
                    className="text-5xl md:text-6xl font-bold text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-lg text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'business':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mt-4">{slide.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {slide.pricing?.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 ${index === 1 ? 'ring-2 ring-white/50 scale-105' : ''}`}
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.tier}</h3>
                  <div className="text-3xl font-bold text-white mb-4">{plan.price}</div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/80">
                        <CheckCircle2 className="w-5 h-5 text-white/60" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'cta':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">{slide.title}</h1>
            <p className="text-xl md:text-2xl text-white/80">{slide.subtitle}</p>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">{slide.content}</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-indigo-600 hover:bg-white/90"
                onClick={() => navigate('/')}
              >
                Agendar Demonstração
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10"
                onClick={() => navigate('/app')}
              >
                Acessar Plataforma
              </Button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.gradient} transition-all duration-700`}>
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          onClick={() => navigate('/app')}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Progress value={progress} className="h-1 rounded-none bg-white/20 [&>div]:bg-white" />
      </div>

      {/* Slide Content */}
      <main className="min-h-screen flex items-center justify-center p-8 pt-20 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl"
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="lg"
          className="text-white hover:bg-white/10 disabled:opacity-30"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-6 h-6" />
          Anterior
        </Button>

        {/* Slide Indicators */}
        <div className="hidden md:flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="text-white hover:bg-white/10 disabled:opacity-30"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Próximo
          <ChevronRight className="w-6 h-6" />
        </Button>
      </footer>

      {/* Keyboard Navigation Hint */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-sm hidden md:block">
        Use as setas ← → para navegar
      </div>
    </div>
  );
};

export default PitchDeck;

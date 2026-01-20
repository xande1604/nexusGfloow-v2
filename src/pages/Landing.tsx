import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  Brain, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  DollarSign,
  Heart,
  Lightbulb,
  Route,
  Star,
  ChevronRight,
  Send,
  Loader2,
  Mail,
  Phone,
  User,
  Building,
  Menu,
  X
} from "lucide-react";
import { PricingQuestionnaire } from "@/components/pricing/PricingQuestionnaire";
import { useNavigate, Link } from "react-router-dom";

const contactSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  empresa: z.string().trim().max(100, "Nome da empresa muito longo").optional(),
  telefone: z.string().trim().max(20, "Telefone muito longo").optional(),
  mensagem: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(1000, "Mensagem muito longa"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 }
  },
  viewport: { once: true, margin: "-100px" }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
};

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ContactFormData>({
    nome: "",
    email: "",
    empresa: "",
    telefone: "",
    mensagem: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#recursos", label: "Recursos", isExternal: false },
    { href: "#beneficios", label: "Benefícios", isExternal: false },
    { href: "#ia", label: "IA", isExternal: false },
    { href: "#precificacao", label: "Preços", isExternal: false },
    { href: "/blog", label: "Blog", isExternal: true },
    { href: "#contato", label: "Contato", isExternal: false },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('contatos').insert({
        nome: result.data.nome,
        email: result.data.email,
        empresa: result.data.empresa || null,
        telefone: result.data.telefone || null,
        mensagem: result.data.mensagem,
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      setFormData({
        nome: "",
        email: "",
        empresa: "",
        telefone: "",
        mensagem: "",
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Gestão de Colaboradores",
      description: "Centralize todas as informações dos seus colaboradores em um único lugar, com histórico completo e dados sempre atualizados.",
      color: "text-blue-500"
    },
    {
      icon: Target,
      title: "Cargos e Salários",
      description: "Estruture sua política de cargos com faixas salariais competitivas e descrições de cargo geradas por IA.",
      color: "text-indigo-500"
    },
    {
      icon: Lightbulb,
      title: "Repositório de Habilidades",
      description: "Mapeie competências técnicas e comportamentais da sua equipe, identificando gaps e oportunidades de desenvolvimento.",
      color: "text-purple-500"
    },
    {
      icon: Route,
      title: "Roadmap de Carreira",
      description: "Crie trilhas de desenvolvimento personalizadas com IA, mostrando o caminho claro para crescimento profissional.",
      color: "text-teal-500"
    },
    {
      icon: Award,
      title: "Avaliações de Desempenho",
      description: "Ciclos de avaliação completos com autoavaliação, avaliação do gestor e feedback estruturado.",
      color: "text-amber-500"
    },
    {
      icon: BarChart3,
      title: "Analytics de RH",
      description: "Dashboards intuitivos com métricas de turnover, headcount, performance e muito mais.",
      color: "text-emerald-500"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Automatize processos manuais e reduza em até 70% o tempo gasto com tarefas administrativas de RH."
    },
    {
      icon: DollarSign,
      title: "Reduza Custos",
      description: "Diminua o turnover com planos de carreira claros e avaliações justas que engajam colaboradores."
    },
    {
      icon: TrendingUp,
      title: "Tome Decisões Baseadas em Dados",
      description: "Acesse insights em tempo real sobre sua equipe para decisões estratégicas fundamentadas."
    },
    {
      icon: Heart,
      title: "Aumente o Engajamento",
      description: "Colaboradores com visão clara de crescimento são 3x mais engajados e produtivos."
    }
  ];

  const aiFeatures = [
    "Geração automática de descrições de cargo",
    "Criação de perguntas de avaliação personalizadas",
    "Roadmaps de carreira sob medida",
    "Sugestões de habilidades por função",
    "Análise inteligente de gaps de competência"
  ];

  const testimonials = [
    {
      quote: "O GFloow transformou completamente nosso processo de avaliação. Antes levávamos semanas, agora dias.",
      author: "Maria Silva",
      role: "Diretora de RH",
      company: "TechCorp Brasil"
    },
    {
      quote: "A funcionalidade de roadmap de carreira reduziu nosso turnover em 40% no primeiro ano.",
      author: "Carlos Santos",
      role: "CEO",
      company: "Inova Serviços"
    },
    {
      quote: "Finalmente uma ferramenta que entende as necessidades do RH de PMEs brasileiras.",
      author: "Ana Oliveira",
      role: "Gerente de Pessoas",
      company: "Grupo Futuro"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl text-foreground">GFloow Nexus</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.isExternal ? (
                  <Link 
                    key={link.href}
                    to={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Entrar
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90">
                Começar Grátis
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? "auto" : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="md:hidden overflow-hidden bg-background border-b border-border"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              link.isExternal ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth');
                }}
              >
                Entrar
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth');
                }}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Potencializado por Inteligência Artificial
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Gestão de Talentos
              <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent"> Inteligente </span>
              para PMEs
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transforme seu RH com uma plataforma completa que une gestão de pessoas, 
              avaliações de desempenho e desenvolvimento de carreira — tudo impulsionado por IA.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-lg px-8 py-6"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Conhecer Recursos
              </Button>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Setup em minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Suporte em português</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30"
        {...fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { value: "10+", label: "Empresas Ativas" },
              { value: "5k+", label: "Colaboradores Gerenciados" },
              { value: "98%", label: "Satisfação dos Clientes" },
              { value: "40%", label: "Redução de Turnover" }
            ].map((metric, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={staggerItem}
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </div>
                <div className="text-muted-foreground text-sm sm:text-base">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge variant="outline" className="mb-4">Recursos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tudo que seu RH precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades completas para gestão de talentos, do recrutamento ao desenvolvimento contínuo.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-indigo-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <Badge variant="outline" className="mb-4">Benefícios</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Resultados reais para sua empresa
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Nossos clientes alcançam resultados mensuráveis desde o primeiro mês de uso.
              </p>

              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, margin: "-100px" }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div key={index} className="flex gap-4" variants={staggerItem}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="relative" {...scaleIn}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-3xl blur-2xl" />
              <Card className="relative bg-card/80 backdrop-blur border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Empresa Exemplo</div>
                      <div className="text-sm text-muted-foreground">150 colaboradores</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Tempo em processos de RH</span>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive line-through">40h/mês</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-emerald-500 font-semibold">12h/mês</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Taxa de turnover</span>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive line-through">25%</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-emerald-500 font-semibold">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Engajamento</span>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive line-through">62%</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-emerald-500 font-semibold">89%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ia" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge variant="outline" className="mb-4">
              <Brain className="w-4 h-4 mr-2 inline" />
              Inteligência Artificial
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              IA que trabalha para você
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatize tarefas repetitivas e tome decisões mais inteligentes com nossa IA integrada.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="order-2 lg:order-1" {...scaleIn}>
              <Card className="bg-gradient-to-br from-primary/5 to-indigo-500/5 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">GFloow AI</span>
                  </div>
                  
                  <motion.div 
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    {aiFeatures.map((feature, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center gap-3 p-3 bg-background/50 rounded-lg"
                        variants={staggerItem}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="order-1 lg:order-2 space-y-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div className="flex gap-4" variants={staggerItem}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Automação Inteligente</h3>
                  <p className="text-muted-foreground">
                    Nossa IA aprende com seus dados e automatiza tarefas como criação de descrições de cargo, 
                    sugestões de desenvolvimento e análise de competências.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={staggerItem}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Seguro e Confidencial</h3>
                  <p className="text-muted-foreground">
                    Seus dados nunca são compartilhados ou usados para treinar modelos externos. 
                    Privacidade total com criptografia de ponta a ponta.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={staggerItem}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Insights Acionáveis</h3>
                  <p className="text-muted-foreground">
                    Receba recomendações personalizadas baseadas em análise de dados para 
                    melhorar retenção, engajamento e performance.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge variant="outline" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="bg-card border-border/50 h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Questionnaire Section */}
      <section id="precificacao" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <Badge variant="outline" className="mb-4">
              <DollarSign className="w-4 h-4 mr-2 inline" />
              Precificação
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Descubra o plano ideal para você
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Responda algumas perguntas rápidas e receba uma proposta personalizada para sua necessidade.
            </p>
          </motion.div>

          <motion.div {...scaleIn}>
            <Card className="bg-card border-border/50 shadow-xl">
              <CardContent className="p-8">
                <PricingQuestionnaire />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div {...fadeInUp}>
              <Badge variant="outline" className="mb-4">
                <Mail className="w-4 h-4 mr-2 inline" />
                Fale Conosco
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Quer saber mais? Entre em contato!
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Preencha o formulário e nossa equipe entrará em contato para tirar suas dúvidas 
                e apresentar as melhores soluções para sua empresa.
              </p>

              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div className="flex gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Demonstração Personalizada</h3>
                    <p className="text-muted-foreground">Mostramos como a plataforma se adapta às suas necessidades.</p>
                  </div>
                </motion.div>

                <motion.div className="flex gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Suporte Especializado</h3>
                    <p className="text-muted-foreground">Equipe brasileira pronta para ajudar em português.</p>
                  </div>
                </motion.div>

                <motion.div className="flex gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sem Compromisso</h3>
                    <p className="text-muted-foreground">Conheça a plataforma sem obrigação de contratação.</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div {...scaleIn}>
              <Card className="bg-card border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmitContact} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome *
                        </Label>
                        <Input
                          id="nome"
                          name="nome"
                          placeholder="Seu nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className={formErrors.nome ? "border-destructive" : ""}
                        />
                        {formErrors.nome && (
                          <p className="text-sm text-destructive">{formErrors.nome}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={formErrors.email ? "border-destructive" : ""}
                        />
                        {formErrors.email && (
                          <p className="text-sm text-destructive">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa" className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Empresa
                        </Label>
                        <Input
                          id="empresa"
                          name="empresa"
                          placeholder="Nome da empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          className={formErrors.empresa ? "border-destructive" : ""}
                        />
                        {formErrors.empresa && (
                          <p className="text-sm text-destructive">{formErrors.empresa}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          placeholder="(11) 99999-9999"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          className={formErrors.telefone ? "border-destructive" : ""}
                        />
                        {formErrors.telefone && (
                          <p className="text-sm text-destructive">{formErrors.telefone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensagem" className="flex items-center gap-2">
                        Mensagem *
                      </Label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        placeholder="Conte-nos sobre suas necessidades de RH..."
                        rows={4}
                        value={formData.mensagem}
                        onChange={handleInputChange}
                        className={formErrors.mensagem ? "border-destructive" : ""}
                      />
                      {formErrors.mensagem && (
                        <p className="text-sm text-destructive">{formErrors.mensagem}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Ao enviar, você concorda com nossa Política de Privacidade.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        {...fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary to-indigo-600 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <CardContent className="p-8 sm:p-12 text-center relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pronto para transformar seu RH?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Junte-se a centenas de empresas que já modernizaram sua gestão de talentos com o GFloow Nexus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6"
                >
                  Começar Gratuitamente
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white/10"
                >
                  Agendar Demonstração
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">G</span>
                </div>
                <span className="font-bold text-lg text-foreground">GFloow Nexus</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Plataforma completa de gestão de talentos para PMEs brasileiras.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#recursos" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a></li>
                <li><a href="#ia" className="hover:text-foreground transition-colors">Inteligência Artificial</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre nós</a></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
                <li><a href="#contato" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 GFloow Nexus. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

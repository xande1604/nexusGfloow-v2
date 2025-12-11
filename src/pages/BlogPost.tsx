import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight,
  Share2,
  Menu,
  X
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#recursos", label: "Recursos" },
    { href: "/#beneficios", label: "Benefícios" },
    { href: "/#ia", label: "IA" },
    { href: "/blog", label: "Blog" },
    { href: "/#contato", label: "Contato" },
  ];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do artigo foi copiado para a área de transferência.",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {post && (
        <Helmet>
          <title>{post.seo_title || post.title} | GFloow Nexus</title>
          <meta name="description" content={post.meta_description || post.excerpt || ""} />
          {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
          <meta property="og:title" content={post.seo_title || post.title} />
          <meta property="og:description" content={post.meta_description || post.excerpt || ""} />
          {post.og_image && <meta property="og:image" content={post.og_image} />}
          <meta property="og:type" content="article" />
          {post.canonical_url && <link rel="canonical" href={post.canonical_url} />}
          <meta property="article:published_time" content={post.published_at || ""} />
          <meta property="article:author" content={post.author} />
        </Helmet>
      )}

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">G</span>
                </div>
                <span className="font-bold text-xl text-foreground">GFloow Nexus</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    to={link.href} 
                    className={`transition-colors ${link.href === '/blog' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Entrar
                </Button>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90">
                  Começar Grátis
                </Button>
              </div>

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
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
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

        {/* Article Content */}
        <article className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate('/blog')}
                className="mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Blog
              </Button>
            </motion.div>

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-96 w-full rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : post ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {post.author}
                  </span>
                  {post.published_at && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Cover Image */}
                {post.cover_image && (
                  <div className="mb-10 rounded-xl overflow-hidden">
                    <img 
                      src={post.cover_image} 
                      alt={post.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-foreground 
                    prose-p:text-muted-foreground 
                    prose-a:text-primary hover:prose-a:text-primary/80
                    prose-strong:text-foreground
                    prose-ul:text-muted-foreground
                    prose-ol:text-muted-foreground
                    prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                  "
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </motion.div>
            ) : null}
          </div>
        </article>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary to-indigo-600 border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <CardContent className="p-8 sm:p-12 text-center relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Gostou do conteúdo?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Experimente o GFloow Nexus e transforme a gestão de talentos da sua empresa.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">G</span>
                </div>
                <span className="font-bold text-lg text-foreground">GFloow Nexus</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                © 2024 GFloow Nexus. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogPost;

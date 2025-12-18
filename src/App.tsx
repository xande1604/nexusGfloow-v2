import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DemoProvider } from "@/contexts/DemoContext";
import { Loader2 } from "lucide-react";

// Lazy load pages for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const SelfAssessment = lazy(() => import("./pages/SelfAssessment"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/autoavaliacao" element={<SelfAssessment />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/pitch" element={<PitchDeck />} />
                <Route path="/install" element={<Install />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </DemoProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

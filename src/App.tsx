import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DemoProvider } from "@/contexts/DemoContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SelfAssessment from "./pages/SelfAssessment";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PitchDeck from "./pages/PitchDeck";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/autoavaliacao" element={<SelfAssessment />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/pitch" element={<PitchDeck />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DemoProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeBaseTab } from './KnowledgeBaseTab';
import { TestsTab } from './TestsTab';
import { CertificationsTab } from './CertificationsTab';
import { TestReportsTab } from './TestReportsTab';
import { BookOpen, FileCheck, Award, BarChart3 } from 'lucide-react';

interface TestsViewProps {
  isDemoMode?: boolean;
}

export const TestsView = ({ isDemoMode = false }: TestsViewProps) => {
  const [activeTab, setActiveTab] = useState('knowledge');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Testes e Certificações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a base de conhecimento, crie testes com IA e acompanhe certificações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Base de Conhecimento</span>
            <span className="sm:hidden">Base</span>
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Testes</span>
            <span className="sm:hidden">Testes</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Certificações</span>
            <span className="sm:hidden">Cert.</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Relatórios</span>
            <span className="sm:hidden">Rel.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBaseTab isDemoMode={isDemoMode} />
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <TestsTab isDemoMode={isDemoMode} />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <CertificationsTab isDemoMode={isDemoMode} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <TestReportsTab isDemoMode={isDemoMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestsView;

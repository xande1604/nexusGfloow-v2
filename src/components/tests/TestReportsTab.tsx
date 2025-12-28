import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTests, useTestAttempts, useCertifications } from '@/hooks/useTests';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useCostCenters } from '@/hooks/useCostCenters';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { TrendingUp, Users, Award, Target, CheckCircle, XCircle, FileDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface TestReportsTabProps {
  isDemoMode?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const TestReportsTab = ({ isDemoMode = false }: TestReportsTabProps) => {
  const { tests } = useTests();
  const { roles } = useJobRoles();
  const { costCenters } = useCostCenters();
  const { employees } = useEmployees();
  const { certifications } = useCertifications();
  const [selectedTestId, setSelectedTestId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    toast.info('Gerando PDF, aguarde...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(33, 33, 33);
      pdf.text('Relatório de Testes e Certificações', margin, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin, 28);
      
      if (selectedTestId !== 'all') {
        const selectedTest = tests.find(t => t.id === selectedTestId);
        if (selectedTest) {
          pdf.text(`Filtro: ${selectedTest.title}`, margin, 34);
        }
      }

      // Capture the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 40;
      let remainingHeight = imgHeight;
      let sourceY = 0;
      
      // Split image across pages if needed
      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPosition - margin;
        const sliceHeight = Math.min(availableHeight, remainingHeight);
        const sourceHeight = (sliceHeight / imgHeight) * canvas.height;
        
        // Create a temporary canvas for the slice
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );
          
          const sliceData = tempCanvas.toDataURL('image/png');
          pdf.addImage(sliceData, 'PNG', margin, yPosition, imgWidth, sliceHeight);
        }
        
        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }

      // Add footer to last page
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Relatório gerado automaticamente pelo sistema', margin, pageHeight - 5);

      pdf.save(`relatorio-testes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch attempts for all tests or selected test
  const { attempts } = useTestAttempts(selectedTestId !== 'all' ? selectedTestId : tests[0]?.id);

  // Calculate statistics by cargo
  const statsByCargo = useMemo(() => {
    const cargoStats: Record<string, { 
      name: string; 
      total: number; 
      passed: number; 
      avgScore: number;
      scores: number[];
    }> = {};

    tests.forEach(test => {
      if (test.cargoId) {
        const cargo = roles.find(r => r.id === test.cargoId);
        if (cargo) {
          if (!cargoStats[test.cargoId]) {
            cargoStats[test.cargoId] = {
              name: cargo.title,
              total: 0,
              passed: 0,
              avgScore: 0,
              scores: []
            };
          }
        }
      }
    });

    // Add demo data if in demo mode
    if (isDemoMode) {
      return [
        { name: 'Analista de Sistemas', total: 45, passed: 38, avgScore: 82, passRate: 84 },
        { name: 'Desenvolvedor', total: 32, passed: 28, avgScore: 78, passRate: 88 },
        { name: 'Gerente de Projetos', total: 18, passed: 15, avgScore: 85, passRate: 83 },
        { name: 'Suporte Técnico', total: 25, passed: 20, avgScore: 75, passRate: 80 },
        { name: 'Designer', total: 12, passed: 10, avgScore: 88, passRate: 83 }
      ];
    }

    return Object.values(cargoStats).map(stat => ({
      ...stat,
      avgScore: stat.scores.length > 0 ? Math.round(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length) : 0,
      passRate: stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0
    }));
  }, [tests, roles, isDemoMode]);

  // Calculate statistics by cost center
  const statsByCostCenter = useMemo(() => {
    if (isDemoMode) {
      return [
        { name: 'TI', total: 65, passed: 55, avgScore: 80, passRate: 85 },
        { name: 'Operações', total: 42, passed: 35, avgScore: 76, passRate: 83 },
        { name: 'Administrativo', total: 28, passed: 22, avgScore: 72, passRate: 79 },
        { name: 'Comercial', total: 20, passed: 18, avgScore: 85, passRate: 90 }
      ];
    }

    const ccStats: Record<string, { 
      name: string; 
      total: number; 
      passed: number; 
      avgScore: number;
      scores: number[];
    }> = {};

    tests.forEach(test => {
      if (test.costCenterId) {
        const cc = costCenters.find(c => c.id === test.costCenterId);
        if (cc) {
          if (!ccStats[test.costCenterId]) {
            ccStats[test.costCenterId] = {
              name: cc.nomecentrodecustos,
              total: 0,
              passed: 0,
              avgScore: 0,
              scores: []
            };
          }
        }
      }
    });

    return Object.values(ccStats).map(stat => ({
      ...stat,
      avgScore: stat.scores.length > 0 ? Math.round(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length) : 0,
      passRate: stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0
    }));
  }, [tests, costCenters, isDemoMode]);

  // Pass/Fail distribution
  const passFailData = useMemo(() => {
    if (isDemoMode) {
      return [
        { name: 'Aprovados', value: 130, color: 'hsl(var(--chart-2))' },
        { name: 'Reprovados', value: 25, color: 'hsl(var(--chart-1))' }
      ];
    }

    const passed = attempts.filter(a => a.status === 'graded' && (a.finalScore || 0) >= 70).length;
    const failed = attempts.filter(a => a.status === 'graded' && (a.finalScore || 0) < 70).length;
    
    return [
      { name: 'Aprovados', value: passed, color: 'hsl(var(--chart-2))' },
      { name: 'Reprovados', value: failed, color: 'hsl(var(--chart-1))' }
    ];
  }, [attempts, isDemoMode]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    if (isDemoMode) {
      return [
        { month: 'Jul', attempts: 18, passed: 15 },
        { month: 'Ago', attempts: 25, passed: 22 },
        { month: 'Set', attempts: 32, passed: 28 },
        { month: 'Out', attempts: 28, passed: 24 },
        { month: 'Nov', attempts: 35, passed: 30 },
        { month: 'Dez', attempts: 42, passed: 38 }
      ];
    }

    // Group attempts by month
    const monthData: Record<string, { attempts: number; passed: number }> = {};
    
    attempts.forEach(attempt => {
      if (attempt.completedAt) {
        const month = format(new Date(attempt.completedAt), 'MMM', { locale: ptBR });
        if (!monthData[month]) {
          monthData[month] = { attempts: 0, passed: 0 };
        }
        monthData[month].attempts++;
        if ((attempt.finalScore || 0) >= 70) {
          monthData[month].passed++;
        }
      }
    });

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [attempts, isDemoMode]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (isDemoMode) {
      return {
        totalTests: 12,
        totalAttempts: 155,
        avgPassRate: 84,
        totalCertifications: 130
      };
    }

    const completedAttempts = attempts.filter(a => a.status === 'graded');
    const passedAttempts = completedAttempts.filter(a => (a.finalScore || 0) >= 70);
    
    return {
      totalTests: tests.length,
      totalAttempts: completedAttempts.length,
      avgPassRate: completedAttempts.length > 0 
        ? Math.round((passedAttempts.length / completedAttempts.length) * 100) 
        : 0,
      totalCertifications: certifications.length
    };
  }, [tests, attempts, certifications, isDemoMode]);

  return (
    <div className="space-y-6">
      {/* Filter and Export */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="w-full sm:w-64">
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por teste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os testes</SelectItem>
              {tests.map(test => (
                <SelectItem key={test.id} value={test.id}>{test.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </>
          )}
        </Button>
      </div>

      <div ref={reportRef}>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summaryStats.totalTests}</p>
                <p className="text-xs text-muted-foreground">Testes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summaryStats.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Tentativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summaryStats.avgPassRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa Aprovação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summaryStats.totalCertifications}</p>
                <p className="text-xs text-muted-foreground">Certificações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance by Cargo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Desempenho por Cargo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsByCargo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsByCargo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="avgScore" name="Nota Média" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="passRate" name="Taxa Aprovação %" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de cargo disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance by Cost Center */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-chart-2" />
              Desempenho por Centro de Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsByCostCenter.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsByCostCenter}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                  <YAxis domain={[0, 100]} className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="avgScore" name="Nota Média" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="passRate" name="Taxa Aprovação %" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de centro de custos disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-chart-2" />
              Distribuição Aprovados/Reprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-4" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="attempts" 
                    name="Tentativas" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="passed" 
                    name="Aprovados" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de tendência disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo Detalhado por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cargo</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total Tentativas</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Aprovados</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Nota Média</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Taxa Aprovação</th>
                </tr>
              </thead>
              <tbody>
                {statsByCargo.map((stat, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{stat.name}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{stat.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-chart-2">
                        <CheckCircle className="w-4 h-4" />
                        {stat.passed}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${stat.avgScore >= 70 ? 'text-chart-2' : 'text-chart-1'}`}>
                        {stat.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${stat.passRate}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">{stat.passRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {statsByCargo.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum dado disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default TestReportsTab;

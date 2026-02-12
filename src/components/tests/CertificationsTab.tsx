import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCertifications, useTests } from '@/hooks/useTests';
import { demoCertifications, demoTests } from '@/components/demo/demoData';
import { useEmployees } from '@/hooks/useEmployees';
import { Award, Search, Loader2, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

interface CertificationsTabProps {
  isDemoMode?: boolean;
}

export const CertificationsTab = ({ isDemoMode = false }: CertificationsTabProps) => {
  const { certifications: realCertifications, loading } = useCertifications();
  const { tests: realTests } = useTests();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');

  const certifications = isDemoMode ? demoCertifications : realCertifications;
  const tests = isDemoMode ? demoTests : realTests;

  const getTestTitle = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    return test?.title || 'Teste não encontrado';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Colaborador não encontrado';
  };

  const filteredCertifications = certifications.filter(cert => {
    const testTitle = getTestTitle(cert.testId).toLowerCase();
    const employeeName = getEmployeeName(cert.employeeId).toLowerCase();
    const search = searchTerm.toLowerCase();
    return testTitle.includes(search) || employeeName.includes(search) || cert.certificateCode.toLowerCase().includes(search);
  });

  if (!isDemoMode && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar certificações..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCertifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma certificação encontrada</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchTerm 
                ? 'Tente buscar por outros termos.' 
                : 'As certificações serão exibidas aqui quando colaboradores forem aprovados em testes.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertifications.map(cert => (
            <Card key={cert.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">
                      {getTestTitle(cert.testId)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {getEmployeeName(cert.employeeId)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {cert.certificateCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Emitido em {new Date(cert.issuedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {cert.validUntil && (
                    <Badge variant={new Date(cert.validUntil) > new Date() ? 'default' : 'destructive'}>
                      {new Date(cert.validUntil) > new Date() 
                        ? `Válido até ${new Date(cert.validUntil).toLocaleDateString('pt-BR')}`
                        : 'Expirado'
                      }
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {certifications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600">{certifications.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total de Certificações</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {new Set(certifications.map(c => c.employeeId)).size}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Colaboradores Certificados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(certifications.map(c => c.testId)).size}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Testes com Aprovações</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

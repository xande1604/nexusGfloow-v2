import { useState, useEffect } from 'react';
import { X, User, Link, Unlink } from 'lucide-react';
import { CareerRoadmap, Employee } from '@/types';

interface RoadmapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: CareerRoadmap | null;
  employees: Employee[];
  onUpdateEmployee: (roadmapId: string, employeeId: string | null) => Promise<boolean>;
}

export const RoadmapEditModal = ({
  isOpen,
  onClose,
  roadmap,
  employees,
  onUpdateEmployee,
}: RoadmapEditModalProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && roadmap) {
      setSelectedEmployeeId(roadmap.employeeId || '');
    }
  }, [isOpen, roadmap]);

  const handleSubmit = async () => {
    if (!roadmap) return;
    
    setIsSubmitting(true);
    try {
      const success = await onUpdateEmployee(roadmap.id, selectedEmployeeId || null);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    if (!roadmap) return;
    
    setIsSubmitting(true);
    try {
      const success = await onUpdateEmployee(roadmap.id, null);
      if (success) {
        setSelectedEmployeeId('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !roadmap) return null;

  const currentEmployee = employees.find(e => e.id === roadmap.employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vincular Colaborador</h2>
              <p className="text-sm text-muted-foreground">
                {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Status */}
          {currentEmployee && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg">
              <p className="text-sm text-brand-700">
                <span className="font-medium">Vinculado atualmente:</span> {currentEmployee.name}
              </p>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Selecionar Colaborador
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Nenhum colaborador selecionado</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div>
            {roadmap.employeeId && (
              <button
                onClick={handleUnlink}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Unlink className="w-4 h-4" />
                Desvincular
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedEmployeeId}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Link className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Vincular'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

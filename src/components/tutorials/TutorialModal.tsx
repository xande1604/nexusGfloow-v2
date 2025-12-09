import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TutorialStep } from './TutorialsView';

interface Tutorial {
  id: string;
  title: string;
  steps: TutorialStep[];
}

interface TutorialModalProps {
  tutorial: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tutorialId: string) => void;
  isCompleted: boolean;
}

export const TutorialModal = ({
  tutorial,
  isOpen,
  onClose,
  onComplete,
  isCompleted
}: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!tutorial) return null;

  const totalSteps = tutorial.steps.length;
  const step = tutorial.steps[currentStep];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (!isCompleted) {
        onComplete(tutorial.id);
      }
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{tutorial.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {step.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {step.description}
          </p>
          
          {step.image && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-auto"
              />
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 py-2">
          {tutorial.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-brand-600 w-6' 
                  : index < currentStep 
                    ? 'bg-brand-400' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Fechar' : 'Concluir'}
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

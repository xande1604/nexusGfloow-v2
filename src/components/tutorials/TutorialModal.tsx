import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X, SkipForward } from 'lucide-react';
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
  description: string;
  icon: React.ElementType;
  duration: string;
  steps: TutorialStep[];
  category: 'basics' | 'advanced';
}

interface TutorialModalProps {
  tutorial: Tutorial | null;
  allTutorials: Tutorial[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tutorialId: string) => void;
  onNavigateToTutorial: (tutorial: Tutorial) => void;
  isCompleted: boolean;
  completedTutorials: string[];
}

export const TutorialModal = ({
  tutorial,
  allTutorials,
  isOpen,
  onClose,
  onComplete,
  onNavigateToTutorial,
  isCompleted,
  completedTutorials
}: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(0);
  }, [tutorial?.id]);

  if (!tutorial) return null;

  const totalSteps = tutorial.steps.length;
  const step = tutorial.steps[currentStep];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const currentIndex = allTutorials.findIndex(t => t.id === tutorial.id);
  const previousTutorial = currentIndex > 0 ? allTutorials[currentIndex - 1] : null;
  const nextTutorial = currentIndex < allTutorials.length - 1 ? allTutorials[currentIndex + 1] : null;

  const handleNext = () => {
    if (isLastStep) {
      if (!isCompleted) {
        onComplete(tutorial.id);
      }
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

  const handleGoToNextTutorial = () => {
    if (nextTutorial) {
      onNavigateToTutorial(nextTutorial);
    }
  };

  const handleGoToPreviousTutorial = () => {
    if (previousTutorial) {
      onNavigateToTutorial(previousTutorial);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Tutorial {currentIndex + 1} de {allTutorials.length}
              </span>
              <span className="text-muted-foreground">•</span>
              <DialogTitle className="text-xl">{tutorial.title}</DialogTitle>
            </div>
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

        <div className="py-6 space-y-4 overflow-y-auto flex-1">
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
        <div className="flex items-center justify-center gap-2 py-2 flex-shrink-0">
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

        <div className="flex flex-col gap-4 pt-4 border-t border-border flex-shrink-0">
          {/* Step Navigation */}
          <div className="flex items-center justify-between">
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
                  {isCompleted ? 'Concluído' : 'Concluir'}
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Tutorial Navigation - show after completing current or when already completed */}
          {(isLastStep || isCompleted) && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleGoToPreviousTutorial}
                disabled={!previousTutorial}
                className="gap-2 text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                {previousTutorial ? previousTutorial.title : 'Anterior'}
              </Button>

              <Button
                variant="ghost"
                onClick={handleGoToNextTutorial}
                disabled={!nextTutorial}
                className="gap-2 text-muted-foreground"
              >
                {nextTutorial ? nextTutorial.title : 'Próximo'}
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

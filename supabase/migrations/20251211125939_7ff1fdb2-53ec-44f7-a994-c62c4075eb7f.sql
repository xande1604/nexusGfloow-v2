-- Add progress column to career_roadmaps table
ALTER TABLE public.career_roadmaps 
ADD COLUMN IF NOT EXISTS progress jsonb DEFAULT NULL;

-- Add comment to explain the structure
COMMENT ON COLUMN public.career_roadmaps.progress IS 'Stores roadmap progress data including currentStepIndex, progressPercentage, completedSteps, achievements, gaps, nextActions, summary, lastUpdated, and updateHistory';
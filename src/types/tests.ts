// Types for Tests and Certifications module

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  cargoId?: string;
  costCenterId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'essay';
  questionText: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  points: number;
  category?: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  cargoId?: string;
  costCenterId?: string;
  participationMode: 'cargo' | 'selected' | 'self_enrollment';
  passingScore: number;
  timeLimitMinutes?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  questions: TestQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  employeeId: string;
  startedAt: string;
  completedAt?: string;
  responses: {
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    score?: number;
  }[];
  autoScore?: number;
  manualScore?: number;
  finalScore?: number;
  status: 'in_progress' | 'completed' | 'pending_review' | 'graded';
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
}

export interface Certification {
  id: string;
  testId: string;
  employeeId: string;
  attemptId: string;
  issuedAt: string;
  validUntil?: string;
  certificateCode: string;
}

export interface TestParticipant {
  id: string;
  testId: string;
  employeeId: string;
  invitedAt: string;
  invitedBy?: string;
}

export interface TestEnrollment {
  id: string;
  testId: string;
  employeeId: string;
  enrolledAt: string;
}

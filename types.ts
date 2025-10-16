
export enum Role {
  PROGRAMADOR = 'PROGRAMADOR',
  ALUNO = 'ALUNO',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
  role: Role;
  phone?: string;
  isCTStudent?: boolean;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export interface Quiz {
    questions: Question[];
}

export interface Attachment {
    name: string;
    url: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  attachments?: Attachment[];
  quiz?: Quiz;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  modules: Module[];
}

export interface CourseWithProgress extends Course {
    progress: number;
}

export interface QuizAttempt {
    lessonId: string;
    score: number;
    passed: boolean;
    timestamp: string;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  quizAttempts: QuizAttempt[];
}

export interface Coupon {
    id: string;
    code: string;
    discountPercentage: number;
    expiresAt: string;
    isActive: boolean;
    courseId?: string;
}

export interface CTAccessCode {
    id: string;
    code: string;
    isUsed: boolean;
    usedByUserId?: string;
}

export interface CTAccessCodeWithUserName extends CTAccessCode {
    usedByUserName?: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    lastSaved: string;
}

export interface Folder {
    id: string;
    name: string;
    notes: Note[];
}

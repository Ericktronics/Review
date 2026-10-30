export type Category =
  | 'Node.js'
  | 'TypeScript'
  | 'React'
  | 'Angular'
  | 'Express.js'
  | 'NestJS'
  | 'Next.js'
  | 'JavaScript'
  | 'OOP'
  | 'REST & HTTP'
  | 'Databases'
  | 'Auth & Security'
  | 'System Design'
  | 'Caching'
  | 'Microservices'
  | 'DevOps'
  | 'Best Practices'
  | 'Data Structures & Algorithms'
  | 'Compare & Choose'
  | 'Interview Scenarios'
  | 'Testing'
  | 'Python'
  | 'Django'
  | 'MongoDB';

export interface Flashcard {
  id: string;
  category: Category;
  question: string;
  answer: string;
  code?: {
    language: string;
    snippet: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'basics' | 'experience';
}

export type ViewMode = 'today' | 'quiz' | 'study' | 'browse';
export type Theme = 'light' | 'dark';

/** A card with no entry in Progress has not been graded yet. */
export type CardStatus = 'known' | 'again';
export type Progress = Record<string, CardStatus>;

export interface Filters {
  level: 'all' | Flashcard['type'];
  difficulty: 'all' | Flashcard['difficulty'];
  status: 'all' | 'new' | CardStatus;
}

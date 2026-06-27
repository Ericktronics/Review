export type Category =
  | 'Node.js'
  | 'TypeScript'
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
  | 'Express.js'
  | 'NestJS'
  | 'Compare & Choose'
  | 'Interview Scenarios'
  | 'React'
  | 'Angular'
  | 'Next.js'
  | 'Testing';

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

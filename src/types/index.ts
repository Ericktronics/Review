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
  | 'Django';

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

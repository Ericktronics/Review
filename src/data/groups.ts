import type { Category } from '../types';

export const GROUPS: { label: string; color: string; categories: Category[] }[] = [
  { label: 'Languages', color: '#2F6FDB', categories: ['JavaScript', 'TypeScript', 'Python'] },
  { label: 'Backend', color: '#14806A', categories: ['Node.js', 'Express.js', 'NestJS', 'Django'] },
  { label: 'Frontend', color: '#C2410C', categories: ['React', 'Angular', 'Next.js'] },
  { label: 'Data', color: '#7C4DBD', categories: ['Databases', 'MongoDB', 'Caching'] },
  { label: 'Architecture', color: '#B4235F', categories: ['System Design', 'Microservices', 'REST & HTTP', 'Auth & Security', 'DevOps'] },
  { label: 'Engineering', color: '#46697F', categories: ['OOP', 'Data Structures & Algorithms', 'Testing', 'Best Practices'] },
  { label: 'Interview', color: '#9A6700', categories: ['Compare & Choose', 'Interview Scenarios'] },
];

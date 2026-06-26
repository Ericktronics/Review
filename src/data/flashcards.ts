import { nodejsCards } from './nodejs';
import { oopCards } from './oop';
import { typescriptCards } from './typescript';
import { restCards } from './rest';
import { databasesCards } from './databases';
import { authCards } from './auth';
import { systemDesignCards } from './systemDesign';
import { cachingCards } from './caching';
import { microservicesCards } from './microservices';
import { devopsCards } from './devops';
import { dataStructuresCards } from './dataStructures';
import { bestPracticesCards } from './bestPractices';
import { expressCards } from './express';
import { nestjsCards } from './nestjs';
import { comparisonsCards } from './comparisons';
import { interviewCards } from './interviews';
import { reactCards } from './react';
import { angularCards } from './angular';
import { nextjsCards } from './nextjs';
import { testingCards } from './testing';
import type { Flashcard } from '../types';

export const flashcards: Flashcard[] = [
  ...nodejsCards,
  ...expressCards,
  ...nestjsCards,
  ...oopCards,
  ...typescriptCards,
  ...restCards,
  ...databasesCards,
  ...authCards,
  ...systemDesignCards,
  ...cachingCards,
  ...microservicesCards,
  ...devopsCards,
  ...dataStructuresCards,
  ...bestPracticesCards,
  ...comparisonsCards,
  ...interviewCards,
  ...reactCards,
  ...angularCards,
  ...nextjsCards,
  ...testingCards,
];

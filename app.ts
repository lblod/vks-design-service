import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/ar-designs.ts';
import { designMeasureConceptsRouter } from './lib/routes/ar-designs/measure-concepts.ts';
import { measureConceptsVariablesRouter } from './lib/routes/measure-concepts/variables.ts';
import { measureConceptsSignalConceptsRouter } from './lib/routes/measure-concepts/signal-concepts.ts';

export const myapp: Application = app;

myapp.use(designsRouter);
myapp.use(designMeasureConceptsRouter);
myapp.use(measureConceptsVariablesRouter);
myapp.use(measureConceptsSignalConceptsRouter);

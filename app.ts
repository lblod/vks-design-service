import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/ar-designs.ts';
import { designMeasuresRouter } from './lib/routes/ar-designs/measures.ts';
import { measureVariablesRouter } from './lib/routes/measures/variables.ts';

export const myapp: Application = app;
myapp.use(designsRouter);
myapp.use(designMeasuresRouter);
myapp.use(measureVariablesRouter);

import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/ar-designs.ts';
import { designMeasuresRouter } from './lib/routes/ar-designs/measures.ts';
import { measureVariablesRouter } from './lib/routes/measures/variables.ts';
import { deltaRouter } from './lib/routes/delta.ts';

export const myapp: Application = app;
myapp.use(designMeasuresRouter);
myapp.use(measureVariablesRouter);
myapp.use(designsRouter);
myapp.use(deltaRouter);

import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/ar-designs';
import { designMeasuresRouter } from './lib/routes/ar-designs/measures';
import { measureVariablesRouter } from './lib/routes/measures/variables';

export const myapp: Application = app;
myapp.use(designsRouter);
myapp.use(designMeasuresRouter);
myapp.use(measureVariablesRouter);

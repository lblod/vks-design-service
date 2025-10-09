import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/designs';
import { designMeasuresRouter } from './lib/routes/design/measures';

export const myapp: Application = app;
myapp.use(designsRouter);
myapp.use(designMeasuresRouter);

import { app } from 'mu';
import type { Application } from 'express';
import { router } from './lib/router.ts';

export const myapp: Application = app;

myapp.use(router);
// myapp.use(designMeasureConceptsRouter);
// myapp.use(measureConceptsVariablesRouter);
// myapp.use(measureConceptsSignalConceptsRouter);

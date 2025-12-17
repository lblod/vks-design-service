import { app, errorHandler } from 'mu';
import type { Application } from 'express';
import { router } from './lib/router.ts';
import { identifyAdministrativeUnit } from './lib/middleware.ts';

export const myapp: Application = app;
myapp.use(identifyAdministrativeUnit);
myapp.use(router);
myapp.use(errorHandler);
// myapp.use(designMeasureConceptsRouter);
// myapp.use(measureConceptsVariablesRouter);
// myapp.use(measureConceptsSignalConceptsRouter);

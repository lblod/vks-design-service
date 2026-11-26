import { app, errorHandler } from 'mu';
import type { Application } from 'express';
import { router } from './lib/router.ts';
import { identifyAdministrativeUnit } from './lib/middleware.ts';

export const myapp: Application = app;

// TODO: Remove before merging - temporary allow-all CORS middleware
myapp.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

myapp.use(identifyAdministrativeUnit);
myapp.use(router);
myapp.use(errorHandler);
// myapp.use(designMeasureConceptsRouter);
// myapp.use(measureConceptsVariablesRouter);
// myapp.use(measureConceptsSignalConceptsRouter);

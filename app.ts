import { app } from 'mu';
import type { Application } from 'express';
import { arDesignsRouter } from './lib/routes/ar-designs.ts';
import { designMeasureConceptsRouter } from './lib/routes/measure-designs/measure-concept.ts';
import { measureConceptsVariablesRouter } from './lib/routes/measure-concepts/variables.ts';
import { measureConceptsSignalConceptsRouter } from './lib/routes/measure-concepts/signal-concepts.ts';
import { arDesignMeasureDesignsRouter } from './lib/routes/ar-designs/measure-designs.ts';

export const myapp: Application = app;

myapp.use(arDesignsRouter);
myapp.use(arDesignMeasureDesignsRouter);
// myapp.use(designMeasureConceptsRouter);
// myapp.use(measureConceptsVariablesRouter);
// myapp.use(measureConceptsSignalConceptsRouter);

import { app } from 'mu';
import type { Application } from 'express';
import { designsRouter } from './lib/routes/designs';
import { designPreviewRouter } from './lib/routes/design/preview';

export const myapp: Application = app;
myapp.use(designsRouter);
myapp.use(designPreviewRouter);

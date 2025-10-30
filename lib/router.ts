import { Router } from 'express';
import { getARDesigns } from './controllers/ar-designs.ts';
import MeasureDesignsController from './controllers/ar-designs/measure-designs.ts';

export const router = Router();
router.get('/ar-designs', getARDesigns);

router.get(
  '/ar-designs/:id/measure-designs',
  MeasureDesignsController.getMeasureDesignsForArDesign,
);

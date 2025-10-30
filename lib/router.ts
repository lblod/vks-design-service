import { Router } from 'express';
import { getArDesigns } from './controllers/ar-designs.ts';
import { getMeasureDesignsForArDesign } from './controllers/ar-designs/measure-designs.ts';

export const router = Router();
router.get('/ar-designs', getArDesigns);

router.get('/ar-designs/:id/measure-designs', getMeasureDesignsForArDesign);

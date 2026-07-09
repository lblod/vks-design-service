import * as z from 'zod';
import { Router } from 'express';
import type { Request } from 'express';
import { jsonApiSchema } from '../../jsonapi-schema.ts';
import MeasureDesignsService from '../../services/measure-designs.ts';
import { variableJsonSchema } from '../../schemas/variable.ts';
import type { AuthenticatedResponse } from '../../types.ts';
import { variableInstanceJsonSchema } from '../../schemas/variable-instance.ts';
import { trafficSignalConceptJsonSchema } from '../../schemas/traffic-signal-concept.ts';
import { roadSignCategoryJsonSchema } from '../../schemas/road-sign-category.ts';
import { trafficSignalJsonSchema } from '../../schemas/traffic-signal.ts';
import { measureConceptJsonSchema } from '../../schemas/measure-concept.ts';
import {
  includesForMeasureDesign,
  measureDesignJsonSchema,
  measureDesignToJson,
} from '../../schemas/measure-design.ts';

export const arDesignMeasureDesignsRouter = Router();

const measureDesignsJsonSchema = jsonApiSchema(
  measureDesignJsonSchema,
  z.array(
    z.union([
      measureConceptJsonSchema,
      trafficSignalJsonSchema,
      trafficSignalConceptJsonSchema,
      roadSignCategoryJsonSchema,
      variableInstanceJsonSchema,
      variableJsonSchema,
    ]),
  ),
);
const MeasureDesignsController = {
  getMeasureDesignsForArDesign: async (
    req: Request<{ id: string }>,
    res: AuthenticatedResponse,
  ) => {
    try {
      const administrativeUnit = res.locals.administrativeUnit;
      const measureDesigns =
        await MeasureDesignsService.getMeasureDesignsForARDesign({
          arDesignId: req.params.id,
          administrativeUnit,
        });
      if (!measureDesigns) {
        res.status(404);
        res.send();
      } else {
        const jsonResponse = measureDesignsJsonSchema.safeEncode({
          data: measureDesigns.map(measureDesignToJson),
          included: measureDesigns.flatMap(includesForMeasureDesign),
        });
        if (jsonResponse.success) {
          res.status(200);
          res.send(jsonResponse.data);
        } else {
          console.log(z.prettifyError(jsonResponse.error));
          res.status(500);
          res.send({ error: 'failed to encode into jsonapi' });
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500);
      res.send({ error: e });
    }
  },
};

export default MeasureDesignsController;

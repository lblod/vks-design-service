import * as z from 'zod';
import { Router } from 'express';
import type { Request } from 'express';
import { jsonApiSchema } from '../../jsonapi-schema.ts';
import MeasureDesignsService from '../../services/measure-designs.ts';
import { variableJsonSchema, variableToJson } from '../../schemas/variable.ts';
import type { AuthenticatedResponse } from '../../types.ts';
import {
  variableInstanceJsonSchema,
  variableInstanceToJson,
} from '../../schemas/variable-instance.ts';
import {
  trafficSignalConceptJsonSchema,
  trafficSignalConceptToJson,
} from '../../schemas/traffic-signal-concept.ts';
import {
  roadSignCategoryJsonSchema,
  roadSignCategoryToJson,
  type RoadsignCategoryJson,
} from '../../schemas/road-sign-category.ts';
import {
  trafficSignalJsonSchema,
  trafficSignalToJson,
} from '../../schemas/traffic-signal.ts';
import {
  measureConceptJsonSchema,
  measureConceptToJson,
} from '../../schemas/measure-concept.ts';
import { measureDesignJsonSchema } from '../../schemas/measure-design.ts';

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
          data: measureDesigns.map((measureDesign) => {
            const {
              id,
              uri,
              measureConcept,
              trafficSignals,
              variableInstances,
              unusedSignalConcepts,
              unIncludedSignalConcepts,
            } = measureDesign;
            return {
              type: 'measure-designs',
              id,
              attributes: { uri },
              relationships: {
                'measure-concept': {
                  data: {
                    type: 'measure-concepts',
                    id: measureConcept.id,
                  },
                },
                'traffic-signals': {
                  data: trafficSignals.map((trafficSignal) => ({
                    type: 'traffic-signals',
                    id: trafficSignal.id,
                  })),
                },
                'unused-signal-concepts': {
                  data: unusedSignalConcepts.map((signalConcept) => ({
                    type: 'traffic-signal-concepts',
                    id: signalConcept.id,
                  })),
                },
                'un-included-signal-concepts': {
                  data: unIncludedSignalConcepts.map((signalConcept) => ({
                    type: 'traffic-signal-concepts',
                    id: signalConcept.id,
                  })),
                },
                'variable-instances': {
                  data: variableInstances.map((variableInstance) => ({
                    type: 'variable-instances',
                    id: variableInstance.id,
                  })),
                },
              },
            };
          }),
          included: measureDesigns.flatMap((measureDesign) => {
            const {
              measureConcept,
              trafficSignals,
              variableInstances,
              unusedSignalConcepts,
            } = measureDesign;
            return [
              measureConceptToJson(measureConcept),
              ...trafficSignals.flatMap((trafficSignal) => {
                const { trafficSignalConcept } = trafficSignal;
                let roadSignCategories: RoadsignCategoryJson[] = [];
                if (trafficSignalConcept.categories.length) {
                  roadSignCategories = trafficSignalConcept.categories.map(
                    roadSignCategoryToJson,
                  );
                }
                return [
                  trafficSignalToJson(trafficSignal),
                  trafficSignalConceptToJson(trafficSignalConcept),
                  ...roadSignCategories,
                ] as const;
              }),
              ...variableInstances.flatMap((variableInstance) => {
                const { variable } = variableInstance;
                const rslt = [
                  variableInstanceToJson(variableInstance),
                  variableToJson(variable),
                ] as const;
                return rslt;
              }),
              ...unusedSignalConcepts.flatMap((trafficSignalConcept) => {
                let roadSignCategories: RoadsignCategoryJson[] = [];
                if (trafficSignalConcept.categories.length) {
                  roadSignCategories = trafficSignalConcept.categories.map(
                    roadSignCategoryToJson,
                  );
                }
                return [
                  trafficSignalConceptToJson(trafficSignalConcept),
                  ...roadSignCategories,
                ];
              }),
            ];
          }),
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

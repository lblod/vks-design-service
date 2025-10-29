import * as z from 'zod';
import { Router } from 'express';
import { jsonApiResourceObject, jsonApiSchema } from '../../jsonapi-schema.ts';
import { getMeasureConcepts } from '../../queries/measure-concepts.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../measure-designs/measure-concept.ts';
import { getSignalConcepts } from '../../queries/signal-concepts.ts';
export const measureConceptsSignalConceptsRouter = Router();

const signalConceptsJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'signal-concepts',
    attributes: z.object({
      uri: z.string(),
      code: z.string(),
      type: z.literal([
        TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
        TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
        TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
      ]),
    }),
    relationships: z.object({}).strict(),
  }),
);
measureConceptsSignalConceptsRouter.get(
  '/measure-concepts/:id/signal-concepts',
  async function (req, res) {
    try {
      const measure = (await getMeasureConcepts({ ids: [req.params.id] }))[0];
      if (!measure) {
        res.status(404);
        res.send();
      } else {
        const signalConcepts = await getSignalConcepts({
          uris: measure.signalConcepts.value,
        });
        const jsonResponse = signalConceptsJsonSchema.safeDecode({
          data: signalConcepts.map((variable) => {
            const { id, uri, code, type } = variable;
            return {
              type: 'signal-concepts',
              id: id.value,
              attributes: {
                uri: uri.value,
                code: code.value,
                type: type.value,
              },
              relationships: {},
            };
          }),
        });
        if (jsonResponse.success) {
          res.status(200);
          res.send(jsonResponse.data);
        } else {
          res.status(500);
          res.send({ error: 'failed to encode into jsonapi' });
        }
        // TODO: finish this: add a test
      }
    } catch (e) {
      res.status(500);
      if (e instanceof Error) {
        res.send({ error: e.message });
      } else {
        res.send({ error: e });
      }
    }
  },
);

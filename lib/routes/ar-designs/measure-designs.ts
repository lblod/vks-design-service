import * as z from 'zod';
import { Router } from 'express';
import { jsonApiResourceObject, jsonApiSchema } from '../../jsonapi-schema.ts';
import { getARDesignById } from '../../queries/ar-designs.ts';
import { getMeasureDesigns } from '../../queries/measure-designs.ts';

export const arDesignMeasureDesignsRouter = Router();

const measureDesignsJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'measure-designs',
    attributes: z
      .object({
        uri: z.string(),
      })
      .strict(),
    relationships: z.object({
      'measure-concept': z.object({
        data: z.object({
          type: z.literal('measure-concepts'),
          id: z.string(),
        }),
      }),
      'traffic-signals': z.object({
        data: z.array(
          z.object({
            type: z.literal('traffic-signals'),
            id: z.string(),
          }),
        ),
      }),
    }),
  }),
  z.array(
    z.union([
      z.object({
        type: z.literal('measure-concepts'),
        id: z.string(),
        attributes: z.object({
          uri: z.string(),
          label: z.string(),
          'template-string': z.string(),
          'raw-template-string': z.string(),
        }),
      }),
      z.object({
        type: z.literal('traffic-signals'),
        id: z.string(),
        attributes: z.object({
          uri: z.string(),
        }),
        relationships: z.object({
          'traffic-signal-concept': z.object({
            data: z.object({
              type: z.literal('traffic-signal-concepts'),
              id: z.string(),
            }),
          }),
        }),
      }),
      z.object({
        type: z.literal('traffic-signal-concepts'),
        id: z.string(),
        attributes: z.object({
          uri: z.string(),
          meaning: z.string(),
          code: z.string(),
        }),
      }),
    ]),
  ),
);

arDesignMeasureDesignsRouter.get(
  '/ar-designs/:id/measure-designs',
  async function (req, res) {
    try {
      const design = await getARDesignById(req.params.id);
      if (!design) {
        res.status(404);
        res.send();
      } else {
        const measureDesigns = await getMeasureDesigns({
          uris: design.measureDesigns,
        });
        const jsonResponse = measureDesignsJsonSchema.safeDecode({
          data: measureDesigns.map((measureDesign) => {
            const { id, uri, measureConcept, trafficSignals } = measureDesign;
            return {
              type: 'measure-designs',
              id: id,
              attributes: {
                uri: uri,
              },
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
              },
            };
          }),
          included: [
            ...measureDesigns.map((measureDesign) => {
              const { measureConcept } = measureDesign;
              return {
                type: 'measure-concepts',
                id: measureConcept.id,
                attributes: {
                  uri: measureConcept.uri,
                  label: measureConcept.label,
                  'template-string': measureConcept.templateString,
                  'raw-template-string': measureConcept.rawTemplateString,
                },
              } as const;
            }),
            ...measureDesigns.flatMap((measureDesign) => {
              const { trafficSignals } = measureDesign;
              return trafficSignals.flatMap((trafficSignal) => [
                {
                  type: 'traffic-signals',
                  id: trafficSignal.id,
                  attributes: {
                    uri: trafficSignal.uri,
                  },
                  relationships: {
                    'traffic-signal-concept': {
                      data: {
                        type: 'traffic-signal-concepts',
                        id: trafficSignal.trafficSignalConcept.id,
                      },
                    },
                  },
                } as const,
                {
                  type: 'traffic-signal-concepts',
                  id: trafficSignal.trafficSignalConcept.id,
                  attributes: {
                    uri: trafficSignal.trafficSignalConcept.uri,
                    code: trafficSignal.trafficSignalConcept.code,
                    meaning: trafficSignal.trafficSignalConcept.meaning,
                  },
                } as const,
              ]);
            }),
          ],
        });
        if (jsonResponse.success) {
          res.status(200);
          res.send(jsonResponse.data);
        } else {
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
);

import * as z from 'zod';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { jsonApiResourceObject, jsonApiSchema } from '../../jsonapi-schema.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../../constants.ts';
import MeasureDesignsService from '../../services/measure-designs.ts';
import { stringToVariableValue } from '../../schemas/variable.ts';

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
      'variable-instances': z.object({
        data: z.array(
          z.object({
            type: z.literal('variable-instances'),
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
          type: z.literal([
            TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
            TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
            TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
          ]),
          meaning: z.string(),
          code: z.string(),
        }),
      }),
      z.object({
        type: z.literal('variable-instances'),
        id: z.string(),
        attributes: z.object({
          uri: z.string(),
          value: stringToVariableValue.optional(),
        }),
        relationships: z.object({
          variable: z.object({
            data: z.object({
              type: z.literal('variables'),
              id: z.string(),
            }),
          }),
        }),
      }),
      z.object({
        type: z.literal('variables'),
        id: z.string(),
        attributes: z.object({
          uri: z.string(),
          label: z.string(),
          type: z.string(),
          defaultValue: stringToVariableValue.optional(),
          codelist: z.string().optional(),
        }),
      }),
    ]),
  ),
);

const MeasureDesignsController = {
  getMeasureDesignsForArDesign: async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    try {
      const measureDesigns =
        await MeasureDesignsService.getMeasureDesignsForARDesign({
          arDesignId: req.params.id,
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
            } = measureDesign;
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
            const { measureConcept, trafficSignals, variableInstances } =
              measureDesign;
            return [
              {
                type: 'measure-concepts',
                id: measureConcept.id,
                attributes: {
                  uri: measureConcept.uri,
                  label: measureConcept.label,
                  'template-string': measureConcept.templateString,
                  'raw-template-string': measureConcept.rawTemplateString,
                },
              },
              ...trafficSignals.flatMap((trafficSignal) => {
                const { trafficSignalConcept } = trafficSignal;
                return [
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
                          id: trafficSignalConcept.id,
                        },
                      },
                    },
                  },
                  {
                    type: 'traffic-signal-concepts',
                    id: trafficSignalConcept.id,
                    attributes: {
                      uri: trafficSignalConcept.uri,
                      type: trafficSignalConcept.type,
                      code: trafficSignalConcept.code,
                      meaning: trafficSignalConcept.meaning,
                    },
                  },
                ] as const;
              }),
              ...variableInstances.flatMap((variableInstance) => {
                const { variable } = variableInstance;
                return [
                  {
                    type: 'variable-instances',
                    id: variableInstance.id,
                    attributes: {
                      uri: variableInstance.uri,
                      value: variableInstance.value,
                    },
                    relationships: {
                      variable: {
                        data: {
                          type: 'variables',
                          id: variable.id,
                        },
                      },
                    },
                  },
                  {
                    type: 'variables',
                    id: variable.id,
                    attributes: {
                      uri: variable.uri,
                      label: variable.label,
                      type: variable.type,
                      source: variable.source,
                      defaultValue: variable.defaultValue,
                      codelist: variable.codelist,
                    },
                  },
                ] as const;
              }),
            ];
          }),
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
};

export default MeasureDesignsController;

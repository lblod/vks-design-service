import * as z from 'zod';
import { Router } from 'express';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../../jsonapi-schema';
import { getDesignById } from '../../queries/get-design-by-id';
import { uuid } from 'mu';
import { getMeasureInfo } from '../../queries/get-measure-info';
import { describe } from 'node:test';

export const TRAFFIC_SIGNAL_CONCEPT_TYPES = {
  TRAFFIC_SIGNAL:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerstekenconcept',
  ROAD_SIGN: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
  TRAFFIC_LIGHT:
    'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
  ROAD_MARKING: 'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
} as const;
export const ZONALITY_OPTIONS = {
  POTENTIALLY_ZONAL:
    'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL: 'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
};

export const designMeasuresRouter = Router();

export const RoadSignCategorySchema = z.object({
  uri: z.string(),
  label: z.string(),
});
export const TrafficSignalConceptSchema = z
  .object({
    uri: z.string(),
    code: z.string(),
    image: z.string(),
    zonality: z.enum(ZONALITY_OPTIONS).optional(),
    position: z.coerce.number().default(-1),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN),
        categories: z.array(RoadSignCategorySchema).default([]),
      }),
      z.object({
        type: z.enum([
          TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
          TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
        ]),
      }),
    ]),
  );

const measureConceptSchema = z.object({
  uri: z.string(),
  label: z.string(),
  preview: z.string(),
  zonality: z.enum(ZONALITY_OPTIONS),
  variableSignage: z.boolean().default(false),
  trafficSignalConcepts: z.array(TrafficSignalConceptSchema).default([]),
});

const BaseVariableSchema = z.object({
  uri: z.string(),
  label: z.string(),
  source: z.string().optional(),
});
const TextVariableSchema = BaseVariableSchema.extend({
  type: z.literal('text'),
  defaultValue: z.string().optional(),
});

const NumberVariableSchema = BaseVariableSchema.extend({
  type: z.literal('number'),
  defaultValue: z.coerce.number().optional(),
});

const DateVariableSchema = BaseVariableSchema.extend({
  type: z.literal('date'),
  defaultValue: z.coerce.date().optional(),
});

const CodelistVariableSchema = BaseVariableSchema.extend({
  type: z.literal('codelist'),
  defaultValue: z.string().optional(),
  codelistUri: z.string(),
});

const LocationVariableSchema = BaseVariableSchema.extend({
  type: z.literal('location'),
  defaultValue: z.string().optional(),
});

export const VariableSchema = z.discriminatedUnion('type', [
  TextVariableSchema,
  NumberVariableSchema,
  DateVariableSchema,
  CodelistVariableSchema,
  LocationVariableSchema,
]);
const previewJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'measures',
    attributes: z
      .object({
        measureConcept: measureConceptSchema,
        templateString: z.string(),
        temporal: z.boolean(),
        variables: z.record(z.string(), VariableSchema),
      })
      .strict(),
    relationships: z.object({
      design: jsonApiRelationship(),
    }),
  }),
);

designMeasuresRouter.get('/design/:id/measures', async function (req, res) {
  try {
    const design = await getDesignById(req.params.id);
    if (!design) {
      res.status(404);
      res.send();
    } else {
      const jsonResponse = previewJsonSchema.safeDecode({
        data: {
          type: 'measures',
          id: uuid(),
          attributes: {
            templateString: '<span>test</span>',
          },
          relationships: {
            design: {
              links: {
                related: `/designs/${req.params.id}`,
              },
            },
          },
        },
      });
      if (jsonResponse.success) {
        res.status(200);
        res.send(jsonResponse);
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
});

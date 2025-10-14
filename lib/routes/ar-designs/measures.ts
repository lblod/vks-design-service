import * as z from 'zod';
import { Router } from 'express';
import {
  jsonApiRelationship,
  jsonApiResourceObject,
  jsonApiSchema,
} from '../../jsonapi-schema';
import { searchDesignDetails } from '../../queries/ar-designs';
import { getMeasureDetailsByUri } from '../../queries/measures';

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
type TextVariable = z.infer<typeof TextVariableSchema>;

const NumberVariableSchema = BaseVariableSchema.extend({
  type: z.literal('number'),
  defaultValue: z.coerce.number().optional(),
});
type NumberVariable = z.infer<typeof NumberVariableSchema>;

const DateVariableSchema = BaseVariableSchema.extend({
  type: z.literal('date'),
  defaultValue: z.coerce.date().optional(),
});
type DateVariable = z.infer<typeof DateVariableSchema>;

const CodelistVariableSchema = BaseVariableSchema.extend({
  type: z.literal('codelist'),
  defaultValue: z.string().optional(),
  codelistUri: z.string(),
});
type CodelistVariable = z.infer<typeof CodelistVariableSchema>;

const LocationVariableSchema = BaseVariableSchema.extend({
  type: z.literal('location'),
  defaultValue: z.string().optional(),
});
type LocationVariable = z.infer<typeof LocationVariableSchema>;

export const VariableSchema = z.discriminatedUnion('type', [
  TextVariableSchema,
  NumberVariableSchema,
  DateVariableSchema,
  CodelistVariableSchema,
  LocationVariableSchema,
]);
const measuresJsonSchema = jsonApiSchema(
  jsonApiResourceObject({
    type: 'measures',
    attributes: z
      .object({
        // measureConcept: measureConceptSchema,
        rawTemplateString: z.string(),
        templateString: z.string(),
        // temporal: z.boolean(),
      })
      .strict(),
    relationships: z.object({
      design: jsonApiRelationship(),
      variables: jsonApiRelationship(),
    }),
  }),
);
type Variable = z.infer<typeof VariableSchema>;

function collectVariables(
  variableResponse: Awaited<
    ReturnType<typeof getMultipleMeasureConceptsWithVariables>
  >[number],
): Record<string, Variable> {
  const result: Record<string, Variable> = {};

  for (const item of variableResponse.variables) {
    switch (item.type.value) {
      case 'text':
        result[item.title.value] = {
          label: item.title.value,
          type: 'text',
          uri: item.uri.value,
        } satisfies TextVariable;

        break;
      case 'number':
        result[item.title.value] = {
          label: item.title.value,
          type: 'number',
          uri: item.uri.value,
        } satisfies NumberVariable;
        break;
      case 'date':
        result[item.title.value] = {
          label: item.title.value,
          type: 'date',
          uri: item.uri.value,
        } satisfies DateVariable;
        break;
      case 'codelist':
        if (!item.codelist?.value) {
          throw new Error('Codelist variable without attached codelist');
        }
        result[item.title.value] = {
          label: item.title.value,
          type: 'codelist',
          uri: item.uri.value,
          codelistUri: item.codelist.value,
        } satisfies CodelistVariable;
        break;
      case 'location':
        result[item.title.value] = {
          label: item.title.value,
          type: 'location',
          uri: item.uri.value,
        } satisfies LocationVariable;
        break;

      case 'instruction':
        // intentionally ignoring instructions
        break;
      default:
        throw new Error('unrecognized variable type');
    }
  }
  return result;
}
designMeasuresRouter.get('/ar-designs/:id/measures', async function (req, res) {
  try {
    const design = (await searchDesignDetails([req.params.id]))[0];
    if (!design) {
      res.status(404);
      res.send();
    } else {
      console.log(design.measures.value);
      const measureConcepts = await getMeasureDetailsByUri(design.measures.value);
      const jsonResponse = measuresJsonSchema.safeDecode({
        data: measureConcepts.map((measureConcept) => {
          const { id, templateString, rawTemplateString } = measureConcept;
          return {
            type: 'measures',
            id: id.value,
            attributes: {
              templateString: templateString.value,
              rawTemplateString: rawTemplateString.value,
            },
            relationships: {
              design: {
                links: {
                  related: `/ar-designs/${req.params.id}`,
                },
              },
              variables: {
                links: {
                  related: `/measures/${id.value}/variables`,
                },
              },
            },
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
    }
  } catch (e) {
    console.log(e);
    res.status(500);
    res.send({ error: e });
  }
});

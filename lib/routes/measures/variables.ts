import * as z from 'zod';
import { Router } from 'express';
import { searchMeasureDetailsByIds } from '../../queries/measures.ts';
import { getVariableDetailsByUris } from '../../queries/variables.ts';
export const measureVariablesRouter = Router();

measureVariablesRouter.get(
  '/measures/:id/variables',
  async function (req, res) {
    try {
      const measure = (await searchMeasureDetailsByIds([req.params.id]))[0];
      if (!measure) {
        res.status(404);
        res.send();
      } else {
        const variables = await getVariableDetailsByUris(
          measure.variables.value,
        );
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

// TODO: the below is a port of the variable schema as used by the roadsign plugin (and slightly adjusted)
// It is currently not used because this route is unfinished, but I left the code in to help further work.
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

function collectVariables(
  variableResponse: Awaited<
    ReturnType<typeof getVariableDetailsByUris>
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

type Variable = z.infer<typeof VariableSchema>;

import z from 'zod';
import { isoStringToDate, stringToNumber } from '../utils/conversions.ts';
import { getMowEndpoint } from '../environment.ts';
import { jsonApiResourceObject } from '../jsonapi-schema.ts';

export const stringToVariableValue = z.union([
  isoStringToDate,
  stringToNumber,
  z.string(),
]);
export const stvCodec = z.codec(
  z.string(),
  z.union([z.date(), z.number(), z.string()]),
  {
    decode: (str) => stringToVariableValue.decode(str),
    encode: (val) => {
      return stringToVariableValue.encode(val);
    },
  },
);
// Represents template variables, not signal variables
export const variableSchema = z.strictObject({
  uri: z.string(),
  id: z.string(),
  label: z.string(),
  type: z.string(),
  source: z.string().default(getMowEndpoint()),
  codelist: z.string().optional(),
  correspondingSignVar: z.string().optional(),
  defaultValue: stringToVariableValue.optional(),
});

export type Variable = z.infer<typeof variableSchema>;
export const variableJsonSchema = jsonApiResourceObject({
  type: 'variables',
  attributes: variableSchema.omit({ id: true }),
  relationships: z.undefined().optional(),
});

export function variableToJson(
  variable: Variable,
): z.infer<typeof variableJsonSchema> {
  return variableJsonSchema.decode({
    type: 'variables',
    id: variable.id,
    attributes: {
      label: variable.label,
      type: variable.type,
      uri: variable.uri,
      'corresponding-sign-var': variable.correspondingSignVar,
      'default-value': variable.defaultValue
        ? stvCodec.encode(variable.defaultValue)
        : undefined,
      codelist: variable.codelist,
      source: variable.source,
    },
  });
}

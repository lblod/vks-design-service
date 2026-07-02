import z from 'zod';
import { stringToVariableValue, stvCodec, variableSchema } from './variable.ts';
import {
  jsonApiRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema.ts';

export const variableInstanceSchema = z.strictObject({
  uri: z.string(), // generated on-the-fly
  id: z.string(), // generated on-the-fly
  value: stringToVariableValue.optional(),
  valueLabel: z.string().optional(),
  variable: variableSchema,
});

export type VariableInstance = z.infer<typeof variableInstanceSchema>;
export const variableInstanceJsonSchema = jsonApiResourceObject({
  type: 'variable-instances',
  attributes: variableInstanceSchema.omit({ variable: true, id: true }),
  relationships: z.object({ variable: jsonApiRelationshipData('variables') }),
});

export function variableInstanceToJson(
  variableInstance: VariableInstance,
): z.infer<typeof variableInstanceJsonSchema> {
  const { variable } = variableInstance;
  const rslt = variableInstanceJsonSchema.decode({
    type: 'variable-instances',
    id: variableInstance.id,
    attributes: {
      uri: variableInstance.uri,
      value: variableInstance.value
        ? stvCodec.encode(variableInstance.value)
        : undefined,
      'value-label': variableInstance.valueLabel,
    },
    relationships: {
      variable: {
        data: {
          type: 'variables',
          id: variable.id,
        },
      },
    },
  });

  return rslt;
}

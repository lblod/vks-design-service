import z from 'zod';
import {
  stringToVariableValue,
  stvCodec,
  VARIABLE_TYPE,
  variableSchema,
} from './variable.ts';
import {
  jsonApiRelationshipData,
  jsonApiResourceObject,
} from '../jsonapi-schema.ts';

export const VARIABLE_INSTANCE_TYPE = 'variable-instances' as const;

export const variableInstanceSchema = z.strictObject({
  uri: z.string(), // generated on-the-fly
  id: z.string(), // generated on-the-fly
  value: stringToVariableValue.optional(),
  valueLabel: z.string().optional(),
  variable: variableSchema,
});

export type VariableInstance = z.infer<typeof variableInstanceSchema>;
export const variableInstanceJsonSchema = jsonApiResourceObject({
  type: VARIABLE_INSTANCE_TYPE,
  attributes: variableInstanceSchema.omit({ variable: true }),
  relationships: z.object({ variable: jsonApiRelationshipData('variables') }),
});

export function variableInstanceToJson(
  variableInstance: VariableInstance,
): z.infer<typeof variableInstanceJsonSchema> {
  const { variable } = variableInstance;
  const rslt = variableInstanceJsonSchema.decode({
    type: VARIABLE_INSTANCE_TYPE,
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
          type: VARIABLE_TYPE,
          id: variable.id,
        },
      },
    },
  });

  return rslt;
}

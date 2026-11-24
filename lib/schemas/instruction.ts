import { z } from 'zod';
import { jsonApiResourceObject } from '../jsonapi-schema';

export const INSTRUCTION_TYPE = 'instruction' as const;
export const instructionSchema = z.object({
  uri: z.string(),
  value: z.string(),
  preview: z.string(),
  id: z.string(),
});

export type Instruction = z.infer<typeof instructionSchema>;
export const instructionJsonSchema = jsonApiResourceObject({
  type: INSTRUCTION_TYPE,
  attributes: instructionSchema,
  relationships: z.undefined().optional(),
});

export type InstructionJson = z.infer<typeof instructionJsonSchema>;

export function instructionToJson(instruction: Instruction) {
  return instructionJsonSchema.decode({
    type: INSTRUCTION_TYPE,
    id: instruction.id,
    attributes: {
      uri: instruction.uri,
      value: instruction.value,
      preview: instruction.preview,
    },
  });
}

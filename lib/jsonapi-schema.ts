import * as z from 'zod';
export interface JsonApiResourceConfig<T, A, R> {
  type: T;
  attributes: A;
  relationships: R;
}
/**
 * Defines the shape of the "data" of a jsonAPI document
 */
export function jsonApiResourceObject<
  T extends string,
  A extends z.ZodType,
  R extends z.ZodType,
>({ type, attributes, relationships }: JsonApiResourceConfig<T, A, R>) {
  return z
    .object({
      id: z.string(),
      type: z.literal(type),
      attributes,
      relationships,
      links: z.object().optional(),
    })
    .strict();
}
/**
 * Defines the scaffolding of a jsonAPI document
 */
export function jsonApiSchema<R extends z.ZodType, I extends z.ZodType>(
  resourceSchema: R,
  includedSchema: I,
) {
  return z
    .object({
      data: z.union([z.array(resourceSchema), resourceSchema]),
      included: includedSchema,
      meta: z
        .object({
          count: z.int().optional(),
        })
        .optional(),
      links: z
        .object({
          first: z.string().optional(),
          prev: z.string().optional(),
          next: z.string().optional(),
          last: z.string().optional(),
        })
        .optional(),
    })
    .strict();
}
/**
 * Defines the shape of a jsonAPI relationship
 */
export function jsonApiRelationship() {
  return z
    .object({
      links: z.object({ related: z.string() }).strict(),
      data: z.array(z.object({ type: z.string(), id: z.string() })).optional(),
    })
    .strict();
}

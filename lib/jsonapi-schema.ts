import * as z from 'zod';
export interface JsonApiResourceConfig<T, A, R> {
  type: T;
  attributes: A;
  relationships: R;
}
export function jsonApiResourceObject<
  T extends string,
  A extends z.ZodType,
  R extends z.ZodType,
>({ type, attributes, relationships }: JsonApiResourceConfig<T, A, R>) {
  return z
    .object({
      id: z.string(),
      type: z.literal(type),
      attributes: attributes,
      relationships: relationships,
      links: z.object().optional(),
      meta: z.object().optional(),
    })
    .strict();
}
export function jsonApiSchema<R extends z.ZodType>(resourceSchema: R) {
  return z
    .object({
      data: z.union([z.array(resourceSchema), resourceSchema]),
      meta: z.object().optional(),
    })
    .strict();
}
export function jsonApiRelationship() {
  return z
    .object({
      links: z.object({ related: z.string() }).strict(),
    })
    .strict();
}

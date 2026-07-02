import { kebabKeys, type KebabCase, type KebabKeys } from 'string-ts';
import * as z from 'zod';
export function jsonApiRelationshipData<T extends KebabCase<string>>(type: T) {
  return z.object({
    data: z.object({ type: z.literal(type), id: z.string() }),
  });
}
export function jsonApiManyRelationshipData<T extends KebabCase<string>>(
  type: T,
) {
  return z.object({
    data: z.array(z.object({ type: z.literal(type), id: z.string() })),
  });
}
export interface JsonApiResourceConfig<T, A, R> {
  type: T;
  attributes: A;
  relationships: R;
}
/**
 * Defines the shape of the "data" of a jsonAPI document
 */
export function jsonApiResourceObject<
  T extends KebabCase<string>,
  A extends z.ZodObject<{ id: z.ZodString } & { [key: string]: z.ZodType }>,
  R extends z.ZodObject | z.ZodOptional<z.ZodUndefined>,
>({ type, attributes, relationships }: JsonApiResourceConfig<T, A, R>) {
  const rels = (
    relationships.type === 'object'
      ? z.object(kebabKeys(relationships.shape))
      : relationships
  ) as R extends z.ZodObject ? z.ZodObject<KebabKeys<R['shape']>> : R;
  return z
    .object({
      id: z.string(),
      type: z.literal(type),
      attributes: z
        .object(kebabKeys(attributes.shape))
        .omit({ id: true }) as unknown as z.ZodObject<
        KebabKeys<Omit<A['shape'], 'id'>>
      >,
      relationships: rels,
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
          prev: z.string().optional().nullable(),
          next: z.string().optional().nullable(),
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

import * as z from 'zod';
export function queryResultSchema<S extends z.ZodNonOptional<z.ZodArray>>(
  bindingSchema: S,
) {
  return z
    .object({
      head: z.object({
        link: z.array(z.object({})),
        vars: z.array(z.string()),
      }),
      results: z.object({
        bindings: bindingSchema.nonoptional(),
        distinct: z.boolean(),
        ordered: z.boolean(),
      }),
    })
    .strict();
}

import z from 'zod';

export const sortingOptionSchema = z.object({
  field: z.string(),
  direction: z.literal(['', '-']),
  options: z.array(z.literal(['no-case'])).optional(),
});

export type SortOpts = z.infer<typeof sortingOptionSchema>;

function fieldSpecifier(sort: SortOpts) {
  return sort.options?.includes('no-case')
    ? `LCASE(?${sort.field})`
    : `?${sort.field}`;
}
export function sortClause(sort?: SortOpts): string {
  if (!sort) return '';
  return /* sparql */ `ORDER BY ${sort.direction === '-' ? 'ASC' : 'DESC'}(${fieldSpecifier(sort)})`;
}

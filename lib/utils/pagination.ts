import z from 'zod';
import { DEFAULT_PAGINATION_SIZE } from '../environment';

export const PaginationOptionsSchema = z.object({
  number: z.number().default(0),
  size: z.number().default(DEFAULT_PAGINATION_SIZE),
});

export type PageOpts = z.infer<typeof PaginationOptionsSchema>;

export function paginationClause(page?: PageOpts): string {
  if (!page) return '';
  return /* sparql */ `LIMIT ${page.size} OFFSET ${page.number * page.size}`;
}

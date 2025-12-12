import z from 'zod';
import { DEFAULT_PAGINATION_SIZE } from '../environment.ts';
import type { QueryParams } from './query-params.ts';

export const paginationOptionsSchema = z.object({
  number: z.number().default(0),
  size: z.number().default(DEFAULT_PAGINATION_SIZE),
});

export type PageOpts = z.infer<typeof paginationOptionsSchema>;

export function paginationClause(pageParams?: QueryParams['page']): string {
  if (!pageParams) return '';
  const page = paginationOptionsSchema.parse(pageParams);
  return /* sparql */ `LIMIT ${page.size} OFFSET ${page.number * page.size}`;
}

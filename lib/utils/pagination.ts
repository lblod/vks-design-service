import z from 'zod';
import { DEFAULT_PAGINATION_SIZE } from '../environment';

export const PaginationOptionsSchema = z.object({
  number: z.number().default(0),
  size: z.number().default(DEFAULT_PAGINATION_SIZE),
});

export type PageOpts = z.infer<typeof PaginationOptionsSchema>;

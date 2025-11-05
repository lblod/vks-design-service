import * as z from 'zod';
import { isoStringToDate } from '../utils/conversions.ts';

export function typedLiteralResult<V extends z.ZodType, D extends z.ZodType>(
  valueSchema: V,
  dataTypeSchema?: D,
) {
  return z.strictObject({
    type: z.literal('typed-literal'),
    value: valueSchema,
    datatype: dataTypeSchema ?? z.string(),
  });
}

export function literalResult<V extends z.ZodType>(valueSchema: V) {
  return z.strictObject({
    type: z.literal('literal'),
    value: valueSchema,
  });
}
export const uriValue = z.strictObject({
  type: z.literal('uri'),
  value: z.string(),
});

export const dateTimeValue = typedLiteralResult(
  isoStringToDate,
  z.literal('http://www.w3.org/2001/XMLSchema#dateTime'),
);

export const stringValue = typedLiteralResult(
  z.string(),
  z.literal('http://www.w3.org/2001/XMLSchema#string'),
);

export const uriList = literalResult(
  z.string().transform((strList) => strList.split(',')),
);
export const plainString = literalResult(z.string());

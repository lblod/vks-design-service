import { sparqlEscapeString, sparqlEscapeUri } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema.ts';
import { plainString } from '../database-validation/sparql-value-schemas.ts';
import { InvariantError } from '../errors.ts';
import { wrappedQuery, type WrappedQueryOpts } from './wrapped-query.ts';
/**
 * Execute a query with validation of the resulting response
 * @param schema The zod schema which describes the binding array. Must be an array-schema.
 * @param queryStr The query which will be sent
 * @param opts
 */
export async function schemaQuery<S extends z.ZodArray>(
  schema: S,
  queryStr: string,
  opts?: WrappedQueryOpts,
) {
  const rawResult = await wrappedQuery(queryStr, opts);
  const result = queryResultSchema(schema.nonoptional()).parse(rawResult);
  return result.results.bindings;
}

/**
 * Execute a query which asks for a list of ids
 * @param queryStr The query to send. No validation of the query string takes place
 */
export async function listQuery(queryStr: string, opts?: WrappedQueryOpts) {
  const results = await schemaQuery(
    z.array(z.object({ id: plainString }).strict()),
    queryStr,
    opts,
  );
  return results.map((b) => b.id.value);
}

/**
 * Generate a VALUES ?id {...} string for convenient usage in queries
 * @param ids A list of id values which will be escaped as strings
 * @param [variableName='?id'] the variable name of the VALUES clause
 */
export function idValuesClause(ids: string[], variableName = '?id') {
  if (ids[0]?.startsWith('"')) {
    throw new InvariantError('ids should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${ids.map((id) => sparqlEscapeString(id)).join(' ')} }`;
}

/**
 * Generate a VALUES ?uri {...} string for convenient usage in queries
 * @param uris A list of uri values which will be escaped as uris
 * @param [variableName='?uri'] the variable name of the VALUES clause
 */
export function uriValuesClause(uris: string[], variableName = '?uri') {
  if (uris[0]?.startsWith('<')) {
    throw new InvariantError('uris should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }`;
}

/**
 * Convenience function which can flip between explicitly checking the result array length or not
 */
export function maybeCheckedArray<S extends z.ZodArray>(
  arraySchema: S,
  expectedLength: number,
  opts?: { allowEmpty?: boolean },
) {
  if (opts?.allowEmpty) {
    return arraySchema;
  } else {
    return arraySchema.length(expectedLength);
  }
}
export interface GetQueryOpts {
  allowEmpty?: boolean;
}

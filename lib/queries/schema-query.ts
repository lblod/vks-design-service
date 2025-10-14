import { query, sparqlEscapeUri } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import { uriValue } from '../database-validation/sparql-value-schemas';
import { InvariantError } from '../errors';
export async function schemaQuery<S extends z.ZodArray>(
  schema: S,
  queryStr: string,
) {
  const rawResult = await query(queryStr);
  const result = queryResultSchema(schema.nonoptional()).parse(rawResult);
  return result.results.bindings;
}

export async function listQuery(queryStr: string) {
  const results = await schemaQuery(
    z.array(z.object({ uri: uriValue }).strict()),
    queryStr,
  );
  return results.map((b) => b.uri.value);
}

export function uriValuesClause(uris: string[], variableName = '?uri') {
  if (uris[0]?.startsWith('<')) {
    throw new InvariantError('uris should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }`;
}

import { query, sparqlEscapeString, sparqlEscapeUri } from 'mu';
import * as z from 'zod';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import { plainString } from '../database-validation/sparql-value-schemas';
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
    z.array(z.object({ id: plainString }).strict()),
    queryStr,
  );
  return results.map((b) => b.id.value);
}

export function idValuesClause(ids: string[], variableName = '?id') {
  if (ids[0]?.startsWith('"')) {
    throw new InvariantError('ids should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${ids.map((id) => sparqlEscapeString(id)).join(' ')} }`;
}
export function uriValuesClause(uris: string[], variableName = '?uri') {
  if (uris[0]?.startsWith('<')) {
    throw new InvariantError('uris should not be sparqlescaped');
  }
  return `VALUES ${variableName} { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }`;
}

import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  plainString,
  uriValue,
} from '../database-validation/sparql-value-schemas';
export async function getMultipleVariableInfos(uris: string[]) {
  if (uris.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX variable: <http://lblod.data.gift/vocabularies/variables/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT ?id ?title ?type  WHERE {
    VALUES ?uri { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }
    ?uri a variable:Variable;
	dct:type ?type
	dct:title ?title.
  } 
  `;

  const rawResponse = await query(queryStr);
  const response = queryResultSchema(
    z
      .array(
        z.object({
          id: plainString,
          title: plainString,
	  type: ,
        }),
      )
      .length(uris.length),
  ).parse(rawResponse);
  return response.results.bindings ?? null;
}

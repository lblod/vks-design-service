import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import {
  literalResult,
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
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>

  SELECT ?uri ?title ?type ?codelist WHERE {
    VALUES ?uri { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }
     { ?uri a variable:Variable;
	  dct:type ?type;
	  dct:title ?title. 
      } UNION {
	?uri a variable:Variable;
	   mobiliteit:codelijst ?codelist.
      }


    
  } 
  `;

  const rawResponse = await query(queryStr);
  const response = queryResultSchema(
    z
      .array(
        z.object({
          title: plainString,
          uri: uriValue,
          type: literalResult(
            z.literal([
              'text',
              'number',
              'date',
              'codelist',
              'location',
              'instruction',
            ]),
          ),
          codelist: uriValue.optional(),
        }),
      )
      .length(uris.length),
  ).parse(rawResponse);
  return response.results.bindings ?? null;
}

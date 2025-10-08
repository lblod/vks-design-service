import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import { plainString } from '../database-validation/sparql-value-schemas';

export async function getMeasureInfo(uri: string) {
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT ?html WHERE {
    ${sparqlEscapeUri(uri)} a mobiliteit:Mobiliteitmaatregelconcept;
	mrConcept:template ?template.
      ?template ext:preview ?html.
  }
  `;
  const rawResponse = await query(queryStr);
  const response = queryResultSchema(
    z
      .array(
        z.object({
          html: plainString,
        }),
      )
      .max(1),
  ).parse(rawResponse);
  return response.results.bindings[0] ?? null;
}

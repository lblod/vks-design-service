import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import { plainString } from '../database-validation/sparql-value-schemas';

export async function getMeasureConceptInfo(uri: string) {
  const measures = await getMultipleMeasureConceptInfos([uri]);
  return measures[0];
}
export async function getMultipleMeasureConceptInfos(uris: string[]) {
  if (uris.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  SELECT ?html ?id WHERE {
    VALUES ?uri { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }
    ?uri a mobiliteit:Mobiliteitmaatregelconcept;
        mu:uuid ?id;
	mrConcept:template ?template.
      ?template ext:preview ?html.
  }
  `;

  const rawResponse = await query(queryStr);
  const response = queryResultSchema(
    z
      .array(z.object({ html: plainString, id: plainString }))
      .length(uris.length),
  ).parse(rawResponse);
  return response.results.bindings ?? null;
}

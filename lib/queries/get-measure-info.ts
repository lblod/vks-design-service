import * as z from 'zod';
import { query, sparqlEscapeUri } from 'mu';
import { queryResultSchema } from '../database-validation/sparql-result-schema';
import { plainString } from '../database-validation/sparql-value-schemas';

export async function getMeasureInfo(uri: string) {
  const measures = await getMultipleMeasureInfos([uri]);
  return measures[0];
}
export async function getMultipleMeasureInfos(uris: string[]) {
  if (uris.length === 0) {
    return [];
  }
  console.log('fetching uris', uris);
  const queryStr = `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT ?html WHERE {
    VALUES ?uri { ${uris.map((uri) => sparqlEscapeUri(uri)).join(' ')} }
    ?uri a mobiliteit:Mobiliteitmaatregelconcept;
	mrConcept:template ?template.
      ?template ext:preview ?html.
  }
  `;

  const rawResponse = await query(queryStr);
  console.log('response', JSON.stringify(rawResponse, undefined, 2));
  const response = queryResultSchema(
    z.array(z.object({ html: plainString })).length(uris.length),
  ).parse(rawResponse);
  return response.results.bindings ?? null;
}

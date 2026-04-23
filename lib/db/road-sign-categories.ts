import { RoadSignCategorySchema } from '../schemas/road-sign-category.ts';
import { query, sparqlEscapeUri } from 'mu';
import { objectify } from '../utils/sparql.ts';
import { getMowEndpoint } from '../environment.ts';

export async function queryRoadSignCategories(roadSignConceptUri: string) {
  const queryContent = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?uri
      ?label
    WHERE {
      ?uri a mobiliteit:Verkeersbordcategorie;
          skos:prefLabel ?label.

      ${roadSignConceptUri ? `${sparqlEscapeUri(roadSignConceptUri)} dct:type ?uri` : ''}
    }
  `;
  const queryResult = await query(queryContent, {
    endpoint: getMowEndpoint(),
  });
  const bindings = queryResult.results.bindings;
  return RoadSignCategorySchema.array().parse(bindings.map(objectify));
}

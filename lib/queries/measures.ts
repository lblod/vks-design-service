import * as z from 'zod';
import {
  plainString,
  uriList,
} from '../database-validation/sparql-value-schemas';
import {
  idValuesClause,
  maybeCheckedArray,
  schemaQuery,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query';
import { getMowEndpoint } from '../environment';

const measureConceptSparqlSchema = z.object({
  id: plainString,
  templateString: plainString,
  rawTemplateString: plainString,
  variables: uriList,
});
async function getMeasureDetailsByIdsOrUris(
  uriOrId: 'uri' | 'id',
  items: string[],
  opts?: GetQueryOpts,
) {
  if (items.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  SELECT ?id ?rawTemplateString ?templateString (GROUP_CONCAT(str(?variable); SEPARATOR = ',') as ?variables) WHERE {
    ${uriOrId === 'uri' ? uriValuesClause(items) : idValuesClause(items)}
    ?uri a mobiliteit:Mobiliteitmaatregelconcept;
        mu:uuid ?id;
	mrConcept:template ?template.
      ?template a mobiliteit:Template;
	mobiliteit:variabele ?variable;
	rdf:value ?rawTemplateString;
	ext:preview ?templateString.
  } GROUP BY ?id ?rawTemplateString ?templateString
  `;

  return schemaQuery(
    maybeCheckedArray(z.array(measureConceptSparqlSchema), items.length, opts),
    queryStr,
    { endpoint: getMowEndpoint() },
  );
}
export async function getMeasureDetailsByUris(
  uris: string[],
  opts?: GetQueryOpts,
) {
  return getMeasureDetailsByIdsOrUris('uri', uris, opts);
}
export async function searchMeasureDetailsByUris(uris: string[]) {
  return getMeasureDetailsByUris(uris, { allowEmpty: true });
}
export async function getMeasureDetailsByIds(
  ids: string[],
  opts?: GetQueryOpts,
) {
  return getMeasureDetailsByIdsOrUris('id', ids, opts);
}
export async function searchMeasureDetailsByIds(ids: string[]) {
  return getMeasureDetailsByUris(ids, { allowEmpty: true });
}

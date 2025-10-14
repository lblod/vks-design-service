import * as z from 'zod';
import {
  plainString,
  uriList,
} from '../database-validation/sparql-value-schemas';
import { schemaQuery, uriValuesClause } from './schema-query';
import { getMowEndpoint } from '../environment';

const measureConceptSparqlSchema = z.object({
  id: plainString,
  templateString: plainString,
  rawTemplateString: plainString,
  variables: uriList,
});
export async function getMeasureDetails(uris: string[]) {
  if (uris.length === 0) {
    return [];
  }
  const queryStr = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  SELECT ?id ?rawTemplateString ?templateString (GROUP_CONCAT(str(?variable); SEPARATOR = ',') as ?variables) WHERE {
    ${uriValuesClause(uris)}
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
    z.array(measureConceptSparqlSchema).length(uris.length),
    queryStr,
    { endpoint: getMowEndpoint() },
  );
}

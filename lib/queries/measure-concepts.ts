import * as z from 'zod';
import {
  plainString,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';
import {
  idValuesClause,
  schemaQuery,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';

const measureConceptSparqlSchema = z.object({
  id: plainString,
  uri: uriValue,
  label: plainString,
  templateString: plainString,
  rawTemplateString: plainString,
  variables: uriList,
});

export async function getMeasureConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;
  const queryStr = /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX mrConcept: <https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregelconcept.>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT 
      ?id 
      ?uri
      ?label
      ?rawTemplateString 
      ?templateString 
      (GROUP_CONCAT(str(?variable); SEPARATOR = ',') as ?variables) 
    WHERE {
      ?uri 
        a mobiliteit:Mobiliteitmaatregelconcept;
        mu:uuid ?id;
        skos:prefLabel ?label;
        mrConcept:template ?template.
      ?template 
        a mobiliteit:Template;
        mobiliteit:variabele ?variable;
        rdf:value ?rawTemplateString;
        ext:preview ?templateString.
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?id ?uri ?label ?rawTemplateString ?templateString
  `;

  return schemaQuery(z.array(measureConceptSparqlSchema), queryStr, {
    endpoint: getMowEndpoint(),
  });
}

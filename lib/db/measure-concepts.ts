import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';
import { measureConceptSchema } from '../schemas/measure-concept.ts';
import { objectify } from '../utils/sparql.ts';
import { query } from 'mu';

export async function getMeasureConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;

  const result = await query(
    /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT 
      ?id 
      ?uri
      ?label
      ?rawTemplateString 
      ?templateString
      (GROUP_CONCAT(DISTINCT str(?variable); SEPARATOR=",") as ?variables) 
      (GROUP_CONCAT(DISTINCT str(?signalConcept); SEPARATOR=",") as ?signalConcepts)
    WHERE {
      GRAPH <http://mu.semte.ch/graphs/awv/ldes> {
        ?uri 
          a mobiliteit:Mobiliteitmaatregelconcept;
          mu:uuid ?id;
          skos:prefLabel ?label;
          mobiliteit:heeftVerkeerstekenLijstItem/schema:item ?signalConcept;
          mobiliteit:Mobiliteitsmaatregelconcept.template ?template.
        ?template 
          a mobiliteit:Template;
          rdf:value ?rawTemplateString;
          ext:preview ?templateString.

        {
          ?template mobiliteit:variabele ?variable.
        }
        UNION {
          ?template mobiliteit:variabele/mobiliteit:template/mobiliteit:variabele ?variable.
        }
        FILTER NOT EXISTS {
          ?variable dct:type "instruction".
        }

        ${ids ? idValuesClause(ids) : ''}
        ${uris ? uriValuesClause(uris) : ''}
      }
    } 
    GROUP BY ?id ?uri ?label ?rawTemplateString ?templateString
  `,
    { endpoint: getMowEndpoint() },
  );

  const bindings = result.results.bindings;
  return z.array(measureConceptSchema).parse(
    bindings.map(objectify).map((obj) => ({
      ...obj,
      variables: obj['variables']?.split(','),
      signalConcepts: obj['signalConcepts']?.split(','),
    })),
  );
}

export async function getMeasureConceptByUri(uri: string) {
  return getMeasureConcepts({ uris: [uri] }).then((concepts) => concepts[0]);
}

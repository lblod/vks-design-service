import * as z from 'zod';
import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';
import { wrappedQuery } from './wrapped-query.ts';
import { measureConceptSchema } from '../schemas/measure-concept.ts';
import { objectify } from '../utils/sparql.ts';

export async function getMeasureConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;

  const result = await wrappedQuery(
    /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>

    SELECT 
      ?id 
      ?uri
      ?label
      ?rawTemplateString 
      ?templateString 
    WHERE {
      ?uri 
        a mobiliteit:Mobiliteitmaatregelconcept;
        mu:uuid ?id;
        skos:prefLabel ?label;
        mobiliteit:heeftVerkeerstekenLijstItem/schema:item ?signalConcept;
        mobiliteit:Mobiliteitsmaatregelconcept.template ?template.
      ?template 
        a mobiliteit:Template;
        mobiliteit:variabele ?variable;
        rdf:value ?rawTemplateString;
        ext:preview ?templateString.

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?id ?uri ?label ?rawTemplateString ?templateString
  `,
    { endpoint: getMowEndpoint() },
  );

  const bindings = result.results.bindings;
  return z.array(measureConceptSchema).parse(bindings.map(objectify));
}

export async function getMeasureConceptByUri(uri: string) {
  return getMeasureConcepts({ uris: [uri] }).then((concepts) => concepts[0]);
}

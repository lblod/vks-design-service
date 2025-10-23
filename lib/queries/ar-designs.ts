import * as z from 'zod';
import {
  dateTimeValue,
  plainString,
  stringValue,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';
import {
  schemaQuery,
  idValuesClause,
  type GetQueryOpts,
  uriValuesClause,
} from './schema-query.ts';

const arDesignSparqlSchema = z
  .object({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
    id: plainString,
    measures: uriList,
  })
  .strict();

export async function getDesigns(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;
  return schemaQuery(
    z.array(arDesignSparqlSchema),
    /*sparql*/ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
    PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
    PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT 
      ?uri 
      ?name 
      ?date 
      ?id 
      (GROUP_CONCAT(str(?measure); SEPARATOR=",") as ?measures) 
    WHERE {
      ?uri 
        a mobiliteit:AanvullendReglementOntwerp;
        mu:uuid ?id;
        arOntwerp:naam ?name;
        dct:issued ?date.

      ?hasMeasureDesignRel 
        relatie:bron ?uri;
        a onderdeel:BevatMaatregelOntwerp;
        relatie:doel ?measureDesign.

      ?basedOnRel 
        relatie:bron ?measureDesign;
        a onderdeel:IsGebaseerdOp;
        relatie:doel ?measure.
      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    } 
    GROUP BY ?uri ?name ?date ?id`,
  );
}

export async function getDesignById(id: string) {
  return getDesigns({ ids: [id] }).then((designs) => designs[0]);
}

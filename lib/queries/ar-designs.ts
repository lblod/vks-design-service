import * as z from 'zod';
import {
  dateTimeValue,
  plainString,
  stringValue,
  uriList,
  uriValue,
} from '../database-validation/sparql-value-schemas.ts';
import type { PageOpts } from '../pagination.ts';
import { NotImplementedError } from '../errors.ts';
import {
  listQuery,
  schemaQuery,
  idValuesClause,
  maybeCheckedArray,
  type GetQueryOpts,
} from './schema-query.ts';

export async function getDesignList(pagination?: PageOpts) {
  if (pagination) throw new NotImplementedError();
  return listQuery(`
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

  SELECT DISTINCT ?id WHERE { 
    ?uri a mobiliteit:AanvullendReglementOntwerp;
	 mu:uuid ?id.
  }`);
}

const designDetailSchema = z
  .object({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
    id: plainString,
    measures: uriList,
  })
  .strict();
export async function getDesignDetails(ids: string[], opts?: GetQueryOpts) {
  return schemaQuery(
    maybeCheckedArray(z.array(designDetailSchema), ids.length, opts),
    `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?uri ?name ?date ?id (GROUP_CONCAT(str(?measure); SEPARATOR=",") as ?measures) WHERE { 
    ${idValuesClause(ids)}
    {?uri a mobiliteit:AanvullendReglementOntwerp;
       mu:uuid ?id;
       arOntwerp:naam ?name;
       dct:issued ?date.
    } UNION {
    ?uri a mobiliteit:AanvullendReglementOntwerp;
	   mu:uuid ?id;
	   arOntwerp:naam ?name;
	   dct:issued ?date.
    ?hasMeasureDesignRel relatie:bron ?uri;
       a onderdeel:BevatMaatregelOntwerp;
       relatie:doel ?measureDesign.

    ?basedOnRel relatie:bron ?measureDesign;
      a onderdeel:IsGebaseerdOp;
      relatie:doel ?measure.
       }
  } GROUP BY ?uri ?name ?date ?id`,
  );
}
export async function searchDesignDetails(ids: string[]) {
  return getDesignDetails(ids, { allowEmpty: true });
}
export async function getAllDesigns() {
  const uris = await getDesignList();
  return getDesignDetails(uris);
}

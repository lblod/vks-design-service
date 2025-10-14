import * as z from 'zod';
import {
  dateTimeValue,
  plainString,
  stringValue,
  uriValue,
} from '../database-validation/sparql-value-schemas';
import type { PageOpts } from '../pagination';
import { NotImplementedError } from '../errors';
import { listQuery, schemaQuery, uriValuesClause } from './schema-query';

export async function getDesignList(pagination?: PageOpts) {
  if (pagination) throw new NotImplementedError();
  return listQuery(`
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>

  SELECT DISTINCT ?uri WHERE { 
    ?uri a mobiliteit:AanvullendReglementOntwerp.
  }`);
}

const designDetailSchema = z
  .object({
    name: stringValue,
    date: dateTimeValue,
    uri: uriValue,
    id: plainString,
  })
  .strict();
export async function getDesignDetails(uris: string[]) {
  return schemaQuery(
    z.array(designDetailSchema).length(uris.length),
    `
  PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
  PREFIX arOntwerp: <https://data.vlaanderen.be/ns/mobiliteit#AanvullendReglementOntwerp.>
  PREFIX relatie: <https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.>
  PREFIX onderdeel: <https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?uri ?name ?date ?id WHERE { 
    ${uriValuesClause(uris)}
    ?uri a mobiliteit:AanvullendReglementOntwerp;
       mu:uuid ?id;
       arOntwerp:naam ?name;
       dct:issued ?date.
  }`,
  );
}
export async function getAllDesigns() {
  const uris = await getDesignList();
  return getDesignDetails(uris);
}

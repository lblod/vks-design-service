import {
  idValuesClause,
  uriValuesClause,
  type GetQueryOpts,
} from './schema-query.ts';
import { getMowEndpoint } from '../environment.ts';
import { query, sparqlEscapeUri } from 'mu';
import { trafficSignalConceptSchema } from '../schemas/traffic-signal-concept.ts';
import { objectify } from '../utils/sparql.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';
import { queryRoadSignCategories } from './road-sign-categories';
import * as z from 'zod';

export async function getTrafficSignalConcepts(opts: GetQueryOpts = {}) {
  const { ids, uris } = opts;

  const response = await query(
    /* sparql */ `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT
      ?id
      ?uri
      ?type
      ?code
      ?meaning
      ?regulatoryNotation
    WHERE {
      ?uri
	a mobiliteit:Verkeerstekenconcept;
	mu:uuid ?id;
	a ?type;
	skos:prefLabel ?code;
	skos:scopeNote ?meaning.

	OPTIONAL {
	  ?uri ext:regulatoryNotation ?regulatoryNotation.
	}

      VALUES ?type {
	${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN)}
	${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING)}
	${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT)}
      }

      ${ids ? idValuesClause(ids) : ''}
      ${uris ? uriValuesClause(uris) : ''}
    }
    GROUP BY ?id ?uri ?code
  `,
    {
      endpoint: getMowEndpoint(),
    },
  );
  const bindings = response.results.bindings;
  const concepts = z
    .array(trafficSignalConceptSchema)
    .parse(bindings.map(objectify));
  const conceptsWithCategories = await Promise.all(
    concepts.map(async (concept) => {
      if (concept.type === TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        const categories = await queryRoadSignCategories(concept.uri);
        console.log(categories);
        return {
          ...concept,
          categories,
        };
      } else {
        return concept;
      }
    }),
  );
  return conceptsWithCategories;
}

export async function getTrafficSignalConceptByUri(uri: string) {
  return getTrafficSignalConcepts({ uris: [uri] }).then(
    (concepts) => concepts[0],
  );
}

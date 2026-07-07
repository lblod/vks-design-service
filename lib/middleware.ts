import type { Request, Response, NextFunction } from 'express';
import { query, sparqlEscapeUri, type BindingObject } from 'mu';
import HttpError from './utils/http-error';
import { AUTH_CONFIG } from './environment';

export const identifyAdministrativeUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const unauthorizedError = new HttpError(
    "You don't have the correct access rights to access this endpoint",
    401,
  );
  const sessionId = req.get('mu-session-id') as string | undefined;
  if (!sessionId) {
    return next(unauthorizedError);
  }

  const administrativeUnit = await queryAdministrativeUnit(sessionId);
  if (!administrativeUnit) {
    return next(unauthorizedError);
  }
  res.locals.administrativeUnit = administrativeUnit;
  next();
};

const queryAdministrativeUnit = async (sessionId: string) => {
  let binding: BindingObject | undefined;
  if (AUTH_CONFIG.checkType === 'session_group') {
    const result = await query(
      /* sparql */ `
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

      SELECT DISTINCT ?administrativeUnit WHERE {
        GRAPH <http://mu.semte.ch/graphs/sessions> {
          ${sparqlEscapeUri(sessionId)}
            ext:sessionGroup ?administrativeUnit;
            ext:sessionRole ?role.
        FILTER(?role in
                ("GelinktNotuleren-lezer", "GelinktNotuleren-schrijver", "GelinktNotuleren-publiceerder",  "GelinktNotuleren-ondertekenaar"))

        } 
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?administrativeUnit a besluit:Bestuurseenheid
        }
      }
      `,
      { sudo: true },
    );
    binding = result.results.bindings[0];
  } else {
    const result = await query(
      /* sparql */ `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      SELECT DISTINCT ?administrativeUnit WHERE {
        GRAPH <http://mu.semte.ch/graphs/private> {
          ${sparqlEscapeUri(sessionId)} muAccount:account ?account ;
                       muAccount:canActOnBehalfOf ?administrativeUnit .
          ?account a foaf:Agent .
        }
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?administrativeUnit a besluit:Bestuurseenheid .
        }
      }
      `,
      { sudo: true },
    );
    binding = result.results.bindings[0];
  }
  if (!binding) {
    return null;
  }
  return binding['administrativeUnit']!.value;
};

import { beforeAll, describe, expect, it } from 'vitest';
import { waitForDB, wipeDB } from '../db-utils';
import { update } from 'mu';
import { getAllDesigns } from '../../lib/queries/get-all-designs';

const exampleDesign = `
<https://does.not.resolve/ontwerp/O-kstKT>	<https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#VLAGAIMObject.typeURI>	<https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp> .
<https://does.not.resolve/ontwerp/O-kstKT>	<https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp.naam>	"Slagmanstraat v2"^^<http://www.w3.org/2001/XMLSchema#string> .
<https://does.not.resolve/ontwerp/O-kstKT>	<https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp.datum>	"2025-09-12T17:19:29.562952+02:00"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://does.not.resolve/ontwerp/O-kstKT>	<http://purl.org/dc/terms/issued>	"2025-09-12T15:29:33.095Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://does.not.resolve/ontwerp/O-kstKT>	<https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#VLAGAIMToestand.toestand>	<https://wegenenverkeer.data.vlaanderen.be/id/concept/KlAIMToestand/in-gebruik> .
<https://does.not.resolve/ontwerp/O-kstKT>	<https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#VLAGAIMObject.assetId>	<http://mu.semte.ch/blank#9dec2250-de26-4c64-8cc4-28b30b5f57f6> .
<https://does.not.resolve/ontwerp/O-kstKT>	<https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#AIMDBStatus.isActief>	"true"^^<http://www.w3.org/2001/XMLSchema#boolean> .
<https://does.not.resolve/ontwerp/O-kstKT>	<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>	<https://data.vlaanderen.be/ns/mobiliteit#SignalisatieOntwerp> .
`;

describe('get all designs', () => {
  beforeAll(async () => {
    await waitForDB();
    await wipeDB();
    await update(`INSERT DATA { ${exampleDesign} }`);
  }, 50000);
  it(`gets a result`, async () => {
    const result = await getAllDesigns();
    expect(result).toBeTruthy();
  });
  it('gets a valid sparql result', async () => {
    const result = await getAllDesigns();
    expect(result).toHaveLength(1);
  });
});

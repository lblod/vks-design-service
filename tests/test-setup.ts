import { test as baseTest } from 'vitest';

const composeFilePath = 'test-app/';
const composeFile = 'docker-compose.yml';
import {
  DockerComposeEnvironment,
  RandomPortGenerator,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import { wipeDB } from './db-utils';

export const dbtest = baseTest.extend<{
  stack?: { composeEnv: StartedDockerComposeEnvironment; endpoint: string };
}>({
  stack: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const composeEnv = await new DockerComposeEnvironment(
        composeFilePath,
        composeFile,
      )
        .withEnvironment({
          DB_PORT: `${await new RandomPortGenerator().generatePort()}`,
        })
        .withWaitStrategy(
          'triplestore-1',
          Wait.forLogMessage(/Server online at 1111/),
        )
        .withWaitStrategy('database-1', Wait.forListeningPorts())
        .up();

      const database = composeEnv.getContainer('database-1');
      const endpoint = `http://${database.getHost()}:${database.getFirstMappedPort()}/sparql`;
      process.env['MU_SPARQL_ENDPOINT'] = endpoint;
      await wipeDB();

      // this is where the suite will run, cause this fixture is scoped to the file
      await use({ composeEnv, endpoint });

      // here we do the cleanup
      await composeEnv.down();
      process.env['MU_SPARQL_ENDPOINT'] = undefined;
    },
    { auto: true, scope: 'file' },
  ],
});

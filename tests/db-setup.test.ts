import { describe, expect } from 'vitest';
import { query, update } from 'mu';
import { dbtest } from './test-setup.ts';

describe.only('test the connection with the sparql-parser backend', () => {
  dbtest('can connect to the backend and execute a basic query', async () => {
    await update('DELETE { ?s ?p ?v. } WHERE {?s ?p ?v. }');
    const insertQueryStr = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    INSERT DATA {
      <http://example.org/1> a ext:Foo.
      <http://example.org/2> a ext:Foo.
      <http://example.org/3> a ext:Foo.
      <http://example.org/4> a ext:Foo.
      <http://example.org/5> a ext:Foo.
      <http://example.org/6> a ext:Foo.
      <http://example.org/7> a ext:Foo.
      <http://example.org/8> a ext:Foo.
      <http://example.org/9> a ext:Foo.
      <http://example.org/10> a ext:Foo.

    }
    `;

    console.log(process.env['MU_SPARQL_ENDPOINT']);
    await update(insertQueryStr);
    const queryStr = `
    SELECT * WHERE { ?s ?p ?v . } 
    `;
    const result = await query<{ s: string; type: string }>(queryStr);
    expect(result.results.bindings).toHaveLength(10);
  });
});

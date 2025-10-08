import { update } from 'mu';
export async function wipeDB() {
  const wipeDBStr = `
    DELETE {?s ?p ?v.} WHERE {?s ?p ?v.}
    `;
  try {
    await update(wipeDBStr);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
export async function seedDB(nTriples: string | string[]) {
  try {
    let queryStr: string;
    if (typeof nTriples === 'string') {
      queryStr = `INSERT DATA { ${nTriples} }`;
    } else {
      queryStr = nTriples
        .map((triples) => `INSERT DATA { ${triples} }`)
        .join(';');
    }
    await wipeDB();
    await update(queryStr);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

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
export async function seedDB(nTriples: string) {
  try {
    await wipeDB();
    await update(`INSERT DATA { ${nTriples} }`);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

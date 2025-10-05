import { setInterval } from 'node:timers/promises';
import { query, update } from 'mu';
export async function waitForDB(timeoutMS: number = 10000) {
  const interval = 100;
  const askStr = 'ASK {?s ?p ?v.}';
  for await (const startTime of setInterval(interval, Date.now())) {
    const now = Date.now();
    try {
      const answer = await query(askStr);
      console.log(answer);
      break;
    } catch {
      console.log('waiting for database');
    }
    if (now - startTime > timeoutMS) {
      break;
    }
  }
}
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

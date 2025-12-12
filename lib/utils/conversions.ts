import * as z from 'zod';

export const isoStringToDate = z.codec(
  z.iso.datetime({ offset: true }),
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // ISO string → Date
    encode: (date) => date.toISOString(), // Date → ISO string
  },
);

export const stringToNumber = z.codec(
  z.string().regex(z.regexes.number),
  z.number(),
  {
    decode: (str) => Number.parseFloat(str),
    encode: (num) => num.toString(),
  },
);

export const stringToInteger = z.codec(
  z.string().regex(z.regexes.integer),
  z.number(),
  {
    decode: (str) => Number.parseInt(str, 10),
    encode: (num) => num.toString(),
  },
);

import type { Response } from 'express';

export type AuthenticatedResponse<ResBody = unknown> = Response<
  ResBody,
  { administrativeUnit: string }
>;

export abstract class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class NotImplementedError extends CustomError {
  constructor() {
    super('Not implemented');
  }
}
export class InvariantError extends CustomError {}

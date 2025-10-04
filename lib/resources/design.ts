import {
  OperationProcessor,
  Resource,
  type HasId,
  type Operation,
} from 'kurier';

export class Design extends Resource {
  static schema = {
    attributes: {
      name: String,
    },
    relationships: {},
  };
}
export class DesignProcessor<
  ResourceT extends Design,
> extends OperationProcessor<ResourceT> {
  get resourceClass() {
    return Design;
  }
  async get(_op: Operation): Promise<HasId | HasId[]> {
    return [
      {
        type: 'moment',
        id: '1',
        attributes: { name: 'test' },
        relationships: {},
      },
    ] satisfies Design[];
  }
}

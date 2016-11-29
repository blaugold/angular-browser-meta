
export class MetaTagData {
  name?: {
    [name: string]: string
  };
  httpEquiv?: {
    [header: string]: string
  };
  property?: {
    [propName: string]: string
  };
  mergeWhen?: 'always' | 'never' | 'parent' | 'child';

  constructor({ name, httpEquiv, property, mergeWhen }: {
    name?: {
      [name: string]: string
    };
    httpEquiv?: {
      [header: string]: string
    };
    property?: {
      [propName: string]: string
    };
    mergeWhen?: 'always' | 'never' | 'parent' | 'child';
  } = {}) {
    this.name      = name || {};
    this.httpEquiv = httpEquiv || {};
    this.property  = property || {};
    this.mergeWhen = mergeWhen || 'always';
  }
}

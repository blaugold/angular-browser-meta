// export class SiteMetadata {
//   title: string;
//   breadcrumbName?: string;
//   url?: string;
//   keywords?: string[];
//   description?: string;
//
//   constructor({ title, breadcrumbName, url, keywords, description }: {
//     title: string;
//     breadcrumbName?: string;
//     url?: string;
//     keywords?: string[];
//     description?: string;
//   }) {
//     this.title          = title;
//     this.breadcrumbName = breadcrumbName;
//     this.url            = url;
//     this.keywords       = keywords;
//     this.description    = description;
//   }
// }

export class MetaTagData {
  title?: string;
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

  constructor({ title, name, httpEquiv, property, mergeWhen }: {
    title?: string;
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
    this.title     = title;
    this.name      = name || {};
    this.httpEquiv = httpEquiv || {};
    this.property  = property || {};
    this.mergeWhen = mergeWhen || 'always';
  }
}

import { Injectable } from '@angular/core';
import { SchemaService } from './schema.service';

const schemaName = 'BreadcrumbList';

@Injectable()
export class BreadcrumbSchemaService {

  constructor(private schemaService: SchemaService) {}

  setBreadcrumbList(list: { url: string, name: string }[]) {
    const items  = list.map(({ url, name }, i) => {
      return {
        '@type':    'ListItem',
        'position': i,
        'item':     {
          '@id':  url,
          'name': name
        }
      };
    });
    const schema = {
      '@context':        'http://schema.org',
      '@type':           'BreadcrumbList',
      'itemListElement': items
    };
    this.schemaService.setSchema(schemaName, schema);
  }

  clearBreadcrumbList() {
    this.schemaService.removeSchema(schemaName);
  }
}

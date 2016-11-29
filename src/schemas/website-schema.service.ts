import { Injectable } from '@angular/core';
import { SchemaService } from './schema.service';

@Injectable()
export class WebsiteSchemaService {
  private schemaName = 'WebSite';

  constructor(private schemaSrv: SchemaService) { }

  setMetaData(metaData: {
    name?: string
    alternateName?: string
    url?: string
  }) {
    const schema = Object.assign(
      {
        '@context': 'http://schema.org',
        '@type':    'WebSite'
      },
      this.schemaSrv.getSchema(this.schemaName),
      metaData
    );

    this.schemaSrv.setSchema(this.schemaName, schema);
  }
}

import { inject, TestBed } from '@angular/core/testing';
import { expect } from 'chai';

import { WebsiteSchemaService } from './website-schema.service';
import { SchemaService } from './schema.service';
import { ScriptElementService } from '../core';

describe('WebsiteSchemaService', function () {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [WebsiteSchemaService, SchemaService, ScriptElementService]
  }));

  it('should work', inject([WebsiteSchemaService, SchemaService],
    (wsSchemaSrv: WebsiteSchemaService, schemaSrv: SchemaService) => {
      wsSchemaSrv.setMetaData({ name: 'a', url: 'b', alternateName: 'c' });
      const schema = schemaSrv.getSchema('WebSite');
      expect(schema).to.deep.equal({
        '@context':    'http://schema.org',
        '@type':       'WebSite',
        name:          'a',
        url:           'b',
        alternateName: 'c'
      });
    }));
});

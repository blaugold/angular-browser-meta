import { inject, TestBed } from '@angular/core/testing';
import { expect } from 'chai';
import { SchemaService } from './schema.service';
import { ScriptElementService } from '../core';

describe('ServiceService', function () {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [SchemaService, ScriptElementService]
  }));

  it('should work', inject([SchemaService], function (schemaSrv: SchemaService) {
    const fooSchema = { foo: 'foo ' };
    schemaSrv.setSchema('foo', fooSchema);
    const res = schemaSrv.getSchema('foo');

    expect(res).to.deep.equal(fooSchema);
  }));
});

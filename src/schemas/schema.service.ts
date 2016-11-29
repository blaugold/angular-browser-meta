import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';

import { ScriptElementService } from '../core';

const idPrefix = 'schemas';

@Injectable()
export class SchemaService {

  constructor(private script: ScriptElementService) {}

  getSchema(schemaName: string) {
    const schemaStr = this.getSchemaScriptElement(schemaName).text;
    return isEmpty(schemaStr) ? {} : JSON.parse(schemaStr);
  }

  setSchema(schemaName: string, schema: Object) {
    this.getSchemaScriptElement(schemaName).text = JSON.stringify(schema);
  }

  removeSchema(schemaName: string) {
    this.script.remove(this.getSelector(schemaName));
  }

  private getSchemaScriptElement(schemaName: string): HTMLScriptElement {
    let el = this.script.get(this.getSelector(schemaName));

    if (!el) {
      el = this.addScriptElement(schemaName);
    }

    return el;
  }

  private getSelector(schemaName: string) {
    return `id=${idPrefix}-${schemaName}`;
  }

  private addScriptElement(schemaName: string): HTMLScriptElement {
    return this.script.add({
      type: 'application/ld+json',
      id:   `${idPrefix}-${schemaName}`
    });
  }
}

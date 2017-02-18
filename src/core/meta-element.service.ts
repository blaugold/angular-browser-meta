import { Injectable } from '@angular/core'
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter'
import * as forEach from 'lodash/forEach'

export interface MetaElementDefinition {
  charset?: string;
  content?: string;
  httpEquiv?: string;
  id?: string;
  itemprop?: string;
  name?: string;
  property?: string;
  scheme?: string;
  url?: string;
  [prop: string]: string;
}

@Injectable()
export class MetaElementService {

  private dom = getDOM();

  add(def: MetaElementDefinition): HTMLMetaElement {
    const el = this.createMetaElement();
    this.applyDefinition(el, def);
    return el;
  }

  update(selector: string, def: MetaElementDefinition): HTMLMetaElement {
    const el = this.getMetaElement(selector);
    if (!el) {
      return null;
    }
    this.applyDefinition(el, def);
    return el;
  }

  set(selector: string, def: MetaElementDefinition): HTMLMetaElement {
    this.remove(selector);
    return this.add(def);
  }

  getMetaElement(selector: string): HTMLMetaElement {
    return this.dom.query(`meta[${selector}]`);
  }

  remove(selector: string) {
    const el = this.getMetaElement(selector);
    if (el) {
      this.dom.remove(el);
    }
  }

  private createMetaElement(): HTMLMetaElement {
    const el   = this.dom.createElement('meta', this.dom.defaultDoc()) as HTMLMetaElement;
    const head = this.getHead();
    this.dom.appendChild(head, el);
    return el;
  }

  private applyDefinition(el: HTMLMetaElement, def: MetaElementDefinition) {
    forEach(def, (attrContent, attrName) => this.dom.setAttribute(el, attrName, attrContent));
  }

  private getHead(): HTMLHeadElement {
    return this.dom.querySelector(this.dom.defaultDoc(), 'head') as HTMLHeadElement;
  }
}

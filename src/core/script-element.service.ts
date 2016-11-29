import { Injectable } from '@angular/core';
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter';

export interface ScriptDef {
  type?: string;
  id?: string;
}

@Injectable()
export class ScriptElementService {
  private dom = getDOM();

  set(selector: string, def: ScriptDef) {
    this.remove(selector);
    return this.add(def);
  }

  update(selector: string, def: ScriptDef): HTMLScriptElement {
    const el = this.get(selector);
    if (el) {
      this.applyDef(el, def);
    }
    return el;
  }

  get(selector: string): HTMLScriptElement {
    return this.dom.query(`script[${selector}]`);
  }

  add(def: ScriptDef): HTMLScriptElement {
    const el = this.dom.createElement('script') as HTMLScriptElement;
    this.applyDef(el, def);
    this.dom.appendChild(this.getHead(), el);
    return el;
  }

  remove(selector: string): boolean {
    const el = this.get(selector);
    this.dom.remove(el);
    return !!el;
  }

  private getHead(): HTMLHeadElement {
    return this.dom.query('head');
  }

  private applyDef(el: HTMLScriptElement, def: ScriptDef) {
    if (def.id) {
      el.id = def.id;
    }
    if (def.type) {
      el.type = def.type;
    }
  }
}

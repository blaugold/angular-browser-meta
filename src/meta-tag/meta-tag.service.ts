import { Injectable, Inject } from '@angular/core';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';
import { compact, merge, forEach } from 'lodash';

import { MetaTagData } from './meta-tag-data';
import { MetaElementService, RouterDataService } from '../core';
import { MetaTagModuleConfig, metaTagModuleConfig, initConfig } from './meta-tag-module-config'

@Injectable()
export class MetaTagService {

  private writtenData: MetaTagData;
  private overriddenData: MetaTagData;

  constructor(@Inject(metaTagModuleConfig) public config: MetaTagModuleConfig,
              private metaElem: MetaElementService,
              private routerData: RouterDataService) {
    initConfig(config);

    const $path            = this.routerData.$path.do(() => this.reset());
    const $metaTagDataPath = $path.switchMap(() => this.getMetaTagData(this.routerData.$data));
    const $metaTagData     = $metaTagDataPath.map(path => this.mergePath(path));

    $metaTagData.subscribe(metadata => this.update(metadata));
  }

  reset() {
    this.clearDOM();

    this.overriddenData = new MetaTagData();
    this.writtenData    = new MetaTagData();
  }

  update(metaData: MetaTagData) {
    this.clearDOM();

    metaData = mergeOverrides(metaData, this.overriddenData);
    this.setDOM(metaData);
  }

  /** @internal */
  mergePath(path: MetaTagData[]): MetaTagData {
    return path.reduce((acc, curData, index) => {
      switch (curData.mergeWhen) {
        case 'always':
          return mergeData(acc, curData);
        case 'never':
          return isLastItem(index, path) ? curData : acc;
        case 'parent':
          return !isLastItem(index, path) ? mergeData(acc, curData) : curData;
        case 'child':
          return isLastItem(index, path) ? mergeData(acc, curData) : acc;
      }
    }, this.config.baseData);
  }

  set(name: string, content: string) {
    this.overriddenData.name[name] = content;
    this._set(name, content);
  }

  remove(name: string) {
    this.overriddenData.name[name] = null;
    this._remove(name);
  }

  setHttpEquiv(httpEquiv: string, content: string) {
    this.overriddenData.httpEquiv[httpEquiv] = content;
    this._setHttpEquiv(httpEquiv, content);
  }

  removeHttpEquiv(httpEquiv: string) {
    this.overriddenData.httpEquiv[httpEquiv] = null;
    this._removeHttpEquiv(httpEquiv);
  }

  setProperty(property: string, content: string) {
    this.overriddenData.property[property] = content;
    this._setProperty(property, content);
  }

  removeProperty(property: string) {
    this.overriddenData.property[property] = null;
    this._removeProperty(property);
  }

  private getMetaTagData($data: Observable<Data[]>): Observable<MetaTagData[]> {
    return $data
      .map(path => path.map(data => data[this.config.dataProp]))
      .map(compact);
  }

  private _set(name: string, content: string) {
    this.writtenData.name[name] = content;
    this.metaElem.add({ id: this.getId('Name', name), name, content })
  }

  private _remove(name: string) {
    delete this.writtenData.name[name];
    this.metaElem.remove(this.getSelector('Name', name));
  }

  private _setHttpEquiv(httpEquiv: string, content: string) {
    this.writtenData.httpEquiv[httpEquiv] = content;
    this.metaElem.add({ id: this.getId('HttpEquiv', httpEquiv), httpEquiv, content })
  }

  private _removeHttpEquiv(httpEquiv: string) {
    delete this.writtenData.httpEquiv[httpEquiv];
    this.metaElem.remove(this.getSelector('HttpEquiv', httpEquiv));
  }

  private _setProperty(property: string, content: string) {
    this.writtenData.property[property] = content;
    this.metaElem.add({ id: this.getId('Property', property), property, content })
  }

  private _removeProperty(property: string) {
    delete this.writtenData.property[property];
    this.metaElem.remove(this.getSelector('Property', property));
  }

  private clearDOM() {
    if (this.writtenData) {
      const data = this.writtenData;
      forEach(data.name, (content, name) => this._remove(name));
      forEach(data.httpEquiv, (content, httpEquiv) => this._removeHttpEquiv(httpEquiv));
      forEach(data.property, (content, property) => this._removeProperty(property));
    }
  }

  private setDOM(data: MetaTagData) {
    forEach(data.name, (content, name) => this._set(name, content));
    forEach(data.httpEquiv, (content, httpEquiv) => this._setHttpEquiv(httpEquiv, content));
    forEach(data.property, (content, property) => this._setProperty(property, content));
  }

  private getId(kind: string, name: string): string {
    return `${this.config.idPrefix}.${kind}.${name}`;
  }

  private getSelector(kind: string, name: string): string {
    return `id="${this.getId(kind, name)}"`;
  }
}

function mergeData(a: MetaTagData, b: MetaTagData): MetaTagData {
  return merge(new MetaTagData(), a, b);
}

function mergeOverrides(cur: MetaTagData, overrides: MetaTagData): MetaTagData {
  return merge({}, cur, overrides, (objValue, srcValue, key, object) => {
    if (srcValue === null) {
      delete object[key];
    }
  });
}

function isLastItem(index, array) {
  return index === array.length - 1;
}

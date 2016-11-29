import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  ActivatedRouteSnapshot,
  Data
} from '@angular/router';
import { Observable } from 'rxjs';
import { isEmpty, compact, merge, forEach } from 'lodash';

import { MetaTagData } from './meta-tag-data';
import { MetaElementService } from '../core';

export interface TitleFactory {
  (baseTitle: string, curTitle: string): string
}

export interface RouteDataBundle {
  route: ActivatedRoute;
  data: Data;
}

export interface RouteMetaBundle {
  route: ActivatedRoute;
  meta: MetaTagData;
}

export class MetaTagModuleConfig {
  baseData?: MetaTagData;
  titleFactory?: TitleFactory | null;
  dataProp?: string;
  idPrefix?: string;

  constructor({ baseData, titleFactory, dataProp, idPrefix }: {
    baseData?: MetaTagData;
    titleFactory?: TitleFactory | null;
    dataProp?: string;
    idPrefix?: string;
  }) {
    this.baseData = baseData || new MetaTagData({});
    if (titleFactory === undefined) {
      this.titleFactory = (baseTitle, curTitle) => {
        if (baseTitle === curTitle) {
          return baseTitle;
        }
        return `${curTitle} | ${baseTitle}`
      }
    }
    else if (titleFactory === null) {
      this.titleFactory = (baseTitle, curTitle) => curTitle;
    }
    else {
      this.titleFactory = titleFactory;
    }
    this.dataProp = dataProp || 'meta';
    this.idPrefix = idPrefix || 'browser-meta';
  }
}

@Injectable()
export class MetaTagService {

  private writtenData: MetaTagData;
  private overriddenData: MetaTagData;

  constructor(public config: MetaTagModuleConfig,
              private router: Router,
              private metaElem: MetaElementService,
              private title: Title) {
    const rootSrc           = this.getRootActivatedRoute().do(() => this.reset());
    const primaryPathSrc    = this.getPrimaryPathFromRoot(rootSrc);
    const metaBundlePathSrc = primaryPathSrc.switchMap(path => this.mapRoutesToMetaBundles(path));
    const metadata          = metaBundlePathSrc.map(path => this.mergePath(path));

    metadata.subscribe(metadata => this.update(metadata));
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
  mergePath(path: RouteMetaBundle[]): MetaTagData {
    const dataArr = compact(path.map(bundle => bundle.meta));

    const mergedData = dataArr.reduce((acc, curData, index) => {
      switch (curData.mergeWhen) {
        case 'always':
          return mergeData(acc, curData);
        case 'never':
          return isLastItem(index, dataArr) ? curData : acc;
        case 'parent':
          return !isLastItem(index, dataArr) ? mergeData(acc, curData) : curData;
        case 'child':
          return isLastItem(index, dataArr) ? mergeData(acc, curData) : acc;
      }
    }, this.config.baseData);

    mergedData.title = this.config.titleFactory(this.config.baseData.title, mergedData.title);

    return mergedData;
  }

  setTitle(title: string) {
    this.overriddenData.title = title;
    this._setTitle(title);
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

  private getPrimaryPathFromRoot(rootSrc: Observable<ActivatedRoute>): Observable<ActivatedRoute[]> {
    return rootSrc.map(root => {
      const routeTail = new PrimaryRouteTailWalker();
      walkRouteTree(routeTail, root);
      const curRoute = routeTail.primaryRouteTail;
      return curRoute ? curRoute.pathFromRoot : [];
    });
  }

  private mapRoutesToDataBundles(path: ActivatedRoute[]): Observable<RouteDataBundle[]> {
    const dataSrc = isEmpty(path) ? Observable.of([]) : Observable.from(path)
      .map(route => route.data)
      .combineAll<Data[]>();

    return dataSrc
      .map<RouteDataBundle[]>(dataArray => dataArray
        .map<RouteDataBundle>((data, index) => ({ route: path[index], data }))
      );
  }

  private mapRoutesToMetaBundles(path: ActivatedRoute[]): Observable<RouteMetaBundle[]> {
    return this.mapRoutesToDataBundles(path)
      .map(dataPath => dataPath
        .map<RouteMetaBundle>(
          bundle => ({ route: bundle.route, meta: bundle.data[this.config.dataProp] }))
      );
  }

  private getRootActivatedRoute(): Observable<ActivatedRoute> {
    return this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.router.routerState.root);
  }

  private _setTitle(title: string) {
    this.writtenData.title = title;
    this.title.setTitle(title);
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
    if (data.title !== '') {
      this._setTitle(data.title);
    }

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

interface ActivatedRouteTreeVisitor {
  visitRoute(activatedRoute: ActivatedRoute,
             activatedRouteSnapshot: ActivatedRouteSnapshot);
}

/**
 * Walks a visitor over ActivatedRoute.
 * If visitor returns true children of this route won't be visited.
 */
function walkRouteTree(visitor: ActivatedRouteTreeVisitor,
                       curRoute: ActivatedRoute) {
  const skipBranch = visitor.visitRoute(curRoute, curRoute.snapshot);
  if (!skipBranch) {
    curRoute.children.forEach(child => walkRouteTree(visitor, child));
  }
}

/**
 * Finds the route for which all parents and it self are on a primary outlet and is
 * the last in the overall path.
 */
class PrimaryRouteTailWalker implements ActivatedRouteTreeVisitor {
  primaryRouteTail: ActivatedRoute;

  visitRoute(activatedRoute: ActivatedRoute,
             activatedRouteSnapshot: ActivatedRouteSnapshot) {
    if (activatedRoute.outlet !== 'primary') {
      // Skip non primary route
      return true;
    }
    this.primaryRouteTail = activatedRoute;
  }
}

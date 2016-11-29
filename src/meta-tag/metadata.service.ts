// import { Injectable, OpaqueToken, Inject } from '@angular/core';
// import { Observable } from 'rxjs';
// import { Title } from '@angular/platform-browser';
// import {
//   Router,
//   ActivatedRoute,
//   NavigationEnd,
//   ActivatedRouteSnapshot,
//   Data,
//   UrlSegment
// } from '@angular/router';
// import { compact, isEmpty } from 'lodash';
//
// import { SiteMetadata } from './meta-tag-data';
// import { BreadcrumbSchemaService, WebsiteSchemaService } from '../schemas';
//
// export interface RouteDataBundle {
//   route: ActivatedRoute;
//   data: Data;
// }
//
// export interface RouteMetaBundle {
//   route: ActivatedRoute;
//   meta: SiteMetadata;
// }
//
// export interface Breadcrumb {
//   name: string;
//   url: string;
// }
//
// export const baseSiteMetaData = new OpaqueToken('Base SiteMetadata');
//
// /**
//  * @internal
//  * Property in `Data` to look for metadata.
//  */
// const metadataPropName = 'meta';
//
// @Injectable()
// export class MetadataService {
//
//   constructor(private router: Router,
//               private title: Title,
//               private websiteSchema: WebsiteSchemaService,
//               private breadcrumbSchema: BreadcrumbSchemaService,
//               @Inject(baseSiteMetaData) private siteMetaData: SiteMetadata) {
//     this.setupWebsiteSchema();
//     this.setupBreadcrumbSchemaHandler();
//   }
//
//   setupWebsiteSchema() {
//     this.websiteSchema.setMetaData({
//       url:  this.siteMetaData.url,
//       name: this.siteMetaData.title
//     });
//   }
//
//   setupBreadcrumbSchemaHandler() {
//     const rootSrc           = this.getRootActivatedRoute();
//     const primaryPathSrc    = this.getPrimaryPathFromRoot(rootSrc);
//     const metaBundlePathSrc = primaryPathSrc
//       .switchMap(path => this.mapRoutesToMetaBundles(path));
//     const urlPathSrc        = primaryPathSrc
//       .switchMap(path => mapRoutesToUrls(path));
//
//     this.getBreadcrumbs(metaBundlePathSrc, urlPathSrc)
//       .do(breadcrumbs => this.updateBreadcrumbs(breadcrumbs))
//       .subscribe();
//   }
//
//   updateBreadcrumbs(breadCrumbs) {
//     if (breadCrumbs.length >= 2) {
//       this.breadcrumbSchema.setBreadcrumbList(breadCrumbs);
//     }
//     else {
//       this.breadcrumbSchema.clearBreadcrumbList();
//     }
//   }
//
//   getRootActivatedRoute(): Observable<ActivatedRoute> {
//     return this.router.events
//       .filter(event => event instanceof NavigationEnd)
//       .map(() => this.router.routerState.root);
//   }
//
//   getPrimaryPathFromRoot(rootSrc: Observable<ActivatedRoute>): Observable<ActivatedRoute[]> {
//     return rootSrc.map(root => {
//       const routeTail = new PrimaryRouteTailWalker();
//       walkRouteTree(routeTail, root);
//       const curRoute = routeTail.primaryRouteTail;
//       return curRoute ? curRoute.pathFromRoot : [];
//     });
//   }
//
//   getBreadcrumbs(metaBundlePathSrc: Observable<RouteMetaBundle[]>,
//                  urlPathSrc: Observable<string[]>): Observable<Breadcrumb[]> {
//     return Observable.combineLatest(metaBundlePathSrc, urlPathSrc)
//       .map(([bundlePath, urlPath]: [RouteMetaBundle[], string[]]) =>
//         bundlePath.map(({ meta }, i) => {
//           if (!meta) {
//             return null;
//           }
//
//           return {
//             name: meta.breadcrumbName || meta.title,
//             url:  meta.url || urlPath.slice(0, i + 1).join('/')
//           };
//         })
//       )
//       .map(breadCrumbs => compact(breadCrumbs))
//       .map<Breadcrumb[]>(breadCrumbs => {
//         const baseMeta = this.siteMetaData;
//         return [
//           {
//             name: baseMeta.breadcrumbName || baseMeta.title,
//             url:  baseMeta.url
//           }, ...breadCrumbs.map(breadCrumb => {
//             breadCrumb.url = baseMeta.url + breadCrumb.url;
//             return breadCrumb;
//           })
//         ];
//       });
//   }
//
//   mapRoutesToDataBundles(path: ActivatedRoute[]): Observable<RouteDataBundle[]> {
//     const dataSrc = isEmpty(path) ? Observable.of([]) : Observable.from(path)
//       .map(route => route.data)
//       .combineAll<Data[]>();
//
//     return dataSrc
//       .map<RouteDataBundle[]>(dataArray => dataArray
//         .map<RouteDataBundle>((data, index) => ({ route: path[index], data }))
//       );
//   }
//
//   mapRoutesToMetaBundles(path: ActivatedRoute[]): Observable<RouteMetaBundle[]> {
//     return this.mapRoutesToDataBundles(path)
//       .map(dataPath => dataPath
//         .map<RouteMetaBundle>(
//           bundle => ({ route: bundle.route, meta: bundle.data[metadataPropName] }))
//       );
//   }
// }
//
// interface ActivatedRouteTreeVisitor {
//   visitRoute(activatedRoute: ActivatedRoute,
//              activatedRouteSnapshot: ActivatedRouteSnapshot);
// }
//
// /**
//  * Walks a visitor over ActivatedRoute.
//  * If visitor returns true children of this route won't be visited.
//  */
// function walkRouteTree(visitor: ActivatedRouteTreeVisitor,
//                        curRoute: ActivatedRoute) {
//   const skipBranch = visitor.visitRoute(curRoute, curRoute.snapshot);
//   if (!skipBranch) {
//     curRoute.children.forEach(child => walkRouteTree(visitor, child));
//   }
// }
//
// /**
//  * Finds the route for which all parents and it self are on a primary outlet and is
//  * the last in the overall path.
//  */
// class PrimaryRouteTailWalker implements ActivatedRouteTreeVisitor {
//   primaryRouteTail: ActivatedRoute;
//
//   visitRoute(activatedRoute: ActivatedRoute,
//              activatedRouteSnapshot: ActivatedRouteSnapshot) {
//     if (activatedRoute.outlet !== 'primary') {
//       // Skip non primary route
//       return true;
//     }
//     this.primaryRouteTail = activatedRoute;
//   }
// }
//
// /**
//  * @internal
//  * Maps from route to url path for each route.
//  * ```
//  * [Route(a), Route(a/b)] => ['a', 'a/b']
//  * ```
//  *
//  * @param routePath
//  */
// function mapRoutesToUrls(routePath: ActivatedRoute[]): Observable<string[]> {
//   return isEmpty(routePath) ? Observable.of([]) : Observable.from(routePath)
//     .map(route => route.url)
//     .combineAll()
//     .map((urlSegmentPath: UrlSegment[][]) => urlSegmentPath
//       .map(urlSegments => urlSegments.join('/'))
//     );
// }

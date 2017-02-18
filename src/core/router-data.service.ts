import {
  Router,
  Data,
  ActivatedRouteSnapshot,
  NavigationEnd,
  ActivatedRoute
} from '@angular/router'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/observable/combineLatest'

@Injectable()
export class RouterDataService {

  $path: Observable<ActivatedRoute[]>;
  $data: Observable<Data[]>;

  constructor(private router: Router) {
    this.$path = this.getPathObs().publishReplay(1).refCount();
    this.$data = this.getDataObs(this.$path).publishReplay(1).refCount();
  }

  private getPathObs(): Observable<ActivatedRoute[]> {
    const root = this.router.events
      .filter(e => e instanceof NavigationEnd)
      .map(() => this.router.routerState.root);

    return root.map(root => {
      const walker = new PrimaryPathTailWalker();
      walkRouteTree(walker, root);
      const route = walker.primaryPathTail;
      return route ? route.pathFromRoot : [];
    })
  }

  private getDataObs($path: Observable<ActivatedRoute[]>): Observable<Data[]> {
    return $path.switchMap(path => {
      const dataObs = path.map(route => route.data);
      return Observable.combineLatest(dataObs);
    })
  }
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
class PrimaryPathTailWalker implements ActivatedRouteTreeVisitor {
  primaryPathTail: ActivatedRoute;

  visitRoute(activatedRoute: ActivatedRoute,
             activatedRouteSnapshot: ActivatedRouteSnapshot) {
    if (activatedRoute.outlet !== 'primary') {
      // Skip non primary route
      return true;
    }
    this.primaryPathTail = activatedRoute;
  }
}

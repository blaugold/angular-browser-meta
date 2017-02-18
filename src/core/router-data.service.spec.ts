import { NavigationEnd } from '@angular/router'
import { Subject } from 'rxjs/Subject'
import { RouterDataService } from './'

describe('RouterDataService', () => {
  it('should emit primary route', done => {
    const routerDataService = new RouterDataService(router);
    routerDataService.$path.subscribe(path => {
      expect(path).toBe(grandChild.pathFromRoot);
      done();
    });
    router.sendNavigationEnd();
  });

  it('should emit data along primary route', done => {
    const routerDataService = new RouterDataService(router);
    routerDataService.$data.subscribe(data => {
      expect(data).toEqual([
        { 0: 0 },
        { 1: 1 },
        { 2: 2 },
      ]);
      done();
    });
    router.sendNavigationEnd();
    root.data.next({ 0: 0 });
    child.data.next({ 1: 1 });
    grandChild.data.next({ 2: 2 });
  });
});

class ActivatedRouteMock {
  data                               = new Subject();
  children: ActivatedRouteMock[]     = [];
  pathFromRoot: ActivatedRouteMock[] = [];

  constructor(public outlet = 'primary') {}
}
const navEndEvent = new NavigationEnd(null, null, null);

const root       = new ActivatedRouteMock();
const child      = new ActivatedRouteMock();
const grandChild = new ActivatedRouteMock();

root.pathFromRoot = [root];
root.children     = [child, new ActivatedRouteMock('aux')];

child.pathFromRoot = [root, child];
child.children     = [grandChild, new ActivatedRouteMock('aux')];

grandChild.pathFromRoot = [root, child, grandChild];

const router = {
  events:      new Subject(),
  routerState: {
    root
  },
  sendNavigationEnd() {
    this.events.next(navEndEvent);
  }
} as any;
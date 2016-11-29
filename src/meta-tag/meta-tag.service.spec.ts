import { Component, NgModule, Type } from '@angular/core'
import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { RouterTestingModule } from '@angular/router/testing'

import { MetaTagService, MetaTagModuleConfig } from './meta-tag.service'
import { MetaElementService, RouterDataService } from '../core'
import { MetaTagData } from './meta-tag-data'

const ROUTES = () => [
  {
    path:      'all',
    component: TestComponent,
    data:      {
      meta: new MetaTagData({
        title:     'all',
        name:      {
          all: 'all'
        },
        httpEquiv: {
          all: 'all'
        },
        property:  {
          all: 'all'
        }
      })
    }
  },
  {
    path:      'parent',
    component: TestComponent,
    data:      {
      meta: new MetaTagData({
        title: 'parent',
        name:  {
          parent: 'parent'
        }
      })
    },
    children:  [
      {
        path:      'child',
        component: TestComponent,
        data:      {
          meta: new MetaTagData({
            title:     'child',
            name:      {
              child: 'child'
            },
            mergeWhen: 'child'
          })
        },
        children:  [
          {
            path:      'grandChild',
            component: TestComponent,
            data:      {
              meta: new MetaTagData({
                title:     'grandChild',
                mergeWhen: 'never'
              })
            },
          }
        ]
      }
    ]
  },
  {
    outlet:    'aux',
    path:      'aux',
    component: TestComponent,
    data:      {
      meta: new MetaTagData({
        title: 'aux'
      })
    }
  },
];

class MetaElementServiceMock {
  add() {}

  remove() {}
}

class TitleMock {
  setTitle() {}
}

describe('MetaTagService', () => {
  let metaTag: MetaTagService;
  let router: Router;
  let titleMock: TitleMock;
  let metaElemMock: MetaElementServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [
        RouterTestingModule.withRoutes(ROUTES()),
        TestModule
      ],
      providers: [
        { provide: Title, useClass: TitleMock },
        { provide: MetaElementService, useClass: MetaElementServiceMock },
        {
          provide: MetaTagModuleConfig, useValue: new MetaTagModuleConfig({
          baseData: new MetaTagData({ title: 'Base' })
        })
        },
        MetaTagService,
        RouterDataService
      ],
    });

    metaTag      = TestBed.get(MetaTagService);
    router       = TestBed.get(Router);
    titleMock    = TestBed.get(Title);
    metaElemMock = TestBed.get(MetaElementService);

    spyOn(titleMock, 'setTitle');
    spyOn(metaElemMock, 'add');
    spyOn(metaElemMock, 'remove');
  });

  it('should be instantiated', () => {
    expect(metaTag).toBeDefined();
  });

  it('should set title', fakeAsync(() => {
    createRoot(router, RootComponent);

    expect(titleMock.setTitle).toHaveBeenCalledWith('Base');
  }));

  it('should set name tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.all', name: 'all', content: 'all' });
  }));

  it('should set httpEquiv tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.HttpEquiv.all', httpEquiv: 'all', content: 'all' });
  }));

  it('should set property tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Property.all', property: 'all', content: 'all' });
  }));

  it('should reset dom when meta data changes', fakeAsync(() => {
    metaTag.reset();
    metaTag.update(new MetaTagData({
      name:      { a: 'a' },
      httpEquiv: { a: 'a' },
      property:  { a: 'a' },
    }));
    metaTag.update(new MetaTagData({}));
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.Name.a"');
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.HttpEquiv.a"');
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.Property.a"');
  }));

  it('should reset dom when route changes', fakeAsync(() => {
    metaTag.reset();
    metaTag.update(new MetaTagData({
      name:      { a: 'a' },
      httpEquiv: { a: 'a' },
      property:  { a: 'a' },
    }));
    metaTag.reset();
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.Name.a"');
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.HttpEquiv.a"');
    expect(metaElemMock.remove).toHaveBeenCalledWith('id="browser-meta.Property.a"');
  }));

  it('should use primary route', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);
    router.navigateByUrl('/(aux:/aux)');
    advance(fixture);
    expect(titleMock.setTitle).not.toHaveBeenCalledWith('aux | Base');
    expect(titleMock.setTitle).toHaveBeenCalledWith('Base');
    expect(titleMock.setTitle).toHaveBeenCalledTimes(2);
  }));

  it('should keep overridden metadata when meta data changes', () => {
    metaTag.reset();

    metaTag.update(new MetaTagData({ name: { a: 'a' }, }));
    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'a' });

    metaTag.set('a', 'b');
    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });

    metaTag.update(new MetaTagData({}));
    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });
  });

  it('should reset overridden metadata when route changes', () => {
    metaTag.reset();

    metaTag.set('a', 'b');
    expect(metaElemMock.add)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });

    metaTag.reset();
    metaTag.update(new MetaTagData());
    expect(metaElemMock.add).toHaveBeenCalledTimes(1);
  });

  it('should support mergeWhen:"never"', fakeAsync(() => {
    metaTag.config.baseData.name = { 'base': 'base' };
    const dataPath               = [
      new MetaTagData({
        name:      { a: 'a' },
        httpEquiv: { a: 'a' },
        property:  { a: 'a' }
      })
    ] as any;

    const merged = metaTag.mergePath(dataPath);

    expect(merged.name).toEqual({ a: 'a', base: 'base' });
    expect(merged.httpEquiv).toEqual({ a: 'a' });
    expect(merged.property).toEqual({ a: 'a' });
  }));

  it('should support mergeWhen:"never"', () => {
    const neverData  = new MetaTagData({ mergeWhen: 'never' });
    const parentData = new MetaTagData({ name: { parent: 'parent' } });

    const merged = metaTag.mergePath([parentData, neverData]);

    expect(merged.name).toEqual({})
  });

  it('should support mergeWhen:"child"', () => {
    const parentData     = new MetaTagData({ name: { parent: 'parent' } });
    const childData      = new MetaTagData({ mergeWhen: 'child', name: { child: 'child' } });
    const grandChildData = new MetaTagData({ name: { grandChild: 'grandChild' } });

    const mergedAsChild  = metaTag.mergePath([parentData, childData]);
    const mergedAsParent = metaTag.mergePath([parentData, childData, grandChildData]);

    expect(mergedAsChild.name).toEqual({ parent: 'parent', child: 'child' });
    expect(mergedAsParent.name).toEqual({ parent: 'parent', grandChild: 'grandChild' });
  });

  it('should support mergeWhen:"parent"', () => {
    const parentData     = new MetaTagData({ name: { parent: 'parent' } });
    const childData      = new MetaTagData({ mergeWhen: 'parent', name: { child: 'child' } });
    const grandChildData = new MetaTagData({ name: { grandChild: 'grandChild' } });

    const mergedAsChild  = metaTag.mergePath([parentData, childData]);
    const mergedAsParent = metaTag.mergePath([parentData, childData, grandChildData]);

    expect(mergedAsChild.name).toEqual({ child: 'child' });
    expect(mergedAsParent.name)
      .toEqual({ parent: 'parent', child: 'child', grandChild: 'grandChild' });
  });

  it('should concat title of current route with base', () => {
    const curData = new MetaTagData({ title: 'cur' });

    const merged = metaTag.mergePath([curData]);

    expect(merged.title).toEqual('cur | Base');
  });

  it('should use title of current route when factory is null', () => {
    metaTag.config = new MetaTagModuleConfig({ titleFactory: null });
    const curData  = new MetaTagData({ title: 'cur' });

    const merged = metaTag.mergePath([curData]);

    expect(merged.title).toEqual('cur');
  });
});

@Component({
  template: ''
})
class TestComponent {
}

@Component({
  selector: 'root-cmp',
  template: '<router-outlet></router-outlet> <router-outlet name="aux"></router-outlet>'
})
class RootComponent {
}

@NgModule({
  imports:         [RouterTestingModule],
  declarations:    [TestComponent, RootComponent],
  entryComponents: [TestComponent, RootComponent],
  exports:         [TestComponent, RootComponent]
})
class TestModule {

}

function advance(f: ComponentFixture<any>) {
  tick();
  f.detectChanges();
}

function createRoot<C>(router: Router, root: Type<C>): ComponentFixture<C> {
  const f = TestBed.createComponent(root);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
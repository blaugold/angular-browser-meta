import { Component, NgModule, Type } from '@angular/core'
import { Meta } from '@angular/platform-browser'
import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { MetaTagService } from './meta-tag.service'
import { RouterDataService } from '../core'
import { MetaTagData } from './meta-tag-data'
import { metaTagModuleConfig } from './meta-tag-module-config'

const ROUTES = () => [
  {
    path:      'all',
    component: TestComponent,
    data:      {
      meta: new MetaTagData({
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
        name: {
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
      meta: new MetaTagData({})
    }
  },
];

class MetaElementServiceMock {
  add() {}

  remove() {}
}

describe('MetaTagService', () => {
  let metaTag: MetaTagService;
  let router: Router;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [
        RouterTestingModule.withRoutes(ROUTES()),
        TestModule
      ],
      providers: [
        Meta,
        { provide: metaTagModuleConfig, useValue: {} },
        MetaTagService,
        RouterDataService
      ],
    });

    metaTag = TestBed.get(MetaTagService);
    router  = TestBed.get(Router);
    meta    = TestBed.get(Meta);

    spyOn(meta, 'addTag');
    spyOn(meta, 'removeTag');
  });

  it('should be instantiated', () => {
    expect(metaTag).toBeDefined();
  });

  it('should set name tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.all', name: 'all', content: 'all' });
  }));

  it('should set httpEquiv tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.HttpEquiv.all', httpEquiv: 'all', content: 'all' });
  }));

  it('should set property tags', fakeAsync(() => {
    const fixture = createRoot(router, RootComponent);

    router.navigateByUrl('/all');
    advance(fixture);

    expect(meta.addTag)
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
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.Name.a"');
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.HttpEquiv.a"');
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.Property.a"');
  }));

  it('should reset dom when route changes', fakeAsync(() => {
    metaTag.reset();
    metaTag.update(new MetaTagData({
      name:      { a: 'a' },
      httpEquiv: { a: 'a' },
      property:  { a: 'a' },
    }));
    metaTag.reset();
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.Name.a"');
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.HttpEquiv.a"');
    expect(meta.removeTag).toHaveBeenCalledWith('id="browser-meta.Property.a"');
  }));

  it('should keep overridden metadata when meta data changes', () => {
    metaTag.reset();

    metaTag.update(new MetaTagData({ name: { a: 'a' }, }));
    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'a' });

    metaTag.set('a', 'b');
    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });

    metaTag.update(new MetaTagData({}));
    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });
  });

  it('should reset overridden metadata when route changes', () => {
    metaTag.reset();

    metaTag.set('a', 'b');
    expect(meta.addTag)
      .toHaveBeenCalledWith({ id: 'browser-meta.Name.a', name: 'a', content: 'b' });

    metaTag.reset();
    metaTag.update(new MetaTagData());
    expect(meta.addTag).toHaveBeenCalledTimes(1);
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
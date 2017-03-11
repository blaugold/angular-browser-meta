import { Component } from '@angular/core'
import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { Router } from '@angular/router'
import { Title, Meta } from '@angular/platform-browser'
import { MetaTagModule } from './meta-tag'
import { TitleModule } from './title'

describe('Integration', () => {
  let router: Router;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MetaTagModule.forRoot(),
        TitleModule.forRoot(),
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [
        ComponentWithOutlet
      ]
    });

    router = TestBed.get(Router);
    title  = TestBed.get(Title);
    meta   = TestBed.get(Meta);
  });

  it('TitleService should work', fakeAsync(() => {
    const root = TestBed.createComponent(ComponentWithOutlet);

    advance(root);

    router.navigateByUrl('foo');

    advance(root);

    expect(title.getTitle()).toBe('foo')
  }));

  it('MetaTagService should work', fakeAsync(() => {
    const root = TestBed.createComponent(ComponentWithOutlet);

    advance(root);

    router.navigateByUrl('foo');

    advance(root);

    expect(meta.getTag('name="keywords"').content).toBe('foo')
  }))
});

@Component({
  template: '<router-outlet></router-outlet>'
})
class ComponentWithOutlet {
}

const routes = [
  {
    path:      'foo',
    component: ComponentWithOutlet,
    data:      {
      title: 'foo',
      meta:  {
        name: {
          keywords: 'foo'
        }
      }
    }
  }
];

function advance<T>(f: ComponentFixture<T>) {
  tick();
  f.detectChanges();
}
import { TestBed } from '@angular/core/testing'
import { Title } from '@angular/platform-browser'
import { Subject } from 'rxjs'

import { RouterDataService } from '../core'
import { titleModuleConfig, TitleModuleConfig } from './title-module-config'
import { TitleService } from './title.service'

class TitleMock {
  setTitle() {}
}

class RouterDataMock {
  $path = new Subject();
  $data = new Subject();
}

describe('TitleService', () => {
  let titleMock: TitleMock;
  let titleService: TitleService;
  let routerDataMock: RouterDataMock;
  let config: TitleModuleConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Title, useClass: TitleMock },
        { provide: titleModuleConfig, useValue: { defaultTitle: 'd' } },
        { provide: RouterDataService, useClass: RouterDataMock },
        TitleService
      ]
    })
  });

  beforeEach(() => {
    titleMock      = TestBed.get(Title);
    titleService   = TestBed.get(TitleService);
    routerDataMock = TestBed.get(RouterDataService);
    config         = TestBed.get(titleModuleConfig);
  });

  beforeEach(() => {
    spyOn(titleMock, 'setTitle');
  });

  it('should use default title if there is no title in data', () => {
    expect(titleService.getTitle([])).toBe('d');
  });

  it('should use default title factory to get title', () => {
    spyOn(config, 'titleFactory');
    titleService.getTitle([{ title: 't' }]);
    expect(config.titleFactory).toHaveBeenCalledWith('d', 't');
  });

  it('should use title from last route', () => {
    spyOn(config, 'titleFactory');
    titleService.getTitle([{ title: 'a' }, { title: 'b' }]);
    expect(config.titleFactory).toHaveBeenCalledWith('d', 'b');
  });

  it('should not update if title was overridden', () => {
    titleService.setTitle('o');
    titleService.update('u');
    expect(titleMock.setTitle).toHaveBeenCalledTimes(1);
  });

  it('should reset override on reset', () => {
    titleService.setTitle('o');
    titleService.reset();
    titleService.update('u');
    expect(titleMock.setTitle).toHaveBeenCalledTimes(2);
  });

  it('should reset on route change', () => {
    spyOn(titleService, 'reset');
    routerDataMock.$path.next();
    expect(titleService.reset).toHaveBeenCalledTimes(1);
  });

  it('should update on data change', () => {
    spyOn(titleService, 'update');
    routerDataMock.$path.next();
    routerDataMock.$data.next([]);
    expect(titleService.update).toHaveBeenCalledTimes(1);
  });
});
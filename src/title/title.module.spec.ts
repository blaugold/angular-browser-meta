import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { TitleModule } from './title.module'

describe('TitleModule', () => {
  let titleModule: TitleModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TitleModule.forRoot(), RouterTestingModule]
    });

    titleModule = TestBed.get(TitleModule);
  });

  it('should ensure TitleService is running when module is used', () => {
    expect(titleModule.titleService).toBeTruthy()
  })
});
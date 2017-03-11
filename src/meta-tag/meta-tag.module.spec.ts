import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MetaTagModule } from './meta-tag.module'

describe('MetaTagModule', () => {
  let metaTagModule: MetaTagModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MetaTagModule.forRoot(), RouterTestingModule]
    });

    metaTagModule = TestBed.get(MetaTagModule);
  });

  it('should ensure MetaTagService is running when module is used', () => {
    expect(metaTagModule.metaTagService).toBeTruthy()
  })
});
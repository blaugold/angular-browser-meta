import { NgModule, ModuleWithProviders } from '@angular/core'

import { MetaTagService } from './meta-tag.service'
import { BMCoreModule } from '../core'
import { MetaTagModuleConfig, metaTagModuleConfig } from './meta-tag-module-config'

@NgModule({
  imports: [
    BMCoreModule
  ]
})
export class MetaTagModule {
  static forRoot(config: MetaTagModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule:  MetaTagModule,
      providers: [
        { provide: metaTagModuleConfig, useValue: config },
        MetaTagService,
      ]
    };
  }
}

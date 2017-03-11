import { NgModule, ModuleWithProviders } from '@angular/core'
import { Meta } from '@angular/platform-browser'
import { BMCoreModule } from '../core'
import { MetaTagModuleConfig, metaTagModuleConfig } from './meta-tag-module-config'
import { MetaTagService } from './meta-tag.service'

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
        Meta,
        MetaTagService
      ]
    };
  }

  // Inject `MetaTagService` to bootstrap it when this module is used.
  constructor(public /** @internal */ metaTagService: MetaTagService) {}
}

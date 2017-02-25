import { NgModule, ModuleWithProviders } from '@angular/core'
import { Meta } from '@angular/platform-browser'

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
        Meta
      ]
    };
  }
}

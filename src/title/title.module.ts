import { NgModule, ModuleWithProviders } from '@angular/core'
import { Title } from '@angular/platform-browser'

import { BMCoreModule } from '../core'
import { TitleModuleConfig, titleModuleConfig } from './title-module-config'
import { TitleService } from './title.service'

@NgModule({
  imports: [
    BMCoreModule
  ]
})
export class TitleModule {
  static forRoot(config: TitleModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule:  TitleModule,
      providers: [
        { provide: titleModuleConfig, useValue: config },
        Title,
        TitleService
      ],
    }
  }

  // Inject `TitleService` to bootstrap it when this module is used.
  constructor(public /** @internal */ titleService: TitleService) {}
}
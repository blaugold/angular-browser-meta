import { NgModule, ModuleWithProviders } from '@angular/core'
import { SchemaService, WebsiteSchemaService, BreadcrumbSchemaService } from '../schemas'
import { MetaTagService, MetaTagModuleConfig } from './meta-tag.service'
import { BMCoreModule } from '../core'

@NgModule({
  imports: [
    BMCoreModule
  ]
})
export class MetaTagModule {
  static forRoot(config: MetaTagModuleConfig): ModuleWithProviders {
    return {
      ngModule:  MetaTagModule,
      providers: [
        {
          provide:  MetaTagModuleConfig,
          useValue: config
        },
        MetaTagService,
        SchemaService,
        WebsiteSchemaService,
        BreadcrumbSchemaService,
      ]
    };
  }
}

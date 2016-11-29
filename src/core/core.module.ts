import { NgModule } from '@angular/core'

import { MetaElementService, ScriptElementService } from './'

@NgModule({
  providers: [
    MetaElementService,
    ScriptElementService
  ]
})
export class BMCoreModule {

}

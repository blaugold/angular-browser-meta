import { NgModule } from '@angular/core'

import { MetaElementService, ScriptElementService, RouterDataService } from './'

@NgModule({
  providers: [
    MetaElementService,
    ScriptElementService,
    RouterDataService
  ]
})
export class BMCoreModule {

}

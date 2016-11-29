import { NgModule } from '@angular/core'

import { MetaElementService } from './meta-element.service'
import { RouterDataService } from './router-data.service'

@NgModule({
  providers: [
    MetaElementService,
    RouterDataService
  ]
})
export class BMCoreModule {
}

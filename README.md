## Angular Browser Meta

This module sets Meta Tags and Title from the data property of Routers ActivatedRoute.
Updates happen when data or the route changes.
Overrides are possible by injecting this modules services in components or other services. 

## Installation

```
    npm i --save angular-browser-meta
```

## Usage

```typescript
import { NgModule, Component } from '@angular/core'
import { TitleModule, MetaTagModule, TitleService, MetaTagService } from 'angular-browser-meta'

@NgModule({
    imports: [
        TitleModule.forRoot({ defaultTitle: 'Your App' }),
        MetaTagModule.forRoot(),
    ]
})
export class AppModule {}

@Component({ template: '<router-outlet></router-outlet>' })
export class AppComponent {
  // Inject these services in your root component to start listening to router navigation.
  constructor(titleService: TitleService, metaTagService: MetaTagService) {
    // You can override the data from routes.
    // Updates from data resolvers will not reset overrides but navigation will. 
    metaTagService.set('author', 'Bob');
  }
}


const route = {
  // If data from a resolver changes tags will be updated.
  data: {
    title: 'Page Title', // => Title is set to "Page Title | Your App",
    meta: {
      // Meta tags with name attribute.
      name: {
        // Values are used to set the content prop on a meta element which should be a string. 
        keywords: ['Awesome', 'Todo', 'List'].join(',')
      },
      // Meta tags with property attribute.
      property: {
        'og:image': 'http://ia.media-imdb.com/images/rock.jpg'
      },
      // Meta tags with httpEquiv attribute.
      httpEquiv: {}
    }
  }
}
```

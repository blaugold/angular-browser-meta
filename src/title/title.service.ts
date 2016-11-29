import { Injectable, Inject } from '@angular/core'
import { Data } from '@angular/router'
import { Title } from '@angular/platform-browser'

import { titleModuleConfig, TitleModuleConfig, initConfig } from './title-module-config'
import { RouterDataService } from '../core'

@Injectable()
export class TitleService {

  private titleOverridden = false;

  constructor(@Inject(titleModuleConfig) private config: TitleModuleConfig,
              private routerData: RouterDataService,
              private title: Title) {
    initConfig(config);

    routerData
      .$path
      .do(() => this.reset())
      .switchMap(() => this.routerData.$data)
      .map(data => this.getTitle(data))
      .subscribe(title => this.update(title));
  }

  reset() {
    this.titleOverridden = false;
  }

  update(title: string) {
    if (!this.titleOverridden && title !== undefined) {
      this._setTitle(title);
    }
  }

  setTitle(title: string) {
    this.titleOverridden = true;
    this._setTitle(title);
  }

  private _setTitle(title: string) {
    this.title.setTitle(title);
  }

  getTitle(data: Data[]): string {
    const title = data.reverse()
      .map(data => data[this.config.dataProp])
      .find(title => !!title);

    const defaultTitle = this.config.defaultTitle;

    if (title) {
      if (defaultTitle) {
        return this.config.titleFactory(defaultTitle, title);
      } else {
        return title;
      }
    }

    return defaultTitle;
  }
}
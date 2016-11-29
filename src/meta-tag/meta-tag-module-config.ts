import { OpaqueToken } from '@angular/core'

import { MetaTagData } from './meta-tag-data'

export const metaTagModuleConfig = new OpaqueToken('MetaTagModuleConfig');

export interface MetaTagModuleConfig {
  baseData?: MetaTagData;
  dataProp?: string;
  idPrefix?: string;
}

export function initConfig(config: MetaTagModuleConfig) {
  config.baseData = config.baseData || new MetaTagData({});
  config.dataProp = config.dataProp || 'meta';
  config.idPrefix = config.idPrefix || 'browser-meta';
}

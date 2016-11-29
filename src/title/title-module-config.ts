import { OpaqueToken } from '@angular/core';

export interface TitleFactory {
  (defaultTitle: string, curTitle?: string): string;
}

export const titleModuleConfig = new OpaqueToken('TitleModuleConfig');

export interface TitleModuleConfig {
  defaultTitle?: string;
  titleFactory: TitleFactory;
  dataProp: string;
}

export function initConfig(config: TitleModuleConfig) {
  config.titleFactory = config.titleFactory || defaultTitleFactory;
  config.dataProp     = config.dataProp || 'title';
}

function defaultTitleFactory(defaultTitle: string, curTitle: string): string {
  return `${curTitle} | ${defaultTitle}`;
}

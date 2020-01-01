import { IController } from './ifnode';

export interface IRouteInfo {
  uri: string;
  controller: IController;
}

export interface IHttpRouteInfo extends IRouteInfo {
  method: string;
}

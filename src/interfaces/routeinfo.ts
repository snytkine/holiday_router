import { IControllerContainer } from './ifnode';

export interface IRouteInfo {
  uri: string;
  controller: IControllerContainer;
}

export interface IHttpRouteInfo extends IRouteInfo {
  method: string;
}

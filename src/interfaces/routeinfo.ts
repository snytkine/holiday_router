import { IControllerContainer } from './ifnode';

export interface IRouteInfo<T extends IControllerContainer> {
  uri: string;
  controller: T;
}

export interface IHttpRouteInfo<T extends IControllerContainer> extends IRouteInfo<T> {
  method: string;
}

import { IRouteInfo } from '../interfaces/routeinfo';
import { IControllerContainer } from '../interfaces';

export default class RouteInfo<T extends IControllerContainer> implements IRouteInfo<T> {
  public readonly uri: string;

  public readonly controller: T;

  constructor(uri: string, controller: T) {
    this.uri = uri;
    this.controller = controller;
  }
}

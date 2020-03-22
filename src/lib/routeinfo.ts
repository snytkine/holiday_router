import { IRouteInfo } from '../interfaces/routeinfo';
import { IControllerContainer } from '../interfaces';

export default class RouteInfo implements IRouteInfo {
  public readonly uri: string;

  public readonly controller: IControllerContainer;

  constructor(uri: string, controller: IControllerContainer) {
    this.uri = uri;
    this.controller = controller;
  }
}

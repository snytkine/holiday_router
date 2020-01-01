import { IRouteInfo } from '../interfaces/routeinfo';
import { IController } from '../interfaces';

export default class RouteInfo implements IRouteInfo {
  public readonly uri: string;

  public readonly controller: IController;

  constructor(uri: string, controller: IController) {
    this.uri = uri;
    this.controller = controller;
  }
}

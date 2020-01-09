import Debug from 'debug';
import * as methods from 'methods';
import Router from './router';
import { IController, IHttpRouteInfo, IRouteMatchResult, IStringMap, Node } from './interfaces';
import { RouterError, RouterErrorCode } from './errors';

const debug = Debug('HOLIDAY-ROUTER:router');

export default class HttpRouter<T extends IController> {
  private routers: Map<string, Router<T>> = new Map();

  public getRouteMatch(httpMethod: string, uri: string): IRouteMatchResult<T> {
    debug('Entered HttpRouter.getRouteMatch with method="%s" uri="%s"', httpMethod, uri);
    const methodRouter = this.routers.get(httpMethod);
    if (!methodRouter) {
      debug('HttpRouter.getRouteMatch Http Method "%s" not found in router', httpMethod);
      return undefined;
    }

    return methodRouter.getRouteMatch(uri);
  }

  public addRoute(httpMethod: string, uri: string, controller: T): Node<T> {
    debug(
      'Entered Router.addRoute() with method="%s" uri="%s" controller="%o"',
      httpMethod,
      uri,
      controller,
    );
    const method = httpMethod.toLocaleUpperCase();
    const methodRouter = this.routers.get(method);
    if (methodRouter) {
      return methodRouter.addRoute(uri, controller);
    }

    if (!methods.includes(method.toLocaleLowerCase())) {
      throw new RouterError(
        `Cannot add route for method ${method}`,
        RouterErrorCode.UNSUPPORTED_HTTP_METHOD,
      );
    }

    const router = new Router<T>();
    const ret = router.addRoute(uri, controller);
    this.routers.set(method, router);

    return ret;
  }

  public makeUri(httpMethod: string, controllerId: string, params?: IStringMap): string {
    const methodRouter = this.routers.get(httpMethod);
    if (!methodRouter) {
      throw new RouterError(
        `makeUri failed. No Routes for ${httpMethod} method`,
        RouterErrorCode.UNSUPPORTED_HTTP_METHOD,
      );
    }

    return methodRouter.makeUri(controllerId, params);
  }

  public getAllRoutes(): Array<IHttpRouteInfo> {
    const ret: Array<IHttpRouteInfo>[] = [];

    this.routers.forEach((router, httpMethod) => {
      ret.push(
        router.getAllRoutes().map(routeInfo => {
          return {
            uri: routeInfo.uri,
            controller: routeInfo.controller,
            method: httpMethod,
          };
        }),
      );
    });

    /**
     * Flatten array
     */
    return ret.reduce((prev, curr) => {
      return prev.concat(curr);
    });
  }
}

import Debug from 'debug';
import * as methods from 'methods';
import Router from './router';
import { IController, IRouteMatch, IRouteMatchResult, IStringMap, Node } from './interfaces';
import { RouterError } from './errors';
import RouterErrorCode from './errors/errorcodes';
import { IHttpRouteInfo } from './interfaces/routeinfo';

const debug = Debug('GP-URI-ROUTER:router');

export default class HttpRouter<T extends IController> {
  private routers: Map<string, Router<T>> = new Map();

  /**
   * Important httpMethod is case sensitive, must be passed in lower case
   * @param httpMethod
   * @param uri
   */
  public *findRoutes(httpMethod: string, uri: string): IterableIterator<IRouteMatch<T>> {
    debug('Entered Router.findRoutes() with method="%s" uri="%s"', httpMethod, uri);
    const methodRouter = this.routers.get(httpMethod);
    if (!methodRouter) {
      debug('HttpRouter.findRoutes Http Method "%s" not found in router', httpMethod);
      return undefined;
    }

    return yield* methodRouter.findRoutes(uri);
  }

  public findRoute(httpMethod: string, uri: string): IRouteMatchResult<T> {
    debug('Entered Router.findRoute() with method="%s" uri="%s"', httpMethod, uri);
    const methodRouter = this.routers.get(httpMethod);
    if (!methodRouter) {
      debug('HttpRouter.findRoute Http Method "%s" not found in router', httpMethod);
      return undefined;
    }
    return methodRouter.findRoute(uri);
  }

  public addRoute(httpMethod: string, uri: string, controller: T): Node<T> {
    debug(
      'Entered Router.addRoute() with method="%s" uri="%s" controller="%o"',
      httpMethod,
      uri,
      controller,
    );
    const method = httpMethod.toLocaleLowerCase();
    if (this.routers.has(method)) {
      return this.routers.get(method).addRoute(uri, controller);
    }

    if (!methods.includes(method)) {
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
    const method = httpMethod.toLocaleLowerCase();
    const methodRouter = this.routers.get(method);
    if (!methodRouter) {
      throw new RouterError(
        `makeUri failed. No Routes for ${method} method`,
        RouterErrorCode.UNSUPPORTED_HTTP_METHOD,
      );
    }

    return methodRouter.makeUri(controllerId, params);
  }

  public getAllRoutes(): Array<IHttpRouteInfo> {
    const ret = [];

    for (const [httpMethod, router] of this.routers) {
      ret.push(
        router.getAllRoutes().map(routeInfo => {
          return {
            uri: routeInfo.uri,
            controller: routeInfo.controller,
            method: httpMethod,
          };
        }),
      );
    }

    return ret;
  }
}

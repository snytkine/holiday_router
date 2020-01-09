import { expect } from 'chai';
import HttpRouter from '../../httprouter';
import { BasicController, RouteMatch } from '../../lib';
import { ExactMatchNode, PathParamNode } from '../../nodes';
import { RouterError, RouterErrorCode } from '../../errors';

describe('#HttpRouter tests', () => {
  const uri1 = '/catalog/toys/';
  const uri2 = '/catalog/toys/cars/{make}/{model}';

  const ctrl1 = new BasicController('CTRL-1', 'ctrl1');
  const ctrl2 = new BasicController('CTRL-2', 'ctrl2');
  const ctrl3 = new BasicController('CTRL-3', 'ctrl3');
  const ctrl4 = new BasicController('CTRL-4', 'ctrl4');
  const ctrl5 = new BasicController('CTRL-5', 'ctrl5');
  const ctrl6 = new BasicController('CTRL-6', 'ctrl6');

  describe('#addRoute tests', () => {
    it('should add routes for 3 supported http methods', () => {
      const httpRouter = new HttpRouter();
      const node1 = httpRouter.addRoute('get', uri1, ctrl1);
      const node2 = httpRouter.addRoute('get', uri2, ctrl2);

      const node3 = httpRouter.addRoute('post', uri1, ctrl1);
      const node4 = httpRouter.addRoute('post', uri2, ctrl2);

      expect(node1).to.be.instanceOf(ExactMatchNode);
      expect(node2).to.be.instanceOf(PathParamNode);

      expect(node3).to.be.instanceOf(ExactMatchNode);
      expect(node4).to.be.instanceOf(PathParamNode);
    });

    it('should throw RouterException if trying to add unsupported http method', () => {
      let ret: RouterError | undefined;

      try {
        const httpRouter = new HttpRouter();
        httpRouter.addRoute('question', uri1, ctrl1);
      } catch (e) {
        ret = e;
      }

      expect(ret).to.be.instanceOf(RouterError);
      // @ts-ignore
      expect(ret.code).to.equal(RouterErrorCode.UNSUPPORTED_HTTP_METHOD);
    });
  });

  describe('#getRouteMatch tests', () => {
    const httpRouter = new HttpRouter();
    httpRouter.addRoute('get', uri1, ctrl1);
    httpRouter.addRoute('get', uri2, ctrl2);
    httpRouter.addRoute('post', uri1, ctrl3);
    httpRouter.addRoute('post', uri2, ctrl4);
    httpRouter.addRoute('post', uri1, ctrl5);
    httpRouter.addRoute('post', uri2, ctrl6);

    it('getRouteMatch should return iterator matching httpMethod and uri', () => {
      const res = <RouteMatch<BasicController<string>>>(
        httpRouter.getRouteMatch('GET', '/catalog/toys/cars/honda/crv')
      );

      expect(res).to.be.instanceOf(RouteMatch);
      expect(res.node.controllers.length).to.equal(1);
      expect(res.node.controllers[0].id).to.equal('ctrl2');
    });

    it('getRouteMatch should return undefined if route for httpMethod does not exist for uri', () => {
      const res = httpRouter.getRouteMatch('put', '/catalog/toys/cars/honda/crv');
      expect(res).to.equal(undefined);
    });
  });

  describe('#makeUri tests', () => {
    const httpRouter = new HttpRouter();
    httpRouter.addRoute('get', uri1, ctrl1);
    httpRouter.addRoute('get', uri2, ctrl2);
    httpRouter.addRoute('post', uri1, ctrl3);
    httpRouter.addRoute('post', uri2, ctrl4);
    httpRouter.addRoute('post', uri1, ctrl5);
    httpRouter.addRoute('post', uri2, ctrl6);

    it('.makeUri should return uri string if matching controller found', () => {
      const url = httpRouter.makeUri('GET', 'ctrl2', {
        make: 'honda',
        model: 'crv',
      });

      expect(url).to.equal('/catalog/toys/cars/honda/crv');
    });

    it('.makeUri should throw RouterError if http method is not supported', () => {
      let res: RouterError;
      try {
        httpRouter.makeUri('something', 'ctrl2', {
          make: 'honda',
          model: 'crv',
        });
      } catch (e) {
        res = e;
      }

      expect(res.code).to.equal(RouterErrorCode.UNSUPPORTED_HTTP_METHOD);
    });
  });

  describe('#getAllRoutes test', () => {
    const httpRouter = new HttpRouter();
    httpRouter.addRoute('get', uri1, ctrl1);
    httpRouter.addRoute('get', uri2, ctrl2);
    httpRouter.addRoute('post', uri1, ctrl3);
    httpRouter.addRoute('post', uri2, ctrl4);
    httpRouter.addRoute('post', uri1, ctrl5);
    httpRouter.addRoute('post', uri2, ctrl6);
    it('#Should return array of route objects', () => {
      const res = httpRouter.getAllRoutes();
      expect(res).to.deep.equal([
        {
          uri: '/catalog/toys/',
          controller: { priority: 1, controller: 'CTRL-1', id: 'ctrl1' },
          method: 'GET',
        },
        {
          uri: '/catalog/toys/cars/{make}/{model}',
          controller: { priority: 1, controller: 'CTRL-2', id: 'ctrl2' },
          method: 'GET',
        },
        {
          uri: '/catalog/toys/',
          controller: { priority: 1, controller: 'CTRL-3', id: 'ctrl3' },
          method: 'POST',
        },
        {
          uri: '/catalog/toys/',
          controller: { priority: 1, controller: 'CTRL-5', id: 'ctrl5' },
          method: 'POST',
        },
        {
          uri: '/catalog/toys/cars/{make}/{model}',
          controller: { priority: 1, controller: 'CTRL-4', id: 'ctrl4' },
          method: 'POST',
        },
        {
          uri: '/catalog/toys/cars/{make}/{model}',
          controller: { priority: 1, controller: 'CTRL-6', id: 'ctrl6' },
          method: 'POST',
        },
      ]);
    });
  });
});

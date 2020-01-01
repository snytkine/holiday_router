import { expect } from 'chai';
import HttpRouter from '../../httprouter';
import { BasicController } from '../../lib';
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
      let ret: RouterError;
      try {
        const httpRouter = new HttpRouter();
        httpRouter.addRoute('question', uri1, ctrl1);
      } catch (e) {
        ret = e;
      }

      expect(ret).to.be.instanceOf(RouterError);
      expect(ret.code).to.equal(RouterErrorCode.UNSUPPORTED_HTTP_METHOD);
    });
  });

  describe('#findRoutes tests', () => {
    const httpRouter = new HttpRouter();
    httpRouter.addRoute('get', uri1, ctrl1);
    httpRouter.addRoute('get', uri2, ctrl2);
    httpRouter.addRoute('post', uri1, ctrl3);
    httpRouter.addRoute('post', uri2, ctrl4);
    httpRouter.addRoute('post', uri1, ctrl5);
    httpRouter.addRoute('post', uri2, ctrl6);

    it('findRoutes should return iterator matching httpMethod and uri', () => {
      const res = httpRouter.findRoutes('get', '/catalog/toys/cars/honda/crv');
      const routeMatches = Array.from(res);
      expect(routeMatches.length).to.equal(1);
      expect(routeMatches[0].controller.id).to.equal('ctrl2');
    });

    it('findRoutes should return undefined if route for httpMethod does not exist for uri', () => {
      const res = httpRouter.findRoutes('put', '/catalog/toys/cars/honda/crv');
      expect(res.next().value).to.equal(undefined);
    });
  });
});

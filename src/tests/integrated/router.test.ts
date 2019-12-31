import { expect } from 'chai';
import { BasicController, RouterError, RouterErrorCode, UniqueController } from '../..';
import { IRouteMatch } from '../../interfaces';
import Router from '../../router';

describe('#Integrated Router test', () => {
  const uri1 = '/catalog/toys/';
  const uri2 = '/catalog/toys/cars/{make}/{model}';
  const uri3 = '/catalog/toys/cars/{make}/mymodel-{model-x}-item/id-{id}.html';
  const uri4 = '/catalog/toys/cars/{id:widget-([0-9]+)(green|red)}/{year:([0-9]{4})}';
  const uri5 = '/catalog/toys/cars/{make}/mymodel-{model-x}';

  const ctrl1 = new BasicController('CTRL-1', 'ctrl1');
  const ctrl2 = new BasicController('CTRL-2', 'ctrl2');
  const ctrl3 = new BasicController('CTRL-3', 'ctrl3');
  const ctrl4 = new BasicController('CTRL-4', 'ctrl4');
  const ctrl5 = new BasicController('CTRL-5', 'ctrl5');
  const ctrl6 = new BasicController('CTRL-6', 'ctrl6');

  const router = new Router();
  router.addRoute(uri1, ctrl1);
  router.addRoute(uri2, ctrl2);
  router.addRoute(uri3, ctrl3);
  router.addRoute(uri4, ctrl4);
  router.addRoute(uri5, ctrl5);

  /**
   * Add extra controller to same route
   */
  router.addRoute(uri2, ctrl6);

  describe('#findRoute tests', () => {
    it('#findRoutes should return iterator of routeMatches', () => {
      const res = router.findRoutes('/catalog/toys/cars/honda/crv');
      const routeMatches = Array.from(res);

      expect(routeMatches.length).to.equal(2);
      expect(routeMatches[0].controller.id).to.equal('ctrl2');
      expect(routeMatches[1].controller.id).to.equal('ctrl6');
    });

    it('#findRoute Should find matching route', () => {
      const res1 = <IRouteMatch<BasicController<string>>>router.findRoute('/catalog/toys/');

      expect(res1.controller.id).to.equal('ctrl1');
      expect(res1.node.name).to.equal('ExactMathNode::toys/');
    });

    it('#findRoute Should find route with extracted path parameters', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/toyota/rav4')
      );
      expect(res.controller.id).to.equal('ctrl2');

      expect(res.node.name).to.equal(`PathParamNode::model::''::''`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'make',
          paramValue: 'toyota',
        },
        {
          paramName: 'model',
          paramValue: 'rav4',
        },
      ]);
    });

    it('#findRoute should find route with path params in 2 uri segments', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/gm/mymodel-gtx-item/id-35.html')
      );
      expect(res.controller.id).to.equal('ctrl3');

      expect(res.node.name).to.equal(`PathParamNode::id::'id-'::'.html'`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'make',
          paramValue: 'gm',
        },
        {
          paramName: 'model-x',
          paramValue: 'gtx',
        },
        {
          paramName: 'id',
          paramValue: '35',
        },
      ]);
    });

    it('#findRoute should find route with regex params', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/widget-678green/2015')
      );
      expect(res.controller.id).to.equal('ctrl4');

      expect(res.node.name).to.equal(`PathParamNodeRegex::'year'::'^([0-9]{4})$'::''::''`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'id',
          paramValue: 'widget-678green',
        },
        {
          paramName: 'year',
          paramValue: '2015',
        },
      ]);

      expect(res.params.regexParams).to.deep.equal([
        {
          paramName: 'id',
          params: ['widget-678green', '678', 'green'],
        },
        {
          paramName: 'year',
          params: ['2015', '2015'],
        },
      ]);
    });

    it('.addRoute with 2 urls that start with "/" should add just one child node "/"', () => {
      const rtr = new Router();
      const controller = new BasicController('controller1', 'ctrl1');
      const controller2 = new BasicController('controller1', 'ctrl2');

      rtr.addRoute('/path1', controller);
      rtr.addRoute('/path2', controller2);

      expect(rtr.rootNode.children.length).to.equal(1);
    });

    it('should not find matching regex route if regex param did not match but find next matching route', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/widget-678yellow/2015')
      );

      expect(res.controller.id).to.equal('ctrl2');

      expect(res.node.name).to.equal(`PathParamNode::model::''::''`);
    });

    it('should not find matching route if uri does not match any added routes', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/books/cars/widget-678yellow/2015')
      );

      expect(res).to.be.undefined;
    });

    it('.addRoute with empty url should add controller', () => {
      const rtr = new Router();
      const controller = new UniqueController('rootController');
      rtr.addRoute('', controller);

      expect(rtr.rootNode.controllers[0]).to.equal(controller);
    });
  });

  describe('#getAllRoutes test', () => {
    it('#Should return array of route objects', () => {
      const res = router.getAllRoutes();
      expect(
        res.sort((item1, item2) => {
          return item1.controller.id > item2.controller.id ? 1 : -1;
        }),
      ).to.deep.equal([
        { uri: uri1, controller: ctrl1 },
        { uri: uri2, controller: ctrl2 },
        { uri: uri3, controller: ctrl3 },
        { uri: uri4, controller: ctrl4 },
        { uri: uri5, controller: ctrl5 },
        { uri: uri2, controller: ctrl6 },
      ]);
    });
  });

  describe('#makeUri tests', () => {
    it('Should create full url for ctrl2', () => {
      const url = router.makeUri('ctrl2', {
        make: 'honda',
        model: 'crv',
      });

      expect(url).to.equal('/catalog/toys/cars/honda/crv');
    });

    it('Should create full url for ctrl3', () => {
      const url = router.makeUri('ctrl3', {
        make: 'toyota',
        'model-x': 'rav4',
        id: 'xle',
      });

      expect(url).to.equal('/catalog/toys/cars/toyota/mymodel-rav4-item/id-xle.html');
    });

    it('Should create full url with regex pattern in url for ctrl4', () => {
      const url = router.makeUri('ctrl4', {
        year: '2020',
        id: 'widget-123red',
      });

      expect(url).to.equal('/catalog/toys/cars/widget-123red/2020');
    });

    it('Should throw RouteError if controller not found by id', () => {
      let res: RouterError;
      try {
        router.makeUri('ctrlX', {
          year: '2020',
          id: 'widget-123red',
        });
      } catch (e) {
        res = e;
      }

      expect(res).to.be.instanceOf(RouterError);
      expect(res.code).to.be.equal(RouterErrorCode.CONTROLLER_NOT_FOUND);
    });
  });
});

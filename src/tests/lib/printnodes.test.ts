import {
  BasicController,
  printControllers,
  printNode,
  UniqueController
} from '../../lib'
import { expect } from 'chai';
import {
  ExactMatchNode,
  PathParamNode,
  RootNode
} from '../../nodes'

const PRINT_CONTROLLERS_RES = `
           * Controller BasicController id=ctrl1 priority=1
           * Controller BasicController id=ctrl2 priority=2`;

const PRINT_NODES_RES = `
     || ====================================
     || node=RootNode
     || priority=1
     || Controllers=0
     || children (2) 
         || ====================================
         || node=ExactMathNode::path1/
         || priority=100000000
         || Controllers=1
           * Controller UniqueController id=UniqueController priority=1
         || children (1) 
             || ====================================
             || node=PathParamNode::category::''::'/'
             || priority=10001
             || Controllers=0
             || children (1) 
                 || ====================================
                 || node=PathParamNode::id::'order-'::'.html'
                 || priority=10011
                 || Controllers=2
                   * Controller BasicController id=ctrl2 priority=2
                   * Controller BasicController id=ctrl1 priority=1
                 || children (0) 
                 || ====================================
             || ====================================
         || ====================================
         || ====================================
         || node=ExactMathNode::path2/
         || priority=100000000
         || Controllers=0
         || children (0) 
         || ====================================
     || ====================================`;

describe('#printnodes', () => {

  describe('#printcontrollers', () => {
    it('#should print array of 2 controllers', () => {
      const ctrl1 = new BasicController<string>('controller1', 'ctrl1', 1);
      const ctrl2 = new BasicController<string>('controller1', 'ctrl2', 2);

      const res = printControllers([ctrl1, ctrl2]);
      expect(res)
      .to
      .equal(PRINT_CONTROLLERS_RES)
    })

    it('#should print empty string if empty array is passed', () => {

      const res = printControllers([]);
      expect(res)
      .to
      .equal('')
    })
  })


  describe('#printnodes', () => {

    const rootNode = new RootNode();
    const node2 = new ExactMatchNode('path1/');
    node2.addController(new UniqueController('path1 controller'))
    const node3 = new ExactMatchNode('path2/');

    const node4 = new PathParamNode('category', '/');
    const nodeWithPrefixAndPostfix = new PathParamNode('id', '.html', 'order-');

    nodeWithPrefixAndPostfix.addController(new BasicController('controller1', 'ctrl1',));
    nodeWithPrefixAndPostfix.addController(new BasicController('controller2', 'ctrl2', 2));
    node4.addChildNode(nodeWithPrefixAndPostfix);
    node2.addChildNode(node4);

    rootNode.addChildNode(node2);
    rootNode.addChildNode(node3);

    it('#Should print node tree with controllers', () => {
      const res = printNode(rootNode);
      expect(res)
      .to
      .equal(PRINT_NODES_RES)
    })
  })
})

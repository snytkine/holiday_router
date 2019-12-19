import { expect } from 'chai';
import { BasicController } from '../../lib'

describe('#BasicController.ts test', () => {
  describe('#BasicController object test', () => {
    const ctrl = new BasicController<string>('controller1', 'id1', 5);

    it('should have .controller property with value "controller1"', () => {
      expect(ctrl.controller)
      .to
      .equal('controller1')
    })

    it('should have .id property with value "id1"', () => {
      expect(ctrl.id)
      .to
      .equal('id1')
    })

    it('should have .priority property with value 5', () => {
      expect(ctrl.priority)
      .to
      .equal(5)
    })

    it('equals should be true if another controller is BasicController with same controller prop', () => {
      const isEqual = ctrl.equals(new BasicController('controller1'));
      expect(isEqual)
        .to
        .be
        .true
    })

    it('equals should be false if another controller is BasicController with different controller prop', () => {
      const isEqual = ctrl.equals(new BasicController('controller2'));
      expect(isEqual)
        .to
        .be
        .false
    })
  })
})

import { UniqueController } from '../../lib'
import { expect } from 'chai';

describe('#UniqueController object test', () => {
  const ctrl1 = new UniqueController<string>('controller1', 'ctrl1')
  const ctrl2 = new UniqueController<string>('controller2', 'ctrl2', 2)

  it('ctrl1 is instance of UniqueController', () => {
    expect(ctrl1)
    .to
    .be
    .instanceOf(UniqueController)
  })

  it('ctrl2 is instance of UniqueController', () => {
    expect(ctrl1)
    .to
    .be
    .instanceOf(UniqueController)
  })

  it('ctrl1 has .controller prop with value', () => {
    expect(ctrl1.controller)
    .to
    .equal('controller1')
  })

  it('ctrl1 has .id prop with value ctrl1', () => {
    expect(ctrl1.id)
    .to
    .equal('ctrl1')
  })

  it('ctrl1 has .priority prop with value 1', () => {
    expect(ctrl1.priority)
    .to
    .equal(1)
  })

  it('ctrl2 has .controller prop with value', () => {
    expect(ctrl2.controller)
    .to
    .equal('controller2')
  })

  it('ctrl2 has .priority prop with value 2', () => {
    expect(ctrl2.priority)
    .to
    .equal(2)
  })

  it('ctrl1 equals to ctrl2 even when they have different controller and different id', () => {
    expect(ctrl1.equals(ctrl2)).to.be.true
  })
})

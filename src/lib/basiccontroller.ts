import { IController } from '../interfaces';

/**
 * A simple wrapper object to conveniently
 * generate controller objects.
 *
 *
 */
export default class BasicController<T> implements IController {
  public controller;

  public readonly priority;

  public readonly id;

  constructor(controller: T, id: string = 'BasicController', priority = 1) {
    this.priority = priority;
    this.controller = controller;
    this.id = id;
  }

  public equals(other: IController) {
    return other instanceof BasicController && other.controller === this.controller;
  }

  public toString() {
    return `${this.constructor.name} id=${this.id} priority=${this.priority}`;
  }
}

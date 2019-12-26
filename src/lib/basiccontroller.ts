import { IController } from '../interfaces';

/**
 * A simple wrapper object to conveniently
 * generate controller objects.
 *
 *
 */
export class BasicController<T> implements IController {
  constructor(
    public controller: T,
    public id: string = 'BasicController',
    public readonly priority = 1,
  ) {}

  public equals(other: IController) {
    return other instanceof BasicController && other.controller === this.controller;
  }

  public toString() {
    return `${this.constructor.name} id=${this.id} priority=${this.priority}`;
  }
}

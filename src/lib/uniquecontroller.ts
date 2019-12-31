import Debug from 'debug';
import { IController } from '../interfaces';
import BasicController from './basiccontroller';

const debug = Debug('GP-URI-ROUTER:NODE:lib');

/**
 * UniqueController always returns true from equals() method
 * so any other controller is considered equals, making it
 * impossible to add any other controller to the node that
 * already has a UniqueController or to add UniqueController
 * to any node that already has any other controller
 */
export default class UniqueController<T> extends BasicController<T> implements IController {
  private readonly isUnique = true;

  constructor(
    public controller: T,
    public readonly id: string = 'UniqueController',
    public readonly priority = 1,
  ) {
    super(controller, id, priority);
  }

  /**
   * To make a controller unique it must
   * return true from equals() method.
   * This will make it impossible
   * to add 2 of these controllers to the same node.
   * @param controller
   */
  public equals(other: IController): boolean {
    debug('Entered UniqueController.equals with other="%s"', other.id);
    return this.isUnique;
  }
}

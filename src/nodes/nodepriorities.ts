/**
 * Router nodes will be sorted by priority
 * Node with higher priority (based on node type)
 * will be tried first
 * Order of node types in this enum is important
 * it should be ordered from low to high - root node is lowest priority (0)
 * and exactmatch node should be highest.
 */
export enum PRIORITY {
  ROOT,
  CATCHALL,
  PATHPARAM,
  REGEX,
  EXACTMATCH,
}

export const getNodePriority = (nodeType: PRIORITY): number => {
  return 100 ** nodeType;
};

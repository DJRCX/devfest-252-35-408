import { BuildingData, RouteResult, SimulationState } from './types';

export function compareNodeSequences(seqA: string[], seqB: string[]): number {
  const len = Math.min(seqA.length, seqB.length);
  for (let i = 0; i < len; i++) {
    if (seqA[i] < seqB[i]) return -1;
    if (seqA[i] > seqB[i]) return 1;
  }
  return seqA.length - seqB.length;
}

export function findEvacuationRoute(
  data: BuildingData,
  startNodeId: string | null,
  state: SimulationState
): RouteResult {
  if (!startNodeId) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
    };
  }

  // Check if start node is blocked
  if (state.blockedNodes.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      path: [startNodeId],
      edgeIds: [],
      totalCost: 0,
    };
  }

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const startNode = nodeMap.get(startNodeId);
  if (!startNode || (startNode.type !== 'room' && startNode.type !== 'junction')) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
    };
  }

  // Pre-build edge lookup between pairs of nodes
  const edgePairMap = new Map<string, string>();
  for (const edge of data.edges) {
    edgePairMap.set(`${edge.from}---${edge.to}`, edge.id);
    edgePairMap.set(`${edge.to}---${edge.from}`, edge.id);
  }

  // Build adjacency list excluding blocked nodes, blocked edges, and closed exits
  // Notice: A closed exit cannot be entered/crossed as an intermediate node, nor reached as an exit destination.
  // A blocked node cannot be entered or crossed, and all corridors attached to it become unusable.
  const adj = new Map<string, Array<{ neighbor: string; cost: number; edgeId: string }>>();
  for (const node of data.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of data.edges) {
    // Check if edge is explicitly blocked
    if (state.blockedEdges.has(edge.id)) {
      continue;
    }

    // Check if either incident node is blocked
    if (state.blockedNodes.has(edge.from) || state.blockedNodes.has(edge.to)) {
      continue;
    }

    // Check closed exits: closed exits cannot be used as intermediate nodes or destinations
    if (state.closedExits.has(edge.from) || state.closedExits.has(edge.to)) {
      continue;
    }

    adj.get(edge.from)?.push({ neighbor: edge.to, cost: edge.cost, edgeId: edge.id });
    adj.get(edge.to)?.push({ neighbor: edge.from, cost: edge.cost, edgeId: edge.id });
  }

  // Dijkstra from startNodeId
  const dist = new Map<string, number>();
  const bestPaths = new Map<string, string[]>();

  for (const node of data.nodes) {
    dist.set(node.id, Infinity);
  }

  dist.set(startNodeId, 0);
  bestPaths.set(startNodeId, [startNodeId]);

  // Set of unvisited nodes
  const visited = new Set<string>();

  // Priority-based Dijkstra
  while (true) {
    let u: string | null = null;
    let uDist = Infinity;
    let uPath: string[] | null = null;

    // Pick smallest distance; on ties, lexicographically smallest path
    for (const [nodeId, d] of dist.entries()) {
      if (visited.has(nodeId) || d === Infinity) continue;
      const path = bestPaths.get(nodeId)!;

      if (d < uDist) {
        uDist = d;
        u = nodeId;
        uPath = path;
      } else if (d === uDist) {
        if (!uPath || compareNodeSequences(path, uPath) < 0) {
          u = nodeId;
          uPath = path;
        }
      }
    }

    if (!u || uDist === Infinity) {
      break;
    }

    visited.add(u);

    // If u is an open exit, do not expand neighbors from an exit
    // (Exits are terminal destinations, and cannot be used as intermediate transit nodes to other exits)
    const uNode = nodeMap.get(u);
    if (uNode?.type === 'exit') {
      continue;
    }

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      const v = edge.neighbor;
      if (visited.has(v)) continue;

      const newDist = uDist + edge.cost;
      const currentDist = dist.get(v)!;
      const candPath = [...uPath!, v];

      if (newDist < currentDist) {
        dist.set(v, newDist);
        bestPaths.set(v, candPath);
      } else if (newDist === currentDist) {
        const existingPath = bestPaths.get(v);
        if (!existingPath || compareNodeSequences(candPath, existingPath) < 0) {
          bestPaths.set(v, candPath);
        }
      }
    }
  }

  // Find all open, reachable exits
  const openExits = data.nodes.filter(
    (n) => n.type === 'exit' && !state.closedExits.has(n.id) && (dist.get(n.id) ?? Infinity) < Infinity
  );

  if (openExits.length === 0) {
    return {
      status: 'NO_ROUTE',
      path: [],
      edgeIds: [],
      totalCost: 0,
    };
  }

  // Find minimum cost among reachable open exits
  let minCost = Infinity;
  for (const exit of openExits) {
    const d = dist.get(exit.id)!;
    if (d < minCost) {
      minCost = d;
    }
  }

  // Filter exits that achieve minimum cost
  const bestExits = openExits.filter((exit) => dist.get(exit.id) === minCost);

  // Tie-breaking:
  // "Choose the reachable open exit with minimum cost. On equal cost, choose the lexicographically smallest exit ID;
  // if paths to that exit also tie, choose the lexicographically smallest sequence of node IDs."
  bestExits.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;

    const pathA = bestPaths.get(a.id) || [];
    const pathB = bestPaths.get(b.id) || [];
    return compareNodeSequences(pathA, pathB);
  });

  const chosenExit = bestExits[0];
  const finalPath = bestPaths.get(chosenExit.id) || [];

  // Extract edges used
  const edgeIds: string[] = [];
  for (let i = 0; i < finalPath.length - 1; i++) {
    const from = finalPath[i];
    const to = finalPath[i + 1];
    const edgeId = edgePairMap.get(`${from}---${to}`);
    if (edgeId) {
      edgeIds.push(edgeId);
    }
  }

  return {
    status: 'SUCCESS',
    path: finalPath,
    edgeIds,
    exitId: chosenExit.id,
    totalCost: minCost,
  };
}

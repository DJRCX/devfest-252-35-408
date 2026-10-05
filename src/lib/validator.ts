import { BuildingData, BuildingNode, BuildingEdge } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: BuildingData;
}

export function validateBuildingData(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Invalid JSON: Expected a root JSON object.' };
  }

  const obj = raw as Record<string, any>;

  // 1. building
  if (typeof obj.building !== 'string' || obj.building.trim().length === 0) {
    return { valid: false, error: 'Invalid building name: "building" must be a non-empty string.' };
  }

  // 2. nodes array
  if (!Array.isArray(obj.nodes)) {
    return { valid: false, error: 'Invalid nodes: "nodes" must be an array.' };
  }
  if (obj.nodes.length < 2 || obj.nodes.length > 60) {
    return {
      valid: false,
      error: `Node count out of range: must have between 2 and 60 nodes (found ${obj.nodes.length}).`
    };
  }

  // 3. edges array
  if (!Array.isArray(obj.edges)) {
    return { valid: false, error: 'Invalid edges: "edges" must be an array.' };
  }
  if (obj.edges.length < 1 || obj.edges.length > 150) {
    return {
      valid: false,
      error: `Edge count out of range: must have between 1 and 150 edges (found ${obj.edges.length}).`
    };
  }

  // 4. Validate nodes
  const nodeMap = new Map<string, BuildingNode>();
  let hasRoomOrJunction = false;
  let hasExit = false;

  for (let i = 0; i < obj.nodes.length; i++) {
    const n = obj.nodes[i];
    if (!n || typeof n !== 'object') {
      return { valid: false, error: `Node at index ${i} is not a valid object.` };
    }
    if (typeof n.id !== 'string' || n.id.trim().length === 0) {
      return { valid: false, error: `Node at index ${i} has an invalid or missing "id".` };
    }
    if (nodeMap.has(n.id)) {
      return { valid: false, error: `Duplicate node ID detected: "${n.id}".` };
    }
    if (typeof n.label !== 'string' || n.label.trim().length === 0) {
      return { valid: false, error: `Node "${n.id}" has an empty or missing "label".` };
    }
    if (!['room', 'junction', 'exit'].includes(n.type)) {
      return {
        valid: false,
        error: `Node "${n.id}" has invalid type "${n.type}". Expected "room", "junction", or "exit".`
      };
    }
    if (typeof n.x !== 'number' || !Number.isFinite(n.x) || typeof n.y !== 'number' || !Number.isFinite(n.y)) {
      return { valid: false, error: `Node "${n.id}" has non-numeric coordinates (x: ${n.x}, y: ${n.y}).` };
    }

    if (n.type === 'room' || n.type === 'junction') {
      hasRoomOrJunction = true;
    }
    if (n.type === 'exit') {
      hasExit = true;
    }

    nodeMap.set(n.id, {
      id: n.id,
      label: n.label,
      type: n.type,
      x: n.x,
      y: n.y,
    });
  }

  if (!hasRoomOrJunction) {
    return { valid: false, error: 'Building must have at least one room or junction.' };
  }
  if (!hasExit) {
    return { valid: false, error: 'Building must have at least one exit.' };
  }

  // 5. Validate edges
  const edgeMap = new Map<string, BuildingEdge>();
  const seenPairs = new Set<string>();

  for (let i = 0; i < obj.edges.length; i++) {
    const e = obj.edges[i];
    if (!e || typeof e !== 'object') {
      return { valid: false, error: `Edge at index ${i} is not a valid object.` };
    }
    if (typeof e.id !== 'string' || e.id.trim().length === 0) {
      return { valid: false, error: `Edge at index ${i} has an invalid or missing "id".` };
    }
    if (edgeMap.has(e.id)) {
      return { valid: false, error: `Duplicate edge ID detected: "${e.id}".` };
    }
    if (typeof e.from !== 'string' || !nodeMap.has(e.from)) {
      return { valid: false, error: `Edge "${e.id}" references non-existent "from" node "${e.from}".` };
    }
    if (typeof e.to !== 'string' || !nodeMap.has(e.to)) {
      return { valid: false, error: `Edge "${e.id}" references non-existent "to" node "${e.to}".` };
    }
    if (e.from === e.to) {
      return { valid: false, error: `Edge "${e.id}" is a self-loop on node "${e.from}".` };
    }

    // Check repeated node pairs (undirected)
    const pairKey = e.from < e.to ? `${e.from}---${e.to}` : `${e.to}---${e.from}`;
    if (seenPairs.has(pairKey)) {
      return { valid: false, error: `Repeated edge detected between nodes "${e.from}" and "${e.to}".` };
    }
    seenPairs.add(pairKey);

    if (typeof e.cost !== 'number' || !Number.isInteger(e.cost) || e.cost <= 0) {
      return { valid: false, error: `Edge "${e.id}" must have a positive integer cost (got ${e.cost}).` };
    }

    edgeMap.set(e.id, {
      id: e.id,
      from: e.from,
      to: e.to,
      cost: e.cost,
    });
  }

  // 6. Validate initial_state
  if (!obj.initial_state || typeof obj.initial_state !== 'object' || Array.isArray(obj.initial_state)) {
    return { valid: false, error: 'Missing or invalid "initial_state" object.' };
  }

  const { blocked_nodes, blocked_edges, closed_exits } = obj.initial_state;

  if (!Array.isArray(blocked_nodes)) {
    return { valid: false, error: '"initial_state.blocked_nodes" must be an array.' };
  }
  for (const nodeId of blocked_nodes) {
    if (typeof nodeId !== 'string') {
      return { valid: false, error: `Invalid entry in blocked_nodes: ${nodeId}` };
    }
    const node = nodeMap.get(nodeId);
    if (!node) {
      return { valid: false, error: `blocked_nodes references non-existent node "${nodeId}".` };
    }
    if (node.type !== 'room' && node.type !== 'junction') {
      return {
        valid: false,
        error: `Node "${nodeId}" in blocked_nodes is of type "${node.type}". Only rooms or junctions can be blocked_nodes.`
      };
    }
  }

  if (!Array.isArray(blocked_edges)) {
    return { valid: false, error: '"initial_state.blocked_edges" must be an array.' };
  }
  for (const edgeId of blocked_edges) {
    if (typeof edgeId !== 'string') {
      return { valid: false, error: `Invalid entry in blocked_edges: ${edgeId}` };
    }
    if (!edgeMap.has(edgeId)) {
      return { valid: false, error: `blocked_edges references non-existent edge "${edgeId}".` };
    }
  }

  if (!Array.isArray(closed_exits)) {
    return { valid: false, error: '"initial_state.closed_exits" must be an array.' };
  }
  for (const exitId of closed_exits) {
    if (typeof exitId !== 'string') {
      return { valid: false, error: `Invalid entry in closed_exits: ${exitId}` };
    }
    const node = nodeMap.get(exitId);
    if (!node) {
      return { valid: false, error: `closed_exits references non-existent node "${exitId}".` };
    }
    if (node.type !== 'exit') {
      return {
        valid: false,
        error: `Node "${exitId}" in closed_exits is of type "${node.type}". Only exits can be closed_exits.`
      };
    }
  }

  return {
    valid: true,
    data: {
      building: obj.building.trim(),
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values()),
      initial_state: {
        blocked_nodes: [...blocked_nodes],
        blocked_edges: [...blocked_edges],
        closed_exits: [...closed_exits],
      },
    },
  };
}

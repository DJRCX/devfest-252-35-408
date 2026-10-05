import { BuildingData, BuildingNode, BuildingEdge } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorBn?: string;
  data?: BuildingData;
}

const fail = (error: string, errorBn: string): ValidationResult => ({ valid: false, error, errorBn });

export function validateBuildingData(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('Invalid JSON: Expected a root JSON object.', 'অবৈধ JSON: মূল অংশটি একটি JSON অবজেক্ট হতে হবে।');
  }

  const obj = raw as Record<string, any>;

  // 1. building
  if (typeof obj.building !== 'string' || obj.building.trim().length === 0) {
    return fail(
      'Invalid building name: "building" must be a non-empty string.',
      'অবৈধ ভবনের নাম: "building" একটি খালি নয় এমন স্ট্রিং হতে হবে।'
    );
  }

  // 2. nodes array
  if (!Array.isArray(obj.nodes)) {
    return fail('Invalid nodes: "nodes" must be an array.', 'অবৈধ নোড: "nodes" একটি অ্যারে হতে হবে।');
  }
  if (obj.nodes.length < 2 || obj.nodes.length > 60) {
    return fail(
      `Node count out of range: must have between 2 and 60 nodes (found ${obj.nodes.length}).`,
      `নোড সংখ্যা সীমার বাইরে: ২ থেকে ৬০টি নোড থাকতে হবে (পাওয়া গেছে ${obj.nodes.length})।`
    );
  }

  // 3. edges array
  if (!Array.isArray(obj.edges)) {
    return fail('Invalid edges: "edges" must be an array.', 'অবৈধ করিডোর: "edges" একটি অ্যারে হতে হবে।');
  }
  if (obj.edges.length < 1 || obj.edges.length > 150) {
    return fail(
      `Edge count out of range: must have between 1 and 150 edges (found ${obj.edges.length}).`,
      `করিডোর সংখ্যা সীমার বাইরে: ১ থেকে ১৫০টি করিডোর থাকতে হবে (পাওয়া গেছে ${obj.edges.length})।`
    );
  }

  // 4. Validate nodes
  const nodeMap = new Map<string, BuildingNode>();
  let hasRoomOrJunction = false;
  let hasExit = false;

  for (let i = 0; i < obj.nodes.length; i++) {
    const n = obj.nodes[i];
    if (!n || typeof n !== 'object') {
      return fail(`Node at index ${i} is not a valid object.`, `ইনডেক্স ${i}-এর নোডটি বৈধ অবজেক্ট নয়।`);
    }
    if (typeof n.id !== 'string' || n.id.trim().length === 0) {
      return fail(
        `Node at index ${i} has an invalid or missing "id".`,
        `ইনডেক্স ${i}-এর নোডের "id" অবৈধ বা অনুপস্থিত।`
      );
    }
    if (nodeMap.has(n.id)) {
      return fail(`Duplicate node ID detected: "${n.id}".`, `একই নোড আইডি একাধিকবার পাওয়া গেছে: "${n.id}"।`);
    }
    if (typeof n.label !== 'string' || n.label.trim().length === 0) {
      return fail(
        `Node "${n.id}" has an empty or missing "label".`,
        `নোড "${n.id}"-এর "label" খালি বা অনুপস্থিত।`
      );
    }
    if (!['room', 'junction', 'exit'].includes(n.type)) {
      return fail(
        `Node "${n.id}" has invalid type "${n.type}". Expected "room", "junction", or "exit".`,
        `নোড "${n.id}"-এর ধরন "${n.type}" অবৈধ। "room", "junction" অথবা "exit" হতে হবে।`
      );
    }
    if (typeof n.x !== 'number' || !Number.isFinite(n.x) || typeof n.y !== 'number' || !Number.isFinite(n.y)) {
      return fail(
        `Node "${n.id}" has non-numeric coordinates (x: ${n.x}, y: ${n.y}).`,
        `নোড "${n.id}"-এর স্থানাঙ্ক সংখ্যাসূচক নয় (x: ${n.x}, y: ${n.y})।`
      );
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
    return fail('Building must have at least one room or junction.', 'ভবনে অন্তত একটি রুম বা জাংশন থাকতে হবে।');
  }
  if (!hasExit) {
    return fail('Building must have at least one exit.', 'ভবনে অন্তত একটি প্রস্থান থাকতে হবে।');
  }

  // 5. Validate edges
  const edgeMap = new Map<string, BuildingEdge>();
  const seenPairs = new Set<string>();

  for (let i = 0; i < obj.edges.length; i++) {
    const e = obj.edges[i];
    if (!e || typeof e !== 'object') {
      return fail(`Edge at index ${i} is not a valid object.`, `ইনডেক্স ${i}-এর করিডোরটি বৈধ অবজেক্ট নয়।`);
    }
    if (typeof e.id !== 'string' || e.id.trim().length === 0) {
      return fail(
        `Edge at index ${i} has an invalid or missing "id".`,
        `ইনডেক্স ${i}-এর করিডোরের "id" অবৈধ বা অনুপস্থিত।`
      );
    }
    if (edgeMap.has(e.id)) {
      return fail(`Duplicate edge ID detected: "${e.id}".`, `একই করিডোর আইডি একাধিকবার পাওয়া গেছে: "${e.id}"।`);
    }
    if (typeof e.from !== 'string' || !nodeMap.has(e.from)) {
      return fail(
        `Edge "${e.id}" references non-existent "from" node "${e.from}".`,
        `করিডোর "${e.id}"-এর "from" নোড "${e.from}" বিদ্যমান নেই।`
      );
    }
    if (typeof e.to !== 'string' || !nodeMap.has(e.to)) {
      return fail(
        `Edge "${e.id}" references non-existent "to" node "${e.to}".`,
        `করিডোর "${e.id}"-এর "to" নোড "${e.to}" বিদ্যমান নেই।`
      );
    }
    if (e.from === e.to) {
      return fail(
        `Edge "${e.id}" is a self-loop on node "${e.from}".`,
        `করিডোর "${e.id}" নোড "${e.from}"-এ নিজের সাথেই যুক্ত (সেলফ-লুপ)।`
      );
    }

    // Check repeated node pairs (undirected)
    const pairKey = e.from < e.to ? `${e.from}---${e.to}` : `${e.to}---${e.from}`;
    if (seenPairs.has(pairKey)) {
      return fail(
        `Repeated edge detected between nodes "${e.from}" and "${e.to}".`,
        `নোড "${e.from}" ও "${e.to}"-এর মধ্যে একাধিক করিডোর পাওয়া গেছে।`
      );
    }
    seenPairs.add(pairKey);

    if (typeof e.cost !== 'number' || !Number.isInteger(e.cost) || e.cost <= 0) {
      return fail(
        `Edge "${e.id}" must have a positive integer cost (got ${e.cost}).`,
        `করিডোর "${e.id}"-এর ব্যয় একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে (পাওয়া গেছে ${e.cost})।`
      );
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
    return fail('Missing or invalid "initial_state" object.', '"initial_state" অবজেক্টটি অনুপস্থিত বা অবৈধ।');
  }

  const { blocked_nodes, blocked_edges, closed_exits } = obj.initial_state;

  if (!Array.isArray(blocked_nodes)) {
    return fail('"initial_state.blocked_nodes" must be an array.', '"initial_state.blocked_nodes" একটি অ্যারে হতে হবে।');
  }
  for (const nodeId of blocked_nodes) {
    if (typeof nodeId !== 'string') {
      return fail(`Invalid entry in blocked_nodes: ${nodeId}`, `blocked_nodes-এ অবৈধ মান: ${nodeId}`);
    }
    const node = nodeMap.get(nodeId);
    if (!node) {
      return fail(
        `blocked_nodes references non-existent node "${nodeId}".`,
        `blocked_nodes-এ উল্লিখিত নোড "${nodeId}" বিদ্যমান নেই।`
      );
    }
    if (node.type !== 'room' && node.type !== 'junction') {
      return fail(
        `Node "${nodeId}" in blocked_nodes is of type "${node.type}". Only rooms or junctions can be blocked_nodes.`,
        `blocked_nodes-এর নোড "${nodeId}"-এর ধরন "${node.type}"। শুধু রুম বা জাংশন অবরুদ্ধ করা যায়।`
      );
    }
  }

  if (!Array.isArray(blocked_edges)) {
    return fail('"initial_state.blocked_edges" must be an array.', '"initial_state.blocked_edges" একটি অ্যারে হতে হবে।');
  }
  for (const edgeId of blocked_edges) {
    if (typeof edgeId !== 'string') {
      return fail(`Invalid entry in blocked_edges: ${edgeId}`, `blocked_edges-এ অবৈধ মান: ${edgeId}`);
    }
    if (!edgeMap.has(edgeId)) {
      return fail(
        `blocked_edges references non-existent edge "${edgeId}".`,
        `blocked_edges-এ উল্লিখিত করিডোর "${edgeId}" বিদ্যমান নেই।`
      );
    }
  }

  if (!Array.isArray(closed_exits)) {
    return fail('"initial_state.closed_exits" must be an array.', '"initial_state.closed_exits" একটি অ্যারে হতে হবে।');
  }
  for (const exitId of closed_exits) {
    if (typeof exitId !== 'string') {
      return fail(`Invalid entry in closed_exits: ${exitId}`, `closed_exits-এ অবৈধ মান: ${exitId}`);
    }
    const node = nodeMap.get(exitId);
    if (!node) {
      return fail(
        `closed_exits references non-existent node "${exitId}".`,
        `closed_exits-এ উল্লিখিত নোড "${exitId}" বিদ্যমান নেই।`
      );
    }
    if (node.type !== 'exit') {
      return fail(
        `Node "${exitId}" in closed_exits is of type "${node.type}". Only exits can be closed_exits.`,
        `closed_exits-এর নোড "${exitId}"-এর ধরন "${node.type}"। শুধু প্রস্থান বন্ধ করা যায়।`
      );
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

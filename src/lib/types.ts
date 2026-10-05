export type NodeType = 'room' | 'junction' | 'exit';

export interface BuildingNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface BuildingEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface InitialState {
  blocked_nodes: string[];
  blocked_edges: string[];
  closed_exits: string[];
}

export interface BuildingData {
  building: string;
  nodes: BuildingNode[];
  edges: BuildingEdge[];
  initial_state: InitialState;
}

export interface SimulationState {
  blockedNodes: Set<string>;
  blockedEdges: Set<string>;
  closedExits: Set<string>;
}

export type RouteStatus = 'SUCCESS' | 'START_BLOCKED' | 'NO_ROUTE';

export interface RouteResult {
  status: RouteStatus;
  path: string[];
  edgeIds: string[];
  exitId?: string;
  totalCost: number;
}

export type Language = 'en' | 'bn';

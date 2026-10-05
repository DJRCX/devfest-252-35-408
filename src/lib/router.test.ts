import { describe, it, expect } from 'vitest';
import { findEvacuationRoute, compareNodeSequences } from './router';
import { BuildingData, SimulationState } from './types';
import sampleBuilding from '../../building.json';

describe('Evacuation Router', () => {
  const building = sampleBuilding as BuildingData;

  const createInitialState = (data: BuildingData): SimulationState => ({
    blockedNodes: new Set(data.initial_state.blocked_nodes),
    blockedEdges: new Set(data.initial_state.blocked_edges),
    closedExits: new Set(data.initial_state.closed_exits),
  });

  // Section 4.1 Check 1: Baseline
  it('Scenario 1 (Baseline): Select R1 -> R1 - C1 - C2 - E1; cost 7', () => {
    const state = createInitialState(building);
    const result = findEvacuationRoute(building, 'R1', state);

    expect(result.status).toBe('SUCCESS');
    expect(result.path).toEqual(['R1', 'C1', 'C2', 'E1']);
    expect(result.exitId).toBe('E1');
    expect(result.totalCost).toBe(7);
    expect(result.edgeIds).toEqual(['L01', 'L02', 'L03']);
  });

  // Section 4.1 Check 2: Blocked junction
  it('Scenario 2 (Blocked junction): Select R1; block C2 -> R1 - C1 - C3 - C4 - E2; cost 11', () => {
    const state = createInitialState(building);
    state.blockedNodes.add('C2');

    const result = findEvacuationRoute(building, 'R1', state);

    expect(result.status).toBe('SUCCESS');
    expect(result.path).toEqual(['R1', 'C1', 'C3', 'C4', 'E2']);
    expect(result.exitId).toBe('E2');
    expect(result.totalCost).toBe(11);
  });

  // Section 4.1 Check 3: Exits closed
  it('Scenario 3 (Exits closed): Select R1; close E1 and E2 -> No route available', () => {
    const state = createInitialState(building);
    state.closedExits.add('E1');
    state.closedExits.add('E2');

    const result = findEvacuationRoute(building, 'R1', state);

    expect(result.status).toBe('NO_ROUTE');
    expect(result.path).toEqual([]);
    expect(result.totalCost).toBe(0);
  });

  // Section 4.1 Check 4: Different start
  it('Scenario 4 (Different start): Select R2 -> R2 - C3 - C4 - E2; cost 7', () => {
    const state = createInitialState(building);
    const result = findEvacuationRoute(building, 'R2', state);

    expect(result.status).toBe('SUCCESS');
    expect(result.path).toEqual(['R2', 'C3', 'C4', 'E2']);
    expect(result.exitId).toBe('E2');
    expect(result.totalCost).toBe(7);
  });

  // Section 4.1 Check 5: Blocked start
  it('Scenario 5 (Blocked start): Select R1; then block R1 -> Starting location blocked', () => {
    const state = createInitialState(building);
    state.blockedNodes.add('R1');

    const result = findEvacuationRoute(building, 'R1', state);

    expect(result.status).toBe('START_BLOCKED');
    expect(result.path).toEqual(['R1']);
  });

  // Tie-breaking: Equal cost exit tie
  it('Tie breaking: Choose lexicographically smallest exit ID on cost tie', () => {
    const tieGraph: BuildingData = {
      building: 'Tie Graph',
      nodes: [
        { id: 'R1', label: 'Start Room', type: 'room', x: 0, y: 0 },
        { id: 'EB', label: 'Exit B', type: 'exit', x: 10, y: 0 },
        { id: 'EA', label: 'Exit A', type: 'exit', x: 0, y: 10 },
      ],
      edges: [
        { id: 'E1', from: 'R1', to: 'EB', cost: 5 },
        { id: 'E2', from: 'R1', to: 'EA', cost: 5 },
      ],
      initial_state: {
        blocked_nodes: [],
        blocked_edges: [],
        closed_exits: [],
      },
    };

    const state = createInitialState(tieGraph);
    const result = findEvacuationRoute(tieGraph, 'R1', state);

    expect(result.status).toBe('SUCCESS');
    expect(result.exitId).toBe('EA'); // EA < EB lexicographically
    expect(result.path).toEqual(['R1', 'EA']);
    expect(result.totalCost).toBe(5);
  });

  // Tie-breaking: Equal cost path tie to same exit
  it('Tie breaking: Choose lexicographically smallest node sequence when paths tie', () => {
    const tiePathGraph: BuildingData = {
      building: 'Tie Path Graph',
      nodes: [
        { id: 'R1', label: 'Start Room', type: 'room', x: 0, y: 0 },
        { id: 'J2', label: 'Junction 2', type: 'junction', x: 5, y: 0 },
        { id: 'J1', label: 'Junction 1', type: 'junction', x: 5, y: 5 },
        { id: 'EX', label: 'Exit', type: 'exit', x: 10, y: 0 },
      ],
      edges: [
        { id: 'E1', from: 'R1', to: 'J2', cost: 2 },
        { id: 'E2', from: 'J2', to: 'EX', cost: 2 },
        { id: 'E3', from: 'R1', to: 'J1', cost: 2 },
        { id: 'E4', from: 'J1', to: 'EX', cost: 2 },
      ],
      initial_state: {
        blocked_nodes: [],
        blocked_edges: [],
        closed_exits: [],
      },
    };

    const state = createInitialState(tiePathGraph);
    const result = findEvacuationRoute(tiePathGraph, 'R1', state);

    expect(result.status).toBe('SUCCESS');
    expect(result.path).toEqual(['R1', 'J1', 'EX']); // J1 < J2
    expect(result.totalCost).toBe(4);
  });

  // Closed exit cannot be intermediate node
  it('Closed exit cannot be traversed as an intermediate node', () => {
    const exitBridgeGraph: BuildingData = {
      building: 'Closed Exit Bridge',
      nodes: [
        { id: 'R1', label: 'Start Room', type: 'room', x: 0, y: 0 },
        { id: 'E1', label: 'Intermediate Exit', type: 'exit', x: 5, y: 0 },
        { id: 'E2', label: 'Target Exit', type: 'exit', x: 10, y: 0 },
      ],
      edges: [
        { id: 'E1_edge', from: 'R1', to: 'E1', cost: 1 },
        { id: 'E2_edge', from: 'E1', to: 'E2', cost: 1 },
      ],
      initial_state: {
        blocked_nodes: [],
        blocked_edges: [],
        closed_exits: ['E1'], // E1 is closed
      },
    };

    const state = createInitialState(exitBridgeGraph);
    const result = findEvacuationRoute(exitBridgeGraph, 'R1', state);

    // Cannot reach E2 via closed E1
    expect(result.status).toBe('NO_ROUTE');
  });
});

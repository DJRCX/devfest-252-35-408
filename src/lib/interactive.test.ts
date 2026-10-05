import { describe, it, expect } from 'vitest';
import sampleBuilding from '../../building.json';
import { BuildingData, SimulationState } from '../lib/types';
import { findEvacuationRoute } from '../lib/router';
import { validateBuildingData } from '../lib/validator';

describe('Interactive Functional Flow Tests', () => {
  const data = sampleBuilding as BuildingData;

  it('Scenario 1: Baseline works', () => {
    const state: SimulationState = {
      blockedNodes: new Set(data.initial_state.blocked_nodes),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(data.initial_state.closed_exits),
    };
    const route = findEvacuationRoute(data, 'R1', state);
    expect(route.status).toBe('SUCCESS');
    expect(route.exitId).toBe('E1');
    expect(route.totalCost).toBe(7);
  });

  it('Scenario 2: Block Junction C2 updates route immediately to E2 with cost 11', () => {
    const state: SimulationState = {
      blockedNodes: new Set([...data.initial_state.blocked_nodes, 'C2']),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(data.initial_state.closed_exits),
    };
    const route = findEvacuationRoute(data, 'R1', state);
    expect(route.status).toBe('SUCCESS');
    expect(route.exitId).toBe('E2');
    expect(route.totalCost).toBe(11);
    expect(route.path).toEqual(['R1', 'C1', 'C3', 'C4', 'E2']);
  });

  it('Scenario 3: Close E1 and E2 results in NO_ROUTE', () => {
    const state: SimulationState = {
      blockedNodes: new Set(data.initial_state.blocked_nodes),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(['E1', 'E2']),
    };
    const route = findEvacuationRoute(data, 'R1', state);
    expect(route.status).toBe('NO_ROUTE');
  });

  it('Scenario 4: Start R2 routes to E2 with cost 7', () => {
    const state: SimulationState = {
      blockedNodes: new Set(data.initial_state.blocked_nodes),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(data.initial_state.closed_exits),
    };
    const route = findEvacuationRoute(data, 'R2', state);
    expect(route.status).toBe('SUCCESS');
    expect(route.exitId).toBe('E2');
    expect(route.totalCost).toBe(7);
    expect(route.path).toEqual(['R2', 'C3', 'C4', 'E2']);
  });

  it('Scenario 5: Block Start R1 results in START_BLOCKED', () => {
    const state: SimulationState = {
      blockedNodes: new Set([...data.initial_state.blocked_nodes, 'R1']),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(data.initial_state.closed_exits),
    };
    const route = findEvacuationRoute(data, 'R1', state);
    expect(route.status).toBe('START_BLOCKED');
  });
});

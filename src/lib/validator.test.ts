import { describe, it, expect } from 'vitest';
import { validateBuildingData } from './validator';
import sampleBuilding from '../../building.json';

describe('Building Data Validator', () => {
  it('successfully validates the official building.json', () => {
    const res = validateBuildingData(sampleBuilding);
    expect(res.valid).toBe(true);
    expect(res.data?.building).toBe('East Annex - Practice Building');
    expect(res.data?.nodes.length).toBe(8);
    expect(res.data?.edges.length).toBe(9);
  });

  it('rejects missing or empty building name', () => {
    const invalid = { ...sampleBuilding, building: '   ' };
    const res = validateBuildingData(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('building');
  });

  it('rejects node count < 2 or > 60', () => {
    const tooFew = { ...sampleBuilding, nodes: [sampleBuilding.nodes[0]] };
    const resFew = validateBuildingData(tooFew);
    expect(resFew.valid).toBe(false);
    expect(resFew.error).toContain('between 2 and 60 nodes');

    const manyNodes = Array.from({ length: 61 }, (_, i) => ({
      id: `N${i}`,
      label: `Node ${i}`,
      type: i === 0 ? 'exit' : 'room',
      x: i * 10,
      y: 0,
    }));
    const tooMany = { ...sampleBuilding, nodes: manyNodes };
    const resMany = validateBuildingData(tooMany);
    expect(resMany.valid).toBe(false);
    expect(resMany.error).toContain('between 2 and 60 nodes');
  });

  it('rejects duplicate node ID', () => {
    const duplicate = {
      ...sampleBuilding,
      nodes: [
        ...sampleBuilding.nodes,
        { id: 'R1', label: 'Duplicate R1', type: 'room', x: 10, y: 10 },
      ],
    };
    const res = validateBuildingData(duplicate);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Duplicate node ID');
  });

  it('rejects self-loops in edges', () => {
    const loop = {
      ...sampleBuilding,
      edges: [
        ...sampleBuilding.edges,
        { id: 'SELF', from: 'R1', to: 'R1', cost: 5 },
      ],
    };
    const res = validateBuildingData(loop);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('self-loop');
  });

  it('rejects repeated edge pairs (undirected)', () => {
    const repeated = {
      ...sampleBuilding,
      edges: [
        ...sampleBuilding.edges,
        { id: 'DUP_EDGE', from: 'C1', to: 'R1', cost: 5 }, // L01 is R1-C1
      ],
    };
    const res = validateBuildingData(repeated);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Repeated edge');
  });

  it('rejects non-positive or non-integer costs', () => {
    const zeroCost = {
      ...sampleBuilding,
      edges: [{ id: 'BAD_COST', from: 'R1', to: 'C1', cost: 0 }],
    };
    expect(validateBuildingData(zeroCost).valid).toBe(false);

    const floatCost = {
      ...sampleBuilding,
      edges: [{ id: 'BAD_FLOAT', from: 'R1', to: 'C1', cost: 2.5 }],
    };
    expect(validateBuildingData(floatCost).valid).toBe(false);
  });

  it('rejects inconsistent initial_state entries', () => {
    // blocked node cannot be an exit
    const exitBlocked = {
      ...sampleBuilding,
      initial_state: {
        blocked_nodes: ['E1'], // E1 is an exit!
        blocked_edges: [],
        closed_exits: [],
      },
    };
    const resExit = validateBuildingData(exitBlocked);
    expect(resExit.valid).toBe(false);
    expect(resExit.error).toContain('Only rooms or junctions can be blocked_nodes');

    // closed exit cannot be a room
    const roomClosed = {
      ...sampleBuilding,
      initial_state: {
        blocked_nodes: [],
        blocked_edges: [],
        closed_exits: ['R1'], // R1 is a room!
      },
    };
    const resRoom = validateBuildingData(roomClosed);
    expect(resRoom.valid).toBe(false);
    expect(resRoom.error).toContain('Only exits can be closed_exits');
  });
});

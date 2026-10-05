import fs from 'fs';
import { execSync } from 'child_process';

const buildingData = JSON.parse(fs.readFileSync('./building.json', 'utf-8'));

function generateSvgForScenario({
  scenarioName,
  startNodeId,
  blockedNodes = [],
  blockedEdges = [],
  closedExits = [],
  routePath = [],
  routeEdges = [],
  totalCost = 0,
  targetExit = '',
}) {
  const nodeMap = new Map(buildingData.nodes.map(n => [n.id, n]));
  const activePathEdges = new Set(routeEdges);
  const activePathNodes = new Set(routePath);
  const blockedNodesSet = new Set(blockedNodes);
  const blockedEdgesSet = new Set(blockedEdges);
  const closedExitsSet = new Set(closedExits);

  const edgeElements = buildingData.edges.map(edge => {
    const u = nodeMap.get(edge.from);
    const v = nodeMap.get(edge.to);
    if (!u || !v) return '';

    const isBlocked = blockedEdgesSet.has(edge.id);
    const isIncidentNodeBlocked = blockedNodesSet.has(edge.from) || blockedNodesSet.has(edge.to);
    const isRouteEdge = activePathEdges.has(edge.id);
    const midX = (u.x + v.x) / 2;
    const midY = (u.y + v.y) / 2;

    const strokeColor = isBlocked || isIncidentNodeBlocked ? '#ef4444' : isRouteEdge ? '#059669' : '#cbd5e1';
    const strokeWidth = isRouteEdge ? 6 : 4;
    const dashArray = isBlocked ? '6,6' : 'none';

    return `
      <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" />
      <g transform="translate(${midX}, ${midY})">
        <rect x="-18" y="-11" width="36" height="22" rx="11" fill="${isRouteEdge ? '#ecfdf5' : isBlocked ? '#fef2f2' : '#ffffff'}" stroke="${isRouteEdge ? '#059669' : isBlocked ? '#ef4444' : '#cbd5e1'}" stroke-width="1.5" />
        ${isBlocked ? '<path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#dc2626" stroke-width="2" stroke-linecap="round" />' : `<text text-anchor="middle" dominant-baseline="central" fill="${isRouteEdge ? '#047857' : '#334155'}" font-size="11" font-weight="bold" font-family="monospace">${edge.cost}</text>`}
      </g>
    `;
  }).join('');

  const allY = buildingData.nodes.map(n => n.y);
  const midY = (Math.min(...allY) + Math.max(...allY)) / 2;

  const nodeElements = buildingData.nodes.map(node => {
    const isStart = node.id === startNodeId;
    const isBlocked = blockedNodesSet.has(node.id);
    const isClosed = closedExitsSet.has(node.id);
    const isRouteNode = activePathNodes.has(node.id);

    let shape = '';
    const fillColor = isBlocked
      ? '#fef2f2'
      : isStart
      ? '#e0f2fe'
      : isRouteNode
      ? (node.type === 'exit' ? '#dcfce7' : '#ecfdf5')
      : isClosed
      ? '#f1f5f9'
      : node.type === 'exit'
      ? '#ecfdf5'
      : '#ffffff';

    const strokeColor = isBlocked
      ? '#ef4444'
      : isStart
      ? '#0284c7'
      : isRouteNode
      ? '#059669'
      : isClosed
      ? '#ef4444'
      : node.type === 'exit'
      ? '#10b981'
      : '#94a3b8';

    if (node.type === 'room') {
      shape = `<rect x="-24" y="-24" width="48" height="48" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isStart || isRouteNode || isBlocked ? '3' : '2'}" />`;
    } else if (node.type === 'junction') {
      shape = `<rect x="-21" y="-21" width="42" height="42" rx="8" transform="rotate(45)" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isStart || isRouteNode || isBlocked ? '3' : '2'}" />`;
    } else if (node.type === 'exit') {
      shape = `<rect x="-26" y="-26" width="52" height="52" rx="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isRouteNode ? '3.5' : '2'}" />`;
    }

    const textColor = isBlocked ? '#991b1b' : isStart ? '#0369a1' : (isRouteNode && node.type === 'exit') ? '#047857' : '#0f172a';
    const labelY = node.y <= midY ? -38 : 38;

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isStart ? '<circle r="34" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4,4" />' : ''}
        ${shape}
        <text text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-size="13" font-weight="bold" font-family="monospace">${node.id}</text>
        ${isStart ? '<g transform="translate(19,-19)"><circle r="9" fill="#0284c7" stroke="#fff" stroke-width="1.5" /><path d="M -3 -3 L 3 0 L -3 3 Z" fill="#fff" /></g>' : ''}
        ${isBlocked ? '<g transform="translate(19,-19)"><circle r="9" fill="#dc2626" stroke="#fff" stroke-width="1.5" /><path d="M -3 -3 L 3 3 M 3 -3 L -3 3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></g>' : ''}
        ${isClosed ? '<g transform="translate(19,-19)"><circle r="9" fill="#dc2626" stroke="#fff" stroke-width="1.5" /><path d="M -3 0 L 3 0 L 3 4 L -3 4 Z" fill="#fff" /><path d="M -2 0 L -2 -2 A 2 2 0 0 1 2 -2 L 2 0" fill="none" stroke="#fff" stroke-width="1.2" /></g>' : ''}
        <text y="${labelY}" text-anchor="middle" fill="#475569" font-size="10" font-family="sans-serif" font-weight="600">${node.label}</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <style>
      text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>
  </defs>
  <!-- Background -->
  <rect width="1000" height="700" fill="#f8fafc" />
  
  <!-- Header Bar -->
  <rect x="30" y="25" width="940" height="75" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="55" y="55" fill="#0284c7" font-size="11" font-weight="bold" letter-spacing="1">AI DEVFEST MOCK TEST • REG: 252-35-408</text>
  <text x="55" y="80" fill="#0f172a" font-size="20" font-weight="bold">Smart Escape — ${scenarioName}</text>
  <text x="945" y="68" text-anchor="end" fill="#64748b" font-size="13">${buildingData.building}</text>

  <!-- Map Frame -->
  <rect x="30" y="115" width="940" height="420" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <g transform="translate(180, 185) scale(1.35)">
    ${edgeElements}
    ${nodeElements}
  </g>

  <!-- Bottom Result Banner -->
  <rect x="30" y="550" width="940" height="120" rx="16" fill="#ffffff" stroke="#10b981" stroke-width="1.5" />
  <text x="55" y="582" fill="#059669" font-size="12" font-weight="bold" letter-spacing="1">OPTIMAL EVACUATION ROUTE IDENTIFIED</text>
  <text x="55" y="612" fill="#0f172a" font-size="16" font-weight="bold">Target Exit: <tspan fill="#047857">${targetExit}</tspan></text>
  <text x="55" y="642" fill="#64748b" font-size="14">Escape Sequence: <tspan fill="#0f172a" font-weight="bold">${routePath.join('  →  ')}</tspan></text>
  
  <text x="945" y="585" text-anchor="end" fill="#64748b" font-size="12">TOTAL EVACUATION COST</text>
  <text x="945" y="635" text-anchor="end" fill="#047857" font-size="44" font-weight="bold" font-family="monospace">${totalCost}</text>
</svg>`;
}

// 1. Baseline: R1 -> E1, cost 7
const baselineSvg = generateSvgForScenario({
  scenarioName: 'Scenario 1: Baseline (Start R1)',
  startNodeId: 'R1',
  routePath: ['R1', 'C1', 'C2', 'E1'],
  routeEdges: ['L01', 'L02', 'L03'],
  totalCost: 7,
  targetExit: 'North Exit (E1)',
});

fs.writeFileSync('screenshots/baseline.svg', baselineSvg);
execSync('resvg screenshots/baseline.svg screenshots/baseline.png');
console.log('Regenerated screenshots/baseline.png');

// 2. Blocked C2: R1 -> E2, cost 11
const reroutedSvg = generateSvgForScenario({
  scenarioName: 'Scenario 2: Junction C2 Blocked (Rerouted to E2)',
  startNodeId: 'R1',
  blockedNodes: ['C2'],
  routePath: ['R1', 'C1', 'C3', 'C4', 'E2'],
  routeEdges: ['L01', 'L08', 'L06', 'L07'],
  totalCost: 11,
  targetExit: 'South Exit (E2)',
});

fs.writeFileSync('screenshots/rerouted-c2-blocked.svg', reroutedSvg);
execSync('resvg screenshots/rerouted-c2-blocked.svg screenshots/rerouted-c2-blocked.png');
console.log('Regenerated screenshots/rerouted-c2-blocked.png');

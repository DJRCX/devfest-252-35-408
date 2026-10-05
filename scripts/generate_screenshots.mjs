import fs from 'fs';
import { execSync } from 'child_process';

const buildingData = JSON.parse(fs.readFileSync('./building.json', 'utf-8'));

function generateSvgForScenario({
  title,
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
  const pad = 60;
  const w = 550;
  const h = 280;

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

    const strokeColor = isBlocked || isIncidentNodeBlocked ? '#ef4444' : isRouteEdge ? '#10b981' : '#334155';
    const strokeWidth = isRouteEdge ? 6 : 3;
    const dashArray = isBlocked ? '6,6' : 'none';

    return `
      <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" />
      <g transform="translate(${midX}, ${midY})">
        <rect x="-16" y="-10" width="32" height="20" rx="10" fill="${isRouteEdge ? '#064e3b' : isBlocked ? '#7f1d1d' : '#1e293b'}" stroke="${isRouteEdge ? '#10b981' : isBlocked ? '#ef4444' : '#475569'}" stroke-width="1.5" />
        <text text-anchor="middle" dominant-baseline="central" fill="${isRouteEdge ? '#34d399' : isBlocked ? '#fca5a5' : '#cbd5e1'}" font-size="11" font-weight="bold" font-family="sans-serif">${isBlocked ? '✕' : edge.cost}</text>
      </g>
    `;
  }).join('');

  const nodeElements = buildingData.nodes.map(node => {
    const isStart = node.id === startNodeId;
    const isBlocked = blockedNodesSet.has(node.id);
    const isClosed = closedExitsSet.has(node.id);
    const isRouteNode = activePathNodes.has(node.id);

    let shape = '';
    const fillColor = isBlocked ? '#7f1d1d' : isStart ? '#0284c7' : isRouteNode ? '#065f46' : isClosed ? '#475569' : node.type === 'exit' ? '#047857' : '#1e293b';
    const strokeColor = isBlocked ? '#ef4444' : isStart ? '#38bdf8' : isRouteNode ? '#10b981' : isClosed ? '#ef4444' : node.type === 'exit' ? '#10b981' : '#64748b';

    if (node.type === 'room') {
      shape = `<rect x="-22" y="-22" width="44" height="44" rx="10" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" />`;
    } else if (node.type === 'junction') {
      shape = `<rect x="-18" y="-18" width="36" height="36" rx="6" transform="rotate(45)" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" />`;
    } else if (node.type === 'exit') {
      shape = `<rect x="-24" y="-24" width="48" height="48" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3" />`;
    }

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isStart ? '<circle r="30" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />' : ''}
        ${shape}
        <text text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif">${node.id}</text>
        ${isStart ? '<circle cx="16" cy="-16" r="8" fill="#0284c7" stroke="#fff" stroke-width="1.5" /><text x="16" y="-16" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="9" font-weight="bold" font-family="sans-serif">S</text>' : ''}
        ${isBlocked ? '<circle cx="16" cy="-16" r="8" fill="#ef4444" stroke="#fff" stroke-width="1.5" /><text x="16" y="-16" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="9" font-weight="bold" font-family="sans-serif">✕</text>' : ''}
        <text y="34" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif" font-weight="500">${node.label}</text>
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
  <rect width="1000" height="700" fill="#090d16" />
  
  <!-- Header Bar -->
  <rect x="30" y="25" width="940" height="75" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
  <text x="55" y="55" fill="#38bdf8" font-size="11" font-weight="bold" letter-spacing="1">AI DEVFEST MOCK TEST • REG: 252-35-408</text>
  <text x="55" y="80" fill="#f8fafc" font-size="20" font-weight="bold">Smart Escape — ${scenarioName}</text>
  <text x="945" y="68" text-anchor="end" fill="#94a3b8" font-size="13">${buildingData.building}</text>

  <!-- Map Frame -->
  <rect x="30" y="115" width="940" height="420" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
  <g transform="translate(180, 185) scale(1.35)">
    ${edgeElements}
    ${nodeElements}
  </g>

  <!-- Bottom Result Banner -->
  <rect x="30" y="550" width="940" height="120" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
  <text x="55" y="582" fill="#34d399" font-size="12" font-weight="bold" letter-spacing="1">OPTIMAL EVACUATION ROUTE IDENTIFIED</text>
  <text x="55" y="612" fill="#ffffff" font-size="16" font-weight="bold">Target Exit: <tspan fill="#34d399">${targetExit}</tspan></text>
  <text x="55" y="642" fill="#94a3b8" font-size="14">Escape Sequence: <tspan fill="#f1f5f9" font-weight="bold">${routePath.join('  →  ')}</tspan></text>
  
  <text x="945" y="585" text-anchor="end" fill="#94a3b8" font-size="12">TOTAL EVACUATION COST</text>
  <text x="945" y="635" text-anchor="end" fill="#34d399" font-size="44" font-weight="bold">${totalCost}</text>
</svg>`;
}

// 1. Baseline: R1 -> E1, cost 7
const baselineSvg = generateSvgForScenario({
  title: 'Smart Escape Evacuation Simulator',
  scenarioName: 'Scenario 1: Baseline (Start R1)',
  startNodeId: 'R1',
  routePath: ['R1', 'C1', 'C2', 'E1'],
  routeEdges: ['L01', 'L02', 'L03'],
  totalCost: 7,
  targetExit: 'North Exit (E1)',
});

fs.writeFileSync('screenshots/baseline.svg', baselineSvg);
execSync('resvg screenshots/baseline.svg screenshots/baseline.png');
console.log('Generated screenshots/baseline.png');

// 2. Blocked C2: R1 -> E2, cost 11
const reroutedSvg = generateSvgForScenario({
  title: 'Smart Escape Evacuation Simulator',
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
console.log('Generated screenshots/rerouted-c2-blocked.png');

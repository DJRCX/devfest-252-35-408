'use client';

import React, { useMemo } from 'react';
import { BuildingData, BuildingNode, SimulationState, RouteResult } from '../lib/types';

interface BuildingMapProps {
  data: BuildingData;
  state: SimulationState;
  startNodeId: string | null;
  routeResult: RouteResult;
  toolMode: 'start' | 'node' | 'edge' | 'exit';
  highContrast?: boolean;
  onSelectStart: (nodeId: string) => void;
  onToggleNode: (nodeId: string) => void;
  onToggleEdge: (edgeId: string) => void;
  onToggleExit: (exitId: string) => void;
}

export const BuildingMap: React.FC<BuildingMapProps> = ({
  data,
  state,
  startNodeId,
  routeResult,
  toolMode,
  highContrast = false,
  onSelectStart,
  onToggleNode,
  onToggleEdge,
  onToggleExit,
}) => {
  // Compute bounding box with dynamic padding
  const { viewBox, nodeMap, midY } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const map = new Map<string, BuildingNode>();

    for (const n of data.nodes) {
      map.set(n.id, n);
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    const pad = 85;
    const w = Math.max(maxX - minX + pad * 2, 440);
    const h = Math.max(maxY - minY + pad * 2, 320);
    const vb = `${minX - pad} ${minY - pad} ${w} ${h}`;

    return { viewBox: vb, nodeMap: map, midY: (minY + maxY) / 2 };
  }, [data.nodes]);

  const activePathEdges = useMemo(() => new Set(routeResult.edgeIds), [routeResult.edgeIds]);
  const activePathNodes = useMemo(() => new Set(routeResult.path), [routeResult.path]);

  const handleNodeClick = (node: BuildingNode) => {
    if (toolMode === 'start') {
      if (node.type === 'exit') return;
      onSelectStart(node.id);
    } else if (toolMode === 'node') {
      if (node.type === 'room' || node.type === 'junction') {
        onToggleNode(node.id);
      }
    } else if (toolMode === 'exit') {
      if (node.type === 'exit') {
        onToggleExit(node.id);
      }
    }
  };

  return (
    <div className="relative w-full h-[520px] md:h-[600px] bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-3">
      {/* Subtle floor plan background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 pointer-events-none" />

      {/* Mode hint indicator badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-sm text-slate-700 text-xs font-medium backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
          Tool: <strong className="text-slate-900 font-semibold">{toolMode}</strong>
        </span>
      </div>

      <svg
        id="building-map-svg"
        viewBox={viewBox}
        className="w-full h-full select-none relative z-0 transition-all duration-300"
        style={{ filter: highContrast ? 'contrast(1.2)' : 'none' }}
      >
        <defs>
          {/* Architectural blueprint dot grid for light paper background */}
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.2" fill="#94a3b8" fillOpacity="0.4" />
          </pattern>

          {/* Glow filter for active evacuation route */}
          <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft drop shadow for node cards */}
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#dot-grid)" />

        {/* 1. CORRIDORS / EDGES */}
        <g id="edges-layer">
          {data.edges.map((edge) => {
            const u = nodeMap.get(edge.from);
            const v = nodeMap.get(edge.to);
            if (!u || !v) return null;

            const isBlocked = state.blockedEdges.has(edge.id);
            const isIncidentNodeBlocked = state.blockedNodes.has(edge.from) || state.blockedNodes.has(edge.to);
            const isIncidentExitClosed = state.closedExits.has(edge.from) || state.closedExits.has(edge.to);
            const isEffectivelyUnusable = isBlocked || isIncidentNodeBlocked || isIncidentExitClosed;
            const isRouteEdge = activePathEdges.has(edge.id);

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            const isEdgeToolActive = toolMode === 'edge';

            return (
              <g
                key={edge.id}
                className={`transition-all ${
                  isEdgeToolActive ? 'cursor-pointer group' : 'pointer-events-none'
                }`}
                onClick={() => {
                  if (isEdgeToolActive) {
                    onToggleEdge(edge.id);
                  }
                }}
              >
                {/* Wide hit-target interactive only in edge mode */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth="28"
                  className={isEdgeToolActive ? 'pointer-events-auto' : 'pointer-events-none'}
                />

                {/* Corridor Outer Track */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={
                    isBlocked
                      ? '#ef4444'
                      : isEffectivelyUnusable
                      ? '#cbd5e1'
                      : '#94a3b8'
                  }
                  strokeWidth={isRouteEdge ? 6 : 4}
                  strokeDasharray={isBlocked ? '6 6' : undefined}
                  className="transition-colors duration-200"
                />

                {/* Corridor Inner Core */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={
                    isBlocked
                      ? '#fca5a5'
                      : isEffectivelyUnusable
                      ? '#e2e8f0'
                      : '#cbd5e1'
                  }
                  strokeWidth="2"
                  strokeDasharray={isBlocked ? '6 6' : undefined}
                />

                {/* Animated Evacuation Route Flow */}
                {isRouteEdge && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#059669"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="route-flowing"
                    filter="url(#route-glow)"
                  />
                )}

                {/* Corridor Cost Badge */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  className={isEdgeToolActive ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}
                >
                  <rect
                    x="-18"
                    y="-11"
                    width="36"
                    height="22"
                    rx="11"
                    fill={
                      isBlocked
                        ? '#fef2f2'
                        : isRouteEdge
                        ? '#ecfdf5'
                        : '#ffffff'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isRouteEdge
                        ? '#059669'
                        : isEdgeToolActive
                        ? '#3b82f6'
                        : '#cbd5e1'
                    }
                    strokeWidth="1.5"
                    filter="url(#node-shadow)"
                    className={isEdgeToolActive ? 'group-hover:stroke-blue-500 group-hover:scale-110 transition-all' : ''}
                  />
                  {isBlocked ? (
                    <path
                      d="M -4 -4 L 4 4 M 4 -4 L -4 4"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  ) : (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isRouteEdge ? '#047857' : '#334155'}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="ui-monospace, monospace"
                    >
                      {edge.cost}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>

        {/* 2. NODES */}
        <g id="nodes-layer">
          {data.nodes.map((node) => {
            const isStart = node.id === startNodeId;
            const isBlocked = state.blockedNodes.has(node.id);
            const isClosed = state.closedExits.has(node.id);
            const isRouteNode = activePathNodes.has(node.id);

            const isClickable =
              (toolMode === 'start' && node.type !== 'exit') ||
              (toolMode === 'node' && (node.type === 'room' || node.type === 'junction')) ||
              (toolMode === 'exit' && node.type === 'exit');

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => handleNodeClick(node)}
              >
                {/* Selected Start Halo (Centered pure opacity pulse, NO transform) */}
                {isStart && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    className="start-halo-pulse"
                  />
                )}

                {/* Active Route Node Halo */}
                {isRouteNode && !isStart && (
                  <circle
                    r="30"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                )}

                {/* Room Geometry (Rounded Squircle) */}
                {node.type === 'room' && (
                  <rect
                    x="-24"
                    y="-24"
                    width="48"
                    height="48"
                    rx="12"
                    filter="url(#node-shadow)"
                    fill={
                      isBlocked
                        ? '#fef2f2'
                        : isStart
                        ? '#e0f2fe'
                        : isRouteNode
                        ? '#ecfdf5'
                        : '#ffffff'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isStart
                        ? '#0284c7'
                        : isRouteNode
                        ? '#059669'
                        : '#94a3b8'
                    }
                    strokeWidth={isStart || isRouteNode || isBlocked ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {/* Junction Geometry (Rotated Diamond) */}
                {node.type === 'junction' && (
                  <rect
                    x="-21"
                    y="-21"
                    width="42"
                    height="42"
                    rx="8"
                    transform="rotate(45)"
                    filter="url(#node-shadow)"
                    fill={
                      isBlocked
                        ? '#fef2f2'
                        : isStart
                        ? '#e0f2fe'
                        : isRouteNode
                        ? '#ecfdf5'
                        : '#ffffff'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isStart
                        ? '#0284c7'
                        : isRouteNode
                        ? '#059669'
                        : '#94a3b8'
                    }
                    strokeWidth={isStart || isRouteNode || isBlocked ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {/* Emergency Exit Geometry (Terminal Portal) */}
                {node.type === 'exit' && (
                  <rect
                    x="-26"
                    y="-26"
                    width="52"
                    height="52"
                    rx="14"
                    filter="url(#node-shadow)"
                    fill={
                      isClosed
                        ? '#f1f5f9'
                        : isRouteNode
                        ? '#dcfce7'
                        : '#ecfdf5'
                    }
                    stroke={
                      isClosed
                        ? '#ef4444'
                        : isRouteNode
                        ? '#059669'
                        : '#10b981'
                    }
                    strokeWidth={isRouteNode ? 3.5 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {/* Node ID Typography */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={
                    isBlocked
                      ? '#991b1b'
                      : isStart
                      ? '#0369a1'
                      : isRouteNode && node.type === 'exit'
                      ? '#047857'
                      : '#0f172a'
                  }
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="ui-monospace, monospace"
                >
                  {node.id}
                </text>

                {/* Crisp SVG Badge: Start */}
                {isStart && (
                  <g transform="translate(19, -19)">
                    <circle r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                    <path
                      d="M -3 -3 L 3 0 L -3 3 Z"
                      fill="#ffffff"
                    />
                  </g>
                )}

                {/* Crisp SVG Badge: Blocked Hazard (Cross) */}
                {isBlocked && (
                  <g transform="translate(19, -19)">
                    <circle r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <path
                      d="M -3 -3 L 3 3 M 3 -3 L -3 3"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Crisp SVG Badge: Closed Exit (Padlock) */}
                {isClosed && (
                  <g transform="translate(19, -19)">
                    <circle r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <path
                      d="M -3 0 L 3 0 L 3 4 L -3 4 Z"
                      fill="#ffffff"
                    />
                    <path
                      d="M -2 0 L -2 -2 A 2 2 0 0 1 2 -2 L 2 0"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  </g>
                )}

                {/* Node Label (Top row above node, bottom row below node to keep corridors clear) */}
                <text
                  y={node.y <= midY ? -38 : 38}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none tracking-tight"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

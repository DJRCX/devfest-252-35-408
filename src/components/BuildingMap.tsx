'use client';

import React, { useMemo } from 'react';
import { BuildingData, BuildingNode, BuildingEdge, SimulationState, RouteResult } from '../lib/types';
import { ShieldAlert, LogOut, Navigation, DoorClosed, AlertTriangle } from 'lucide-react';

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
  // Compute bounding box with margin
  const { viewBox, nodeMap } = useMemo(() => {
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

    const pad = 80;
    const w = Math.max(maxX - minX + pad * 2, 400);
    const h = Math.max(maxY - minY + pad * 2, 300);
    const vb = `${minX - pad} ${minY - pad} ${w} ${h}`;

    return { viewBox: vb, nodeMap: map };
  }, [data.nodes]);

  const activePathEdges = useMemo(() => new Set(routeResult.edgeIds), [routeResult.edgeIds]);
  const activePathNodes = useMemo(() => new Set(routeResult.path), [routeResult.path]);

  const handleNodeClick = (node: BuildingNode) => {
    if (toolMode === 'start') {
      if (node.type === 'exit') return; // Cannot start at exit
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
    <div className="relative w-full h-[540px] md:h-[620px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-2">
      <svg
        id="building-map-svg"
        viewBox={viewBox}
        className="w-full h-full select-none"
        style={{ filter: highContrast ? 'contrast(1.25)' : 'none' }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>

          {/* Glow filter for route */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />

        {/* 1. EDGES / CORRIDORS */}
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

            return (
              <g
                key={edge.id}
                className={`group transition-all ${toolMode === 'edge' ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (toolMode === 'edge') onToggleEdge(edge.id);
                }}
              >
                {/* Invisible wide hit area for easy clicking */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Base Corridor Line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={
                    isBlocked
                      ? '#ef4444'
                      : isEffectivelyUnusable
                      ? '#64748b'
                      : '#334155'
                  }
                  strokeWidth={isRouteEdge ? 6 : 3}
                  strokeDasharray={isBlocked ? '6 6' : undefined}
                  className="transition-colors duration-200"
                />

                {/* Route Highlight Flow Line */}
                {isRouteEdge && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="route-flowing"
                    filter="url(#glow)"
                  />
                )}

                {/* Midpoint Cost Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-18"
                    y="-11"
                    width="36"
                    height="22"
                    rx="11"
                    fill={
                      isBlocked
                        ? '#7f1d1d'
                        : isRouteEdge
                        ? '#064e3b'
                        : '#1e293b'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isRouteEdge
                        ? '#10b981'
                        : '#475569'
                    }
                    strokeWidth="1.5"
                    className="group-hover:scale-110 transition-transform"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      isBlocked
                        ? '#fca5a5'
                        : isRouteEdge
                        ? '#34d399'
                        : '#cbd5e1'
                    }
                    fontSize="11"
                    fontWeight="600"
                  >
                    {isBlocked ? '✕' : edge.cost}
                  </text>
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

            // Node visual representation
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group transition-all"
                onClick={() => handleNodeClick(node)}
              >
                {/* Start Pulsing Halo */}
                {isStart && (
                  <circle
                    r="32"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="animate-start-pulse"
                  />
                )}

                {/* Route Glow Halo */}
                {isRouteNode && !isStart && (
                  <circle
                    r="28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Main Node Shape based on Type */}
                {node.type === 'room' && (
                  <rect
                    x="-22"
                    y="-22"
                    width="44"
                    height="44"
                    rx="10"
                    fill={
                      isBlocked
                        ? '#7f1d1d'
                        : isStart
                        ? '#0284c7'
                        : isRouteNode
                        ? '#065f46'
                        : '#1e293b'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isStart
                        ? '#38bdf8'
                        : isRouteNode
                        ? '#10b981'
                        : '#64748b'
                    }
                    strokeWidth={isStart || isRouteNode || isBlocked ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {node.type === 'junction' && (
                  <rect
                    x="-20"
                    y="-20"
                    width="40"
                    height="40"
                    rx="6"
                    transform="rotate(45)"
                    fill={
                      isBlocked
                        ? '#7f1d1d'
                        : isStart
                        ? '#0284c7'
                        : isRouteNode
                        ? '#065f46'
                        : '#1e293b'
                    }
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isStart
                        ? '#38bdf8'
                        : isRouteNode
                        ? '#10b981'
                        : '#64748b'
                    }
                    strokeWidth={isStart || isRouteNode || isBlocked ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {node.type === 'exit' && (
                  <rect
                    x="-24"
                    y="-24"
                    width="48"
                    height="48"
                    rx="12"
                    fill={
                      isClosed
                        ? '#475569'
                        : isRouteNode
                        ? '#059669'
                        : '#047857'
                    }
                    stroke={
                      isClosed
                        ? '#ef4444'
                        : isRouteNode
                        ? '#34d399'
                        : '#10b981'
                    }
                    strokeWidth={isRouteNode ? 3.5 : 2}
                    className="transition-all duration-200 group-hover:scale-105"
                  />
                )}

                {/* Node Center Label ID */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {node.id}
                </text>

                {/* Status Badges */}
                {isStart && (
                  <g transform="translate(18, -18)">
                    <circle r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      S
                    </text>
                  </g>
                )}

                {isBlocked && (
                  <g transform="translate(18, -18)">
                    <circle r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ✕
                    </text>
                  </g>
                )}

                {isClosed && (
                  <g transform="translate(18, -18)">
                    <circle r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      🔒
                    </text>
                  </g>
                )}

                {/* Node Full Label below */}
                <text
                  y="34"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="500"
                  className="pointer-events-none"
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

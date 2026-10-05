'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import sampleBuilding from '../../building.json';
import { BuildingData, SimulationState, Language, RouteResult } from '../lib/types';
import { validateBuildingData } from '../lib/validator';
import { findEvacuationRoute } from '../lib/router';
import { translations } from '../lib/i18n';
import { BuildingMap } from '../components/BuildingMap';
import { ControlPanel } from '../components/ControlPanel';
import { RouteResultCard } from '../components/RouteResultCard';
import { LegendCard } from '../components/LegendCard';
import { ShieldCheck, AlertTriangle, Sparkles, X } from 'lucide-react';

export default function SmartEscapeApp() {
  const [data, setData] = useState<BuildingData>(sampleBuilding as BuildingData);
  const [language, setLanguage] = useState<Language>('en');
  const [toolMode, setToolMode] = useState<'start' | 'node' | 'edge' | 'exit'>('start');
  const [startNodeId, setStartNodeId] = useState<string | null>('R1');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<{ en: string; bn: string } | null>(null);

  // Initialize simulation state from data.initial_state
  const [simulationState, setSimulationState] = useState<SimulationState>(() => ({
    blockedNodes: new Set(sampleBuilding.initial_state.blocked_nodes),
    blockedEdges: new Set(sampleBuilding.initial_state.blocked_edges),
    closedExits: new Set(sampleBuilding.initial_state.closed_exits),
  }));

  const t = translations[language];

  // Route calculation immediately updates whenever data, startNodeId, or simulationState changes
  const routeResult: RouteResult = useMemo(() => {
    return findEvacuationRoute(data, startNodeId, simulationState);
  }, [data, startNodeId, simulationState]);

  // Handle start selection
  const handleSelectStart = useCallback((nodeId: string) => {
    setStartNodeId(nodeId);
  }, []);

  // Toggle node hazard (room / junction)
  const handleToggleNode = useCallback((nodeId: string) => {
    setSimulationState((prev) => {
      const nextBlocked = new Set(prev.blockedNodes);
      if (nextBlocked.has(nodeId)) {
        nextBlocked.delete(nodeId);
      } else {
        nextBlocked.add(nodeId);
      }
      return {
        ...prev,
        blockedNodes: nextBlocked,
      };
    });
  }, []);

  // Toggle corridor obstruction
  const handleToggleEdge = useCallback((edgeId: string) => {
    setSimulationState((prev) => {
      const nextBlocked = new Set(prev.blockedEdges);
      if (nextBlocked.has(edgeId)) {
        nextBlocked.delete(edgeId);
      } else {
        nextBlocked.add(edgeId);
      }
      return {
        ...prev,
        blockedEdges: nextBlocked,
      };
    });
  }, []);

  // Toggle exit open / closed
  const handleToggleExit = useCallback((exitId: string) => {
    setSimulationState((prev) => {
      const nextClosed = new Set(prev.closedExits);
      if (nextClosed.has(exitId)) {
        nextClosed.delete(exitId);
      } else {
        nextClosed.add(exitId);
      }
      return {
        ...prev,
        closedExits: nextClosed,
      };
    });
  }, []);

  // Reset to initial_state of current building
  const handleReset = useCallback(() => {
    setSimulationState({
      blockedNodes: new Set(data.initial_state.blocked_nodes),
      blockedEdges: new Set(data.initial_state.blocked_edges),
      closedExits: new Set(data.initial_state.closed_exits),
    });
  }, [data.initial_state]);

  // Load sample dataset
  const handleLoadSample = useCallback(() => {
    const defaultData = sampleBuilding as BuildingData;
    setData(defaultData);
    setStartNodeId('R1');
    setSimulationState({
      blockedNodes: new Set(defaultData.initial_state.blocked_nodes),
      blockedEdges: new Set(defaultData.initial_state.blocked_edges),
      closedExits: new Set(defaultData.initial_state.closed_exits),
    });
    setValidationError(null);
  }, []);

  // File upload and client-side validation
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateBuildingData(parsed);

        if (!result.valid || !result.data) {
          setValidationError({
            en: result.error || 'Unknown validation error.',
            bn: result.errorBn || 'অজানা বৈধতা ত্রুটি।',
          });
          return;
        }

        setData(result.data);
        setValidationError(null);

        // Reset state to the new file's initial_state
        setSimulationState({
          blockedNodes: new Set(result.data.initial_state.blocked_nodes),
          blockedEdges: new Set(result.data.initial_state.blocked_edges),
          closedExits: new Set(result.data.initial_state.closed_exits),
        });

        // Set start to first room or junction
        const firstStartable = result.data.nodes.find(
          (n) => (n.type === 'room' || n.type === 'junction') && !result.data!.initial_state.blocked_nodes.includes(n.id)
        );
        setStartNodeId(firstStartable ? firstStartable.id : null);
      } catch (err: any) {
        setValidationError({
          en: `Invalid JSON format: ${err.message}`,
          bn: `অবৈধ JSON ফরম্যাট: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
  }, []);

  // Quick Preset Scenarios from Section 4.1
  const handleApplyScenario = useCallback((scenarioIndex: number) => {
    if (scenarioIndex === 1) {
      // Baseline: Select R1, initial state
      handleReset();
      setStartNodeId('R1');
    } else if (scenarioIndex === 2) {
      // Blocked junction: Select R1, block C2
      setStartNodeId('R1');
      setSimulationState({
        blockedNodes: new Set([...data.initial_state.blocked_nodes, 'C2']),
        blockedEdges: new Set(data.initial_state.blocked_edges),
        closedExits: new Set(data.initial_state.closed_exits),
      });
    } else if (scenarioIndex === 3) {
      // Exits closed: Select R1, close E1 & E2
      setStartNodeId('R1');
      setSimulationState({
        blockedNodes: new Set(data.initial_state.blocked_nodes),
        blockedEdges: new Set(data.initial_state.blocked_edges),
        closedExits: new Set(['E1', 'E2']),
      });
    } else if (scenarioIndex === 4) {
      // Different start: Select R2, initial state
      handleReset();
      setStartNodeId('R2');
    } else if (scenarioIndex === 5) {
      // Blocked start: Select R1; then block R1
      setStartNodeId('R1');
      setSimulationState({
        blockedNodes: new Set([...data.initial_state.blocked_nodes, 'R1']),
        blockedEdges: new Set(data.initial_state.blocked_edges),
        closedExits: new Set(data.initial_state.closed_exits),
      });
    }
  }, [data.initial_state, handleReset]);

  // Toggle language
  const handleToggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  // Export Map as PNG
  const handleExportPng = useCallback(() => {
    const svgEl = document.getElementById('building-map-svg') as SVGSVGElement | null;
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `smart-escape-${data.building.replace(/\s+/g, '-').toLowerCase()}.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [data.building]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                {t.officialBadge}
              </span>
              <span className="text-xs text-slate-400 font-mono">Reg: 252-35-408</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
              {t.appTitle}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{t.appSubtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                highContrast
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {`${t.highContrast}: ${highContrast ? t.on : t.off}`}
            </button>
          </div>
        </header>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-rose-950/50 border border-rose-500/60 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t.validationError}</h4>
                <p className="text-xs text-rose-300/90 mt-1 font-mono">{validationError[language]}</p>
              </div>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-rose-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Interactive Map and Result */}
          <div className="lg:col-span-8 space-y-6">
            <BuildingMap
              data={data}
              state={simulationState}
              startNodeId={startNodeId}
              routeResult={routeResult}
              toolMode={toolMode}
              highContrast={highContrast}
              onSelectStart={handleSelectStart}
              onToggleNode={handleToggleNode}
              onToggleEdge={handleToggleEdge}
              onToggleExit={handleToggleExit}
            />

            <RouteResultCard
              result={routeResult}
              language={language}
              data={data}
              startNodeId={startNodeId}
            />
          </div>

          {/* Right: Controls & Info */}
          <div className="lg:col-span-4 space-y-6">
            <ControlPanel
              language={language}
              toolMode={toolMode}
              data={data}
              onSetToolMode={setToolMode}
              onReset={handleReset}
              onLoadSample={handleLoadSample}
              onFileUpload={handleFileUpload}
              onApplyScenario={handleApplyScenario}
              onToggleLanguage={handleToggleLanguage}
              onExportPng={handleExportPng}
            />

            <LegendCard
              language={language}
              data={data}
              state={simulationState}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            AI DevFest Mock Test • Smart Escape Evacuation Simulator
          </div>
          <div>
            Participant: Mahtabul Al Nahian • Reg: 252-35-408 • MIT License
          </div>
        </footer>
      </div>
    </main>
  );
}

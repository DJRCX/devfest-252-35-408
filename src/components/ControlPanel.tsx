'use client';

import React, { useRef } from 'react';
import { Language, BuildingData } from '../lib/types';
import { translations } from '../lib/i18n';
import {
  RotateCcw,
  Upload,
  FileText,
  Navigation,
  ShieldAlert,
  SlidersHorizontal,
  DoorClosed,
  Languages,
  Download,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface ControlPanelProps {
  language: Language;
  toolMode: 'start' | 'node' | 'edge' | 'exit';
  data: BuildingData;
  onSetToolMode: (mode: 'start' | 'node' | 'edge' | 'exit') => void;
  onReset: () => void;
  onLoadSample: () => void;
  onFileUpload: (file: File) => void;
  onApplyScenario: (scenarioIndex: number) => void;
  onToggleLanguage: () => void;
  onExportPng: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  language,
  toolMode,
  data,
  onSetToolMode,
  onReset,
  onLoadSample,
  onFileUpload,
  onApplyScenario,
  onToggleLanguage,
  onExportPng,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 4.1 checks reference the official sample's IDs; disable them for datasets that lack those nodes.
  const nodeTypes = new Map(data.nodes.map((n) => [n.id, n.type]));
  const isStartable = (id: string) => nodeTypes.get(id) === 'room' || nodeTypes.get(id) === 'junction';
  const isExit = (id: string) => nodeTypes.get(id) === 'exit';
  const scenarioAvailable: Record<number, boolean> = {
    1: isStartable('R1'),
    2: isStartable('R1') && isStartable('C2'),
    3: isStartable('R1') && isExit('E1') && isExit('E2'),
    4: isStartable('R2'),
    5: isStartable('R1'),
  };
  const anyScenarioUnavailable = Object.values(scenarioAvailable).some((ok) => !ok);
  const scenarioButtonClass =
    'text-left px-3 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/70 disabled:hover:border-slate-700/80';

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs md:text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              <Upload className="w-4 h-4" />
              {t.importButton}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <button
              onClick={onLoadSample}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs md:text-sm font-medium rounded-xl border border-slate-700 transition"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              {t.loadSampleButton}
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs md:text-sm font-medium rounded-xl border border-amber-500/40 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              {t.resetButton}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportPng}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-medium rounded-xl border border-slate-700 transition"
              title={t.exportPngButton}
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">{t.exportPngButton}</span>
            </button>

            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-medium rounded-xl border border-slate-700 transition"
            >
              <Languages className="w-4 h-4 text-violet-400" />
              <span>{t.languageSwitch}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tool Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-400" />
          {t.interactionMode}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => onSetToolMode('start')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
              toolMode === 'start'
                ? 'bg-sky-500/20 border-sky-500 text-sky-200 shadow-md shadow-sky-500/10'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-5 h-5 mb-1.5 text-sky-400" />
            <span className="text-xs font-semibold">{t.modeSelectStart}</span>
          </button>

          <button
            onClick={() => onSetToolMode('node')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
              toolMode === 'node'
                ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-1.5 text-rose-400" />
            <span className="text-xs font-semibold">{t.modeToggleNode}</span>
          </button>

          <button
            onClick={() => onSetToolMode('edge')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
              toolMode === 'edge'
                ? 'bg-orange-500/20 border-orange-500 text-orange-200 shadow-md shadow-orange-500/10'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-5 h-5 mb-1.5 text-orange-400" />
            <span className="text-xs font-semibold">{t.modeToggleEdge}</span>
          </button>

          <button
            onClick={() => onSetToolMode('exit')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
              toolMode === 'exit'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <DoorClosed className="w-5 h-5 mb-1.5 text-emerald-400" />
            <span className="text-xs font-semibold">{t.modeToggleExit}</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400 italic">
          {toolMode === 'start' && t.modeSelectStartDesc}
          {toolMode === 'node' && t.modeToggleNodeDesc}
          {toolMode === 'edge' && t.modeToggleEdgeDesc}
          {toolMode === 'exit' && t.modeToggleExitDesc}
        </p>
      </div>

      {/* Preset Scenarios / Test Cases from Section 4.1 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {t.presetScenarios}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            t.scenarioBaseline,
            t.scenarioBlockC2,
            t.scenarioCloseExits,
            t.scenarioStartR2,
            t.scenarioBlockStart,
          ].map((label, i) => (
            <button
              key={i + 1}
              onClick={() => onApplyScenario(i + 1)}
              disabled={!scenarioAvailable[i + 1]}
              className={scenarioButtonClass}
            >
              {label}
            </button>
          ))}
        </div>
        {anyScenarioUnavailable && (
          <p className="mt-3 text-xs text-slate-400 italic">{t.scenarioUnavailableHint}</p>
        )}
      </div>
    </div>
  );
};

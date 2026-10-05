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
    'text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-all duration-150 hover:border-slate-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:border-slate-200 shadow-xs';

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
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
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              {t.loadSampleButton}
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              {t.resetButton}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportPng}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition active:scale-[0.98] shadow-xs"
              title={t.exportPngButton}
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">{t.exportPngButton}</span>
            </button>

            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition active:scale-[0.98] shadow-xs"
            >
              <Languages className="w-3.5 h-3.5 text-violet-600" />
              <span>{t.languageSwitch}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tool Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
          {t.interactionMode}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => onSetToolMode('start')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center active:scale-[0.98] ${
              toolMode === 'start'
                ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-xs font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-5 h-5 mb-1.5 text-sky-600" />
            <span className="text-xs font-bold">{t.modeSelectStart}</span>
          </button>

          <button
            onClick={() => onSetToolMode('node')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center active:scale-[0.98] ${
              toolMode === 'node'
                ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-1.5 text-rose-600" />
            <span className="text-xs font-bold">{t.modeToggleNode}</span>
          </button>

          <button
            onClick={() => onSetToolMode('edge')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center active:scale-[0.98] ${
              toolMode === 'edge'
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-5 h-5 mb-1.5 text-amber-600" />
            <span className="text-xs font-bold">{t.modeToggleEdge}</span>
          </button>

          <button
            onClick={() => onSetToolMode('exit')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center active:scale-[0.98] ${
              toolMode === 'exit'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DoorClosed className="w-5 h-5 mb-1.5 text-emerald-600" />
            <span className="text-xs font-bold">{t.modeToggleExit}</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 font-medium">
          {toolMode === 'start' && t.modeSelectStartDesc}
          {toolMode === 'node' && t.modeToggleNodeDesc}
          {toolMode === 'edge' && t.modeToggleEdgeDesc}
          {toolMode === 'exit' && t.modeToggleExitDesc}
        </p>
      </div>

      {/* Preset Scenarios (Section 4.1 Mock Checks) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {t.presetScenarios}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
          <p className="mt-3 text-xs text-slate-500 font-medium italic">{t.scenarioUnavailableHint}</p>
        )}
      </div>
    </div>
  );
};

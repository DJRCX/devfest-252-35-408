'use client';

import React from 'react';
import { Language, BuildingData, SimulationState } from '../lib/types';
import { translations } from '../lib/i18n';
import { Info, Building2, Flame, Lock, ShieldAlert, DoorClosed, Navigation } from 'lucide-react';

interface LegendCardProps {
  language: Language;
  data: BuildingData;
  state: SimulationState;
}

export const LegendCard: React.FC<LegendCardProps> = ({ language, data, state }) => {
  const t = translations[language];

  const roomsCount = data.nodes.filter((n) => n.type === 'room').length;
  const junctionsCount = data.nodes.filter((n) => n.type === 'junction').length;
  const exitsCount = data.nodes.filter((n) => n.type === 'exit').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Building Telemetry Header */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          <Building2 className="w-3.5 h-3.5 text-sky-600" />
          {t.buildingDetails}
        </div>
        <div className="text-sm font-bold text-slate-900 mb-3 truncate">{data.building}</div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[10px] uppercase font-mono">{t.roomsCount}</div>
            <div className="font-bold text-sky-700 font-mono text-sm mt-0.5">{roomsCount}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[10px] uppercase font-mono">{t.junctionsCount}</div>
            <div className="font-bold text-violet-700 font-mono text-sm mt-0.5">{junctionsCount}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[10px] uppercase font-mono">{t.exitsCount}</div>
            <div className="font-bold text-emerald-700 font-mono text-sm mt-0.5">{exitsCount}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[10px] uppercase font-mono">{t.edgesCount}</div>
            <div className="font-bold text-slate-700 font-mono text-sm mt-0.5">{data.edges.length}</div>
          </div>
        </div>
      </div>

      {/* Active Hazards Telemetry */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 mb-2.5">
          <Flame className="w-3.5 h-3.5 text-rose-600" />
          {t.hazardsSummary}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            <div className="text-rose-700 text-[10px] font-mono">{t.blockedNodesCount}</div>
            <div className="font-bold text-rose-800 font-mono text-base mt-0.5">{state.blockedNodes.size}</div>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <div className="text-amber-700 text-[10px] font-mono">{t.blockedEdgesCount}</div>
            <div className="font-bold text-amber-800 font-mono text-base mt-0.5">{state.blockedEdges.size}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[10px] font-mono">{t.closedExitsCount}</div>
            <div className="font-bold text-slate-700 font-mono text-base mt-0.5">{state.closedExits.size}</div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          {t.legendTitle}
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-white border-2 border-slate-400 flex-shrink-0" />
            <span className="truncate">{t.legendRoom}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rotate-45 rounded-sm bg-white border-2 border-slate-400 flex-shrink-0" />
            <span className="truncate">{t.legendJunction}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-emerald-50 border-2 border-emerald-500 text-emerald-800 flex items-center justify-center font-bold text-[9px] flex-shrink-0">
              E
            </div>
            <span className="truncate">{t.legendExit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-100 border-2 border-rose-500 flex items-center justify-center flex-shrink-0">
              <Lock className="w-2.5 h-2.5 text-rose-600" />
            </div>
            <span className="truncate">{t.legendClosedExit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-rose-50 border-2 border-rose-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
            </div>
            <span className="truncate">{t.legendBlockedNode}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 border-t-2 border-dashed border-rose-500 flex-shrink-0" />
            <span className="truncate">{t.legendBlockedEdge}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1.5 rounded-full bg-emerald-600 shadow-xs flex-shrink-0" />
            <span className="truncate">{t.legendRoute}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-sky-100 border-2 border-sky-600 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-2.5 h-2.5 text-sky-700" />
            </div>
            <span className="truncate">{t.legendStart}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

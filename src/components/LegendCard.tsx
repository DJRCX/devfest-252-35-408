'use client';

import React from 'react';
import { Language, BuildingData, SimulationState } from '../lib/types';
import { translations } from '../lib/i18n';
import { Info, Building2, Flame, DoorClosed } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Building Info */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <Building2 className="w-4 h-4 text-sky-400" />
          {t.buildingDetails}
        </div>
        <div className="text-sm font-bold text-white mb-2">{data.building}</div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 text-[10px]">{t.roomsCount}</div>
            <div className="font-bold text-sky-300 font-mono">{roomsCount}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 text-[10px]">{t.junctionsCount}</div>
            <div className="font-bold text-violet-300 font-mono">{junctionsCount}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 text-[10px]">{t.exitsCount}</div>
            <div className="font-bold text-emerald-300 font-mono">{exitsCount}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 text-[10px]">{t.edgesCount}</div>
            <div className="font-bold text-slate-300 font-mono">{data.edges.length}</div>
          </div>
        </div>
      </div>

      {/* Active Hazards Summary */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
          <Flame className="w-4 h-4 text-rose-400" />
          {t.hazardsSummary}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-rose-950/20 p-2 rounded-lg border border-rose-500/30">
            <div className="text-rose-400/80 text-[10px]">{t.blockedNodesCount}</div>
            <div className="font-bold text-rose-300 font-mono">{state.blockedNodes.size}</div>
          </div>
          <div className="bg-orange-950/20 p-2 rounded-lg border border-orange-500/30">
            <div className="text-orange-400/80 text-[10px]">{t.blockedEdgesCount}</div>
            <div className="font-bold text-orange-300 font-mono">{state.blockedEdges.size}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 text-[10px]">{t.closedExitsCount}</div>
            <div className="font-bold text-slate-300 font-mono">{state.closedExits.size}</div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          <Info className="w-4 h-4 text-slate-400" />
          {t.legendTitle}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-800 border-2 border-slate-600" />
            <span>{t.legendRoom}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rotate-45 rounded-sm bg-slate-800 border-2 border-slate-600" />
            <span>{t.legendJunction}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-emerald-700 border-2 border-emerald-500 text-white flex items-center justify-center font-bold text-[8px]">
              E
            </div>
            <span>{t.legendExit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-700 border-2 border-rose-500 flex items-center justify-center text-[8px]">
              🔒
            </div>
            <span>{t.legendClosedExit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-rose-900 border-2 border-rose-500 flex items-center justify-center text-[8px] text-white">
              ✕
            </div>
            <span>{t.legendBlockedNode}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 border-t-2 border-dashed border-rose-500" />
            <span>{t.legendBlockedEdge}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <span>{t.legendRoute}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-[8px] text-sky-200">
              S
            </div>
            <span>{t.legendStart}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

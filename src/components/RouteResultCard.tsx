'use client';

import React from 'react';
import { RouteResult, Language, BuildingData } from '../lib/types';
import { translations } from '../lib/i18n';
import { ShieldAlert, AlertOctagon, CheckCircle2, ArrowRight, CornerDownRight, Footprints } from 'lucide-react';

interface RouteResultCardProps {
  result: RouteResult;
  language: Language;
  data: BuildingData;
  startNodeId: string | null;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({
  result,
  language,
  data,
  startNodeId,
}) => {
  const t = translations[language];
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

  // If no start node is selected
  if (!startNodeId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
        <Footprints className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-200 mb-1">{t.routeAnalysis}</h4>
        <p className="text-sm text-slate-400">{t.promptSelectStart}</p>
      </div>
    );
  }

  // 1. Failure Case: Starting location blocked
  if (result.status === 'START_BLOCKED') {
    return (
      <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              {language === 'bn' ? 'সতর্কতা' : 'Status'}
            </span>
            <h3 className="text-lg font-bold text-rose-200">
              {language === 'bn' ? 'Starting location blocked (শুরুর অবস্থানটি অবরুদ্ধ)' : 'Starting location blocked'}
            </h3>
          </div>
        </div>
        <p className="text-sm text-rose-300/80 mt-2">
          {language === 'bn'
            ? `নির্বাচিত শুরুর স্থান "${startNodeId}" অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে বিকল্প স্থান নির্বাচন করুন অথবা নোডটি আনব্লক করুন।`
            : `Selected starting node "${startNodeId}" is currently blocked by a hazard. Clear the hazard or choose an unblocked room/junction.`}
        </p>
      </div>
    );
  }

  // 2. Failure Case: No route available
  if (result.status === 'NO_ROUTE') {
    return (
      <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {language === 'bn' ? 'সতর্কতা' : 'Status'}
            </span>
            <h3 className="text-lg font-bold text-amber-200">
              {language === 'bn' ? 'No route available (কোনো রুট উপলব্ধ নেই)' : 'No route available'}
            </h3>
          </div>
        </div>
        <p className="text-sm text-amber-300/80 mt-2">
          {language === 'bn'
            ? `শুরুর স্থান "${startNodeId}" থেকে কোনো খোলা প্রস্থান ফটকে পৌঁছানো সম্ভব নয়। সব পথ অবরুদ্ধ বা প্রস্থান বন্ধ।`
            : `No accessible path exists from "${startNodeId}" to any open emergency exit. All paths are blocked or exits are closed.`}
        </p>
      </div>
    );
  }

  // 3. Success Case: Lowest-cost route found
  const exitNode = result.exitId ? nodeMap.get(result.exitId) : null;

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {t.statusSuccess}
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t.destinationExit}:</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-sm font-mono">
                {exitNode ? `${exitNode.label} (${exitNode.id})` : result.exitId}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            {t.totalCost}
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {result.totalCost}
          </div>
        </div>
      </div>

      {/* Path Sequence Visualization */}
      <div className="mt-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <CornerDownRight className="w-4 h-4 text-emerald-400" />
          {t.nodeSequence}
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          {result.path.map((nodeId, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === result.path.length - 1;
            const node = nodeMap.get(nodeId);

            return (
              <React.Fragment key={nodeId}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    isFirst
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                      : isLast
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold">{nodeId}</span>
                  {node && (
                    <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                      ({node.label})
                    </span>
                  )}
                </div>

                {!isLast && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

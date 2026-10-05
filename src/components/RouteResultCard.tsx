'use client';

import React from 'react';
import { RouteResult, Language, BuildingData } from '../lib/types';
import { translations } from '../lib/i18n';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Footprints,
  Compass,
  Lock,
} from 'lucide-react';

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

  // Build edge cost lookup for adjacent node transitions
  const edgeCostMap = new Map<string, number>();
  for (const e of data.edges) {
    edgeCostMap.set(`${e.from}---${e.to}`, e.cost);
    edgeCostMap.set(`${e.to}---${e.from}`, e.cost);
  }

  // If no start node is selected
  if (!startNodeId) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3">
          <Footprints className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
          {t.routeAnalysis}
        </h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{t.promptSelectStart}</p>
      </div>
    );
  }

  // 1. Failure Case: Starting location blocked
  if (result.status === 'START_BLOCKED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl border border-rose-200 flex-shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-600">
              {language === 'bn' ? 'বিপদ সতর্কতা' : 'Hazard Alert'}
            </span>
            <h3 className="text-base font-bold text-rose-950 tracking-tight">
              {language === 'bn' ? 'Starting location blocked (শুরুর অবস্থানটি অবরুদ্ধ)' : 'Starting location blocked'}
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed pt-0.5">
              {language === 'bn'
                ? `নির্বাচিত শুরুর স্থান "${startNodeId}" অবরুদ্ধ করা হয়েছে। অনুগ্রহ করে বিকল্প স্থান নির্বাচন করুন অথবা নোডটি আনব্লক করুন।`
                : `Selected start location "${startNodeId}" is currently blocked by a hazard. Clear the hazard or select an open room/junction.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Failure Case: No route available
  if (result.status === 'NO_ROUTE') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl border border-amber-200 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">
              {language === 'bn' ? 'রুট অনুপলব্ধ' : 'Evacuation Failure'}
            </span>
            <h3 className="text-base font-bold text-amber-950 tracking-tight">
              {language === 'bn' ? 'No route available (কোনো রুট উপলব্ধ নেই)' : 'No route available'}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed pt-0.5">
              {language === 'bn'
                ? `শুরুর স্থান "${startNodeId}" থেকে কোনো খোলা প্রস্থান ফটকে পৌঁছানো সম্ভব নয়। সব পথ অবরুদ্ধ বা প্রস্থান বন্ধ।`
                : `No accessible path exists from "${startNodeId}" to any open emergency exit. All connecting corridors are severed or exits are closed.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Success Case: Lowest-cost route found
  const exitNode = result.exitId ? nodeMap.get(result.exitId) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
              {t.statusSuccess}
            </span>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <span className="text-slate-600 font-normal">{t.destinationExit}:</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-sm font-mono font-bold">
                {exitNode ? `${exitNode.label} (${exitNode.id})` : result.exitId}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            {t.totalCost}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">
            {result.totalCost}
          </div>
        </div>
      </div>

      {/* Path Sequence Visualization */}
      <div className="mt-4 space-y-2.5">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 font-mono">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          {t.nodeSequence}
        </div>

        {/* Breadcrumb path */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {result.path.map((nodeId, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === result.path.length - 1;
            const node = nodeMap.get(nodeId);

            // Cost to next node
            let stepCost: number | undefined;
            if (!isLast) {
              const nextId = result.path[idx + 1];
              stepCost = edgeCostMap.get(`${nodeId}---${nextId}`);
            }

            return (
              <React.Fragment key={nodeId}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs ${
                    isFirst
                      ? 'bg-sky-50 text-sky-800 border border-sky-300'
                      : isLast
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold">{nodeId}</span>
                  {node && (
                    <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                      {node.label}
                    </span>
                  )}
                </div>

                {!isLast && (
                  <div className="flex items-center gap-1 px-1">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {stepCost !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        +{stepCost}
                      </span>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

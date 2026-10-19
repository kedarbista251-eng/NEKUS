import { NexusPermissions } from '@nexus/contracts';
import { Activity, ShieldCheck, Cpu, Database, Server, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-slate-800 bg-gradient-to-b from-zinc-200/5 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-slate-900/50 lg:p-4">
          <span className="font-semibold text-cyan-400">NEXUS</span>&nbsp;Platform v0.1.0 (Stage 1 Core)
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-slate-950 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Data Architecture Ready
          </span>
        </div>
      </div>

      <div className="my-16 text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Autonomous Cloud Intelligence Platform
        </h1>
        <p className="mt-6 text-lg text-slate-400 leading-relaxed">
          NEXUS discovers cloud infrastructure topologies, continuously monitors live telemetry, detects real operational anomalies, and guides evidence-backed remediations with human-governed execution boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3 text-cyan-400 mb-3">
            <Server className="h-5 w-5" />
            <h2 className="font-semibold text-slate-200">API Service</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            NestJS core REST engine running modular controllers, honest liveness/readiness probes, and OpenAPI v1 contracts.
          </p>
          <div className="text-xs font-mono text-slate-500">Port 4000 &bull; /healthz &bull; /readyz</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3 text-emerald-400 mb-3">
            <Cpu className="h-5 w-5" />
            <h2 className="font-semibold text-slate-200">Temporal Worker</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Durable workflow activities governing crash-resilient cloud synchronization, alert rule evaluations, and remediation approvals.
          </p>
          <div className="text-xs font-mono text-slate-500">Queue: nexus-main-queue</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur">
          <div className="flex items-center gap-3 text-indigo-400 mb-3">
            <Activity className="h-5 w-5" />
            <h2 className="font-semibold text-slate-200">Intelligence Engine</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Python FastAPI intelligence worker for deterministic anomaly detection and evidence-backed root cause synthesis.
          </p>
          <div className="text-xs font-mono text-slate-500">Port 8000 &bull; Python 3.13 &bull; FastAPI</div>
        </div>
      </div>

      <div className="mt-12 text-center text-xs font-mono text-slate-500">
        Strict Tenant Isolation &bull; Append-Only Audit Logging &bull; Zero Fabricated Records
      </div>
    </main>
  );
}

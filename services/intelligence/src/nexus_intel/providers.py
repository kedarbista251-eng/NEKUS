from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import List
from .schemas import (
    InvestigationRequest,
    InvestigationSynthesisResponse,
    ContributingFactor,
    MitigationAction,
)

class ModelProvider(ABC):
    @abstractmethod
    async def synthesize(self, request: InvestigationRequest) -> InvestigationSynthesisResponse:
        pass

class HeuristicFallbackProvider(ModelProvider):
    """
    Deterministic rule-based and graph-correlated fallback synthesizer.
    Used when cloud LLM providers are unconfigured or unavailable.
    Provides verifiable, non-hallucinated hypotheses based on observable telemetry and topology.
    """
    async def synthesize(self, request: InvestigationRequest) -> InvestigationSynthesisResponse:
        now_str = datetime.now(timezone.utc).isoformat()
        reasoning_trace: List[str] = [
            f"Synthesizer started at {now_str} using deterministic heuristics",
            f"Evaluating incident '{request.incident_id}' (severity: {request.severity})",
            f"Received {len(request.telemetry_samples)} telemetry samples and {len(request.topology_neighbors)} topology neighbors",
        ]

        # Extract telemetry patterns
        telemetry_text = " ".join([
            str(sample.get("message", "") or "") + " " + str(sample.get("body", "") or "")
            for sample in request.telemetry_samples
        ]).lower()

        primary_target = request.resource_id or "unknown-resource"
        blast_radius: List[str] = [primary_target]
        for neighbor in request.topology_neighbors:
            neighbor_id = neighbor.get("id") or neighbor.get("resource_id") or neighbor.get("name")
            if neighbor_id and neighbor_id not in blast_radius:
                blast_radius.append(str(neighbor_id))

        contributing_factors: List[ContributingFactor] = []
        mitigations: List[MitigationAction] = []
        confidence = 0.50

        # Pattern 1: Memory / Out Of Memory
        if "oom" in telemetry_text or "out of memory" in telemetry_text or "killed process" in telemetry_text:
            reasoning_trace.append("Matched pattern: OOM / Memory limit exceeded")
            confidence = 0.88
            hypothesis = f"Process terminated due to memory exhaustion (OOM) on resource {primary_target}."
            contributing_factors.append(
                ContributingFactor(
                    factor="Resource limit exceeded (Memory/OOM)",
                    weight=0.9,
                    evidence="Telemetry logs contain OOM killer termination events.",
                )
            )
            mitigations.append(
                MitigationAction(
                    action_type="scale_vertical",
                    target_resource=primary_target,
                    description=f"Increase container memory limit and restart instance for {primary_target}.",
                    risk_level="medium",
                    requires_human_approval=True,
                    parameters={"resource_id": primary_target, "memory_increase_ratio": 1.5},
                )
            )

        # Pattern 2: Connection Refused / Upstream Timeout
        elif "connection refused" in telemetry_text or "timeout" in telemetry_text or "econnrefused" in telemetry_text:
            reasoning_trace.append("Matched pattern: Network connectivity / upstream timeout")
            confidence = 0.82
            downstream_count = len(request.topology_neighbors)
            hypothesis = f"Upstream service connection failure or network partition affecting {primary_target} and {downstream_count} linked dependencies."
            contributing_factors.append(
                ContributingFactor(
                    factor="Upstream socket unreachable / timeout",
                    weight=0.85,
                    evidence="Telemetry logs indicate recurring socket connection failures or timeouts.",
                )
            )
            mitigations.append(
                MitigationAction(
                    action_type="restart_service",
                    target_resource=primary_target,
                    description=f"Perform controlled rolling restart and socket health verification on {primary_target}.",
                    risk_level="low",
                    requires_human_approval=False,
                    parameters={"resource_id": primary_target, "grace_period_seconds": 30},
                )
            )

        # Pattern 3: Disk / Storage Full
        elif "no space left on device" in telemetry_text or "disk full" in telemetry_text:
            reasoning_trace.append("Matched pattern: Disk volume full")
            confidence = 0.95
            hypothesis = f"Local disk storage volume is saturated on {primary_target}, preventing I/O operations."
            contributing_factors.append(
                ContributingFactor(
                    factor="Filesystem storage capacity exhausted",
                    weight=0.95,
                    evidence="Explicit 'no space left on device' disk error found in telemetry.",
                )
            )
            mitigations.append(
                MitigationAction(
                    action_type="purge_temp_and_expand_ebs",
                    target_resource=primary_target,
                    description=f"Clean transient cache logs and resize attached EBS/disk volume for {primary_target}.",
                    risk_level="medium",
                    requires_human_approval=True,
                    parameters={"resource_id": primary_target, "expand_gb": 50},
                )
            )

        # Pattern 4: Fallback when samples exist but no explicit error keywords
        elif request.telemetry_samples:
            reasoning_trace.append("No specific high-severity error keyword matched in telemetry samples")
            confidence = 0.60
            hypothesis = f"Anomalous metric deviation observed for {primary_target} with {len(request.telemetry_samples)} telemetry log entries recorded."
            contributing_factors.append(
                ContributingFactor(
                    factor="Telemetry anomaly",
                    weight=0.6,
                    evidence=f"Observed {len(request.telemetry_samples)} events during active incident window.",
                )
            )
            mitigations.append(
                MitigationAction(
                    action_type="isolate_and_collect_diagnostics",
                    target_resource=primary_target,
                    description=f"Isolate canary traffic and capture memory heap snapshot on {primary_target}.",
                    risk_level="low",
                    requires_human_approval=False,
                    parameters={"resource_id": primary_target},
                )
            )

        # Pattern 5: No telemetry samples provided (Honest empty state)
        else:
            reasoning_trace.append("Zero telemetry samples available in incident window")
            confidence = 0.35
            hypothesis = f"Insufficient telemetry collected to conclude specific root cause for {request.title} on {primary_target}."
            contributing_factors.append(
                ContributingFactor(
                    factor="Telemetry telemetry deficit",
                    weight=0.3,
                    evidence="No matching telemetry logs or metric timeseries linked to this incident window.",
                )
            )
            mitigations.append(
                MitigationAction(
                    action_type="enable_debug_telemetry",
                    target_resource=primary_target,
                    description=f"Configure elevated log level and Prometheus scraping on {primary_target}.",
                    risk_level="low",
                    requires_human_approval=False,
                    parameters={"resource_id": primary_target, "log_level": "DEBUG"},
                )
            )

        summary = (
            f"Heuristic analysis for incident {request.incident_id} concluded with confidence {confidence:.2f}. "
            f"Primary hypothesis: {hypothesis} Blast radius encompasses {len(blast_radius)} topology node(s)."
        )

        return InvestigationSynthesisResponse(
            incident_id=request.incident_id,
            provider="heuristic-deterministic",
            confidence_score=confidence,
            primary_hypothesis=hypothesis,
            blast_radius=blast_radius,
            contributing_factors=contributing_factors,
            recommended_mitigations=mitigations,
            analysis_summary=summary,
            reasoning_trace=reasoning_trace,
            completed_at=now_str,
        )

def get_synthesizer_provider() -> ModelProvider:
    # Future enhancement: check for AWS Bedrock / Anthropic / OpenAI credentials in environment
    # Always safely default to the deterministic, verifiable heuristic provider
    return HeuristicFallbackProvider()

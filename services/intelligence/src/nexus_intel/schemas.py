from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ContributingFactor(BaseModel):
    factor: str
    weight: float = Field(..., ge=0.0, le=1.0)
    evidence: str

class MitigationAction(BaseModel):
    action_type: str
    target_resource: str
    description: str
    risk_level: str = "medium"  # "low", "medium", "high"
    requires_human_approval: bool = True
    parameters: Dict[str, Any] = Field(default_factory=dict)

class InvestigationRequest(BaseModel):
    incident_id: str
    title: str
    severity: str = "sev2"  # "sev1", "sev2", "sev3", "sev4", "sev5"
    summary: Optional[str] = None
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None
    topology_neighbors: List[Dict[str, Any]] = Field(default_factory=list)
    telemetry_samples: List[Dict[str, Any]] = Field(default_factory=list)

class InvestigationSynthesisResponse(BaseModel):
    incident_id: str
    provider: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    primary_hypothesis: str
    blast_radius: List[str]
    contributing_factors: List[ContributingFactor]
    recommended_mitigations: List[MitigationAction]
    analysis_summary: str
    reasoning_trace: List[str]
    completed_at: str

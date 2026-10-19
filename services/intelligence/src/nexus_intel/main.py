from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Security, status, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from .config import settings
from .schemas import InvestigationRequest, InvestigationSynthesisResponse
from .providers import get_synthesizer_provider

app = FastAPI(
    title="NEXUS Intelligence Service",
    description="Deterministic anomaly detection, telemetry inference, and AI investigation agents",
    version="1.0.0",
)

api_key_header = APIKeyHeader(name="X-Intelligence-Key", auto_error=False)

def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid service-to-service intelligence key",
        )
    return key

class LivenessResponse(BaseModel):
    status: str
    service: str
    timestamp: str

@app.get("/healthz", response_model=LivenessResponse)
async def healthz():
    return {
        "status": "ok",
        "service": settings.service_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.post(
    "/v1/investigate",
    response_model=InvestigationSynthesisResponse,
    dependencies=[Depends(verify_api_key)],
)
async def investigate_incident(request: InvestigationRequest) -> InvestigationSynthesisResponse:
    provider = get_synthesizer_provider()
    return await provider.synthesize(request)

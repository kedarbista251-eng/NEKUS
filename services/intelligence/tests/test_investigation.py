import pytest
from httpx import AsyncClient, ASGITransport
from nexus_intel.main import app

@pytest.mark.asyncio
async def test_investigate_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/v1/investigate", json={
            "incident_id": "inc-001",
            "title": "High error rate",
        })
    assert response.status_code == 403
    assert "Invalid service-to-service intelligence key" in response.json()["detail"]

@pytest.mark.asyncio
async def test_investigate_oom_scenario():
    transport = ASGITransport(app=app)
    headers = {"X-Intelligence-Key": "internal-intel-key"}
    payload = {
        "incident_id": "inc-oom-123",
        "title": "Payment gateway pod crash looping",
        "severity": "sev1",
        "resource_id": "k8s-pod-payment-service-89f9",
        "topology_neighbors": [
            {"id": "rds-postgres-main", "name": "RDS Aurora"},
            {"id": "ingress-alb", "name": "Application Load Balancer"}
        ],
        "telemetry_samples": [
            {"message": "kernel: [1293.41] Out of memory: Killed process 4118 (node) total-vm:4214MB"},
            {"message": "Kubelet pod payment-service-89f9 status OOMKilled exit code 137"}
        ]
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/v1/investigate", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "inc-oom-123"
    assert data["provider"] == "heuristic-deterministic"
    assert data["confidence_score"] >= 0.8
    assert "OOM" in data["primary_hypothesis"] or "memory exhaustion" in data["primary_hypothesis"]
    assert "k8s-pod-payment-service-89f9" in data["blast_radius"]
    assert "rds-postgres-main" in data["blast_radius"]
    assert len(data["recommended_mitigations"]) > 0
    assert data["recommended_mitigations"][0]["action_type"] == "scale_vertical"

@pytest.mark.asyncio
async def test_investigate_empty_telemetry_honest_state():
    transport = ASGITransport(app=app)
    headers = {"X-Intelligence-Key": "internal-intel-key"}
    payload = {
        "incident_id": "inc-empty-999",
        "title": "Unexplained latency spike",
        "severity": "sev2",
        "resource_id": "lambda-auth-worker",
        "topology_neighbors": [],
        "telemetry_samples": []
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/v1/investigate", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "inc-empty-999"
    # Honestly reports low confidence and requests debug telemetry
    assert data["confidence_score"] <= 0.4
    assert "Insufficient telemetry" in data["primary_hypothesis"]
    assert data["recommended_mitigations"][0]["action_type"] == "enable_debug_telemetry"

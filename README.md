# NEXUS Autonomous Cloud Intelligence Platform

NEXUS is an enterprise-grade multi-tenant autonomous cloud operations and intelligence platform. It discovers infrastructure dependencies, monitors operational behavior via OpenTelemetry telemetry, detects anomalies, conducts AI-assisted root-cause investigations backed by concrete evidence, and securely plans and verifies human-authorized remediations.

## Repository Architecture

The repository is structured as a TypeScript-first monorepo using `pnpm` workspaces:

```text
nexus/
├── apps/
│   ├── web/                 # Next.js modern operations console (React, Tailwind, React Flow)
│   ├── api/                 # NestJS modular core API service
│   └── worker/              # Node.js Temporal durable workflow activities & SQS consumers
├── services/
│   └── intelligence/        # Python FastAPI + Pydantic AI/ML & anomaly detection services
├── packages/
│   ├── contracts/           # Shared Zod schemas, domain envelopes, and permission catalogue
│   ├── db/                  # Drizzle ORM schema, SQL migrations, and RLS multi-tenant policies
│   ├── observability/       # OpenTelemetry instrumentation and redacted structured logging
│   └── config/              # Runtime environment validation schemas
├── infra/
│   ├── docker/              # Local dependencies (Postgres, Redis, Temporal, ElasticMQ)
│   └── terraform/           # AWS Infrastructure as Code modules (ECS Fargate, RDS, S3, SQS)
└── docs/                    # Architecture Decision Records (ADRs) and operational runbooks
```

## Quickstart & Local Development

### Prerequisites
- Node.js >= 22
- pnpm >= 10
- Python >= 3.12 (for `services/intelligence`)
- Docker & Docker Compose (for local database, cache, and workflow orchestrator)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/kedarbista251-eng/NEKUS.git
   cd NEKUS
   ```
2. Configure local environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start local backing infrastructure:
   ```bash
   docker compose -f infra/docker/docker-compose.yml up -d
   ```
5. Run automated validation:
   ```bash
   pnpm run typecheck
   pnpm run test
   ```

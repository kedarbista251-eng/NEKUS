CREATE TABLE "telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"resource_arn" text,
	"idempotency_key" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"ingest_token_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telemetry_sources_ingest_token_hash_unique" UNIQUE("ingest_token_hash")
);
--> statement-breakpoint
ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_source_id_telemetry_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."telemetry_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_sources" ADD CONSTRAINT "telemetry_sources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_event_dedup_idx" ON "telemetry_events" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "org_telemetry_time_idx" ON "telemetry_events" USING btree ("organization_id","timestamp");--> statement-breakpoint
CREATE INDEX "org_telemetry_source_idx" ON "telemetry_sources" USING btree ("organization_id","source_type");
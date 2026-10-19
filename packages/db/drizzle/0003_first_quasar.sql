CREATE TABLE "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"severity" text NOT NULL,
	"condition" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"incident_id" uuid NOT NULL,
	"evidence_type" text NOT NULL,
	"source_identifier" text NOT NULL,
	"confidence" integer DEFAULT 100 NOT NULL,
	"data" jsonb NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"alert_rule_id" uuid,
	"title" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'detected' NOT NULL,
	"source" text NOT NULL,
	"assigned_to_user_id" uuid,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_alert_rule_id_alert_rules_id_fk" FOREIGN KEY ("alert_rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_alert_rules_idx" ON "alert_rules" USING btree ("organization_id","is_enabled");--> statement-breakpoint
CREATE INDEX "org_evidence_incident_idx" ON "incident_evidence" USING btree ("organization_id","incident_id");--> statement-breakpoint
CREATE INDEX "org_incident_status_idx" ON "incidents" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "org_incident_time_idx" ON "incidents" USING btree ("organization_id","detected_at");
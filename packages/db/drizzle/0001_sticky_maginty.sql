CREATE TABLE "cloud_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"account_id" text NOT NULL,
	"region" text NOT NULL,
	"resource_id" text NOT NULL,
	"resource_type" text NOT NULL,
	"arn" text NOT NULL,
	"name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"source_resource_id" uuid NOT NULL,
	"target_resource_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"evidence_source" text NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud_resources" ADD CONSTRAINT "cloud_resources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_source_resource_id_cloud_resources_id_fk" FOREIGN KEY ("source_resource_id") REFERENCES "public"."cloud_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_target_resource_id_cloud_resources_id_fk" FOREIGN KEY ("target_resource_id") REFERENCES "public"."cloud_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_resource_unique_idx" ON "cloud_resources" USING btree ("organization_id","provider","account_id","arn");--> statement-breakpoint
CREATE INDEX "org_res_type_idx" ON "cloud_resources" USING btree ("organization_id","resource_type");--> statement-breakpoint
CREATE INDEX "org_rel_source_idx" ON "resource_relationships" USING btree ("organization_id","source_resource_id");--> statement-breakpoint
CREATE INDEX "org_rel_target_idx" ON "resource_relationships" USING btree ("organization_id","target_resource_id");
CREATE TABLE "live_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_path" text NOT NULL,
	"user_id" varchar(36),
	"session_id" text NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_path" text NOT NULL,
	"user_id" varchar(36),
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "privacy_consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"data_collection" boolean NOT NULL,
	"feedback_usage" boolean NOT NULL,
	"email_notifications" boolean DEFAULT false NOT NULL,
	"marketing_emails" boolean DEFAULT false NOT NULL,
	"consent_version" varchar(10) DEFAULT '1.0' NOT NULL,
	"consented_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stocks" ADD COLUMN "market" text DEFAULT 'NSE' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_live_activity_session" ON "live_activity" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_live_activity_time" ON "live_activity" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "idx_page_views_path" ON "page_views" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "idx_page_views_time" ON "page_views" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_page_views_user" ON "page_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_consent_user_id" ON "privacy_consent" USING btree ("user_id");
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_path" varchar(255) NOT NULL,
	"user_ip" varchar(45),
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_page_views_path" ON "page_views" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "idx_page_views_created" ON "page_views" USING btree ("created_at");
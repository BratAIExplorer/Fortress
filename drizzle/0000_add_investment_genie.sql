CREATE TABLE "alpha_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now(),
	"criteria_performance" jsonb,
	"weight_recommendations" jsonb,
	"hit_rate_by_market" jsonb,
	"hit_rate_by_tier" jsonb,
	"total_picks_analyzed" integer,
	"overall_hit_rate" numeric(5, 4),
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "alpha_insights_cycle_id_unique" UNIQUE("cycle_id")
);
--> statement-breakpoint
CREATE TABLE "alpha_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"override_date" timestamp with time zone DEFAULT now(),
	"override_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alpha_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"name" text,
	"market" text NOT NULL,
	"gem_score" integer NOT NULL,
	"score_breakdown" jsonb NOT NULL,
	"bonus_modifiers" jsonb,
	"penalty_modifiers" jsonb,
	"score_tier" text NOT NULL,
	"entry_price" numeric(14, 4),
	"entry_date" timestamp with time zone DEFAULT now(),
	"risk_tier" text NOT NULL,
	"thesis" text,
	"key_risk" text,
	"sector" text,
	"currency" text DEFAULT 'USD',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alpha_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_date" timestamp with time zone DEFAULT now(),
	"markets" text[],
	"risk_mode" text NOT NULL,
	"total_picks" integer,
	"active_weights" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alpha_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"check_date" timestamp with time zone DEFAULT now(),
	"check_type" text NOT NULL,
	"current_price" numeric(14, 4),
	"return_pct" numeric(8, 4),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alpha_weight_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"effective_date" timestamp with time zone DEFAULT now(),
	"old_weights" jsonb,
	"new_weights" jsonb,
	"reason" text,
	"insight_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid,
	"collection_id" uuid,
	"action_type" text NOT NULL,
	"reason" text NOT NULL,
	"old_weight" numeric,
	"new_weight" numeric,
	"occurred_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collection_members" (
	"collection_id" uuid NOT NULL,
	"stock_id" uuid NOT NULL,
	"weight_conservative" numeric DEFAULT '0',
	"weight_balanced" numeric DEFAULT '0',
	"weight_aggressive" numeric DEFAULT '0',
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "collection_members_collection_id_stock_id_pk" PRIMARY KEY("collection_id","stock_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "collections_name_unique" UNIQUE("name"),
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	"category" text,
	"source" text,
	CONSTRAINT "concepts_term_unique" UNIQUE("term")
);
--> statement-breakpoint
CREATE TABLE "intelligence_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid,
	"snapshot_date" date NOT NULL,
	"signals" jsonb NOT NULL,
	"sector_impacts" jsonb NOT NULL,
	"environment" jsonb NOT NULL,
	"summary" text,
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments_genie_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"recommendation_id" uuid,
	"feedback_type" varchar(20) NOT NULL,
	"rating" smallint,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments_genie_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_sessions" integer DEFAULT 0,
	"total_recommendations" integer DEFAULT 0,
	"executed_recommendations" integer DEFAULT 0,
	"average_return" numeric(5, 2) DEFAULT '0',
	"win_rate" numeric(5, 2) DEFAULT '0',
	"best_pick" varchar(20),
	"worst_pick" varchar(20),
	"performance_by_market" jsonb DEFAULT '{"NSE": 0, "US": 0, "HK": 0}',
	"performance_by_sector" jsonb DEFAULT '{}',
	"performance_30d" numeric(5, 2) DEFAULT '0',
	"performance_90d" numeric(5, 2) DEFAULT '0',
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments_genie_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"market" varchar(10) NOT NULL,
	"sector" varchar(30),
	"company_name" varchar(100),
	"allocation_percent" numeric(5, 2) NOT NULL,
	"pick_score" numeric(5, 2) DEFAULT '0',
	"risk_score" numeric(5, 2) DEFAULT '0',
	"reasoning" text,
	"entry_price" numeric(12, 2),
	"is_actual" boolean DEFAULT false,
	"actual_entry_price" numeric(12, 2),
	"actual_quantity" numeric(12, 4),
	"exit_price" numeric(12, 2),
	"exit_date" date,
	"pick_status" varchar(20) DEFAULT 'pending',
	"profit_loss" numeric(12, 2),
	"profit_loss_percent" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments_genie_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"risk_tolerance" varchar(20) NOT NULL,
	"investment_horizon" varchar(20) NOT NULL,
	"sector_preferences" text[] DEFAULT '{}',
	"cash_position" numeric(10, 2) DEFAULT '0',
	"current_exposure" jsonb DEFAULT '{"stocks": 0, "bonds": 0, "cash": 100, "alternatives": 0}',
	"recommended_allocation" jsonb NOT NULL,
	"confidence_score" smallint DEFAULT 50,
	"rationale" text,
	"session_status" varchar(20) DEFAULT 'completed',
	"macro_context_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "investments_genie_watchlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"market" varchar(10) NOT NULL,
	"added_at" timestamp with time zone DEFAULT now(),
	"alert_price_target" numeric(12, 2),
	"alert_stop_loss" numeric(12, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "macro_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"nifty_50" numeric,
	"bank_nifty" numeric,
	"usd_inr" numeric,
	"gold_usd" numeric,
	"crude_oil_usd" numeric,
	"us_10y_yield" numeric,
	"cboe_vix" numeric,
	"india_vix" numeric,
	"fetched_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "macro_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "scan_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"price_at_scan" numeric,
	"l1_pass" boolean,
	"l2_pass" boolean,
	"l3_pass" boolean,
	"l4_pass" boolean,
	"l5_pass" boolean,
	"l6_pass" boolean,
	"total_score" integer,
	"category" text,
	"market" text DEFAULT 'NSE' NOT NULL,
	"rank_in_category" integer,
	"mb_score" integer,
	"mb_tier" text,
	"megatrend_tag" text,
	"megatrend_emoji" text,
	"fcf_yield_pct" numeric,
	"earnings_quality" numeric,
	"peg_ratio" numeric,
	"de_direction" text,
	"margin_direction" text,
	"cc_score" integer,
	"cc_tier" text,
	"cc_revenue_cagr" numeric,
	"cc_years_checked" integer
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_at" timestamp with time zone DEFAULT now(),
	"status" text NOT NULL,
	"total_scanned" integer,
	"duration_ms" integer,
	"triggered_by" text,
	"market" text DEFAULT 'NSE' NOT NULL,
	"error_message" text,
	"good_results_count" integer
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"logo_url" text,
	"current_price" numeric,
	"quality_score" integer,
	"market_cap_crores" numeric,
	"pe_ratio" numeric,
	"roce_5yr_avg" numeric,
	"debt_to_equity" numeric,
	"megatrend" text[],
	"is_active" boolean DEFAULT true,
	"v5_category" text,
	"tag" text,
	"risk" text,
	"industry" text,
	"drop_52w" numeric,
	"moat" text,
	"l1" integer,
	"l2" integer,
	"l3" integer,
	"l4" integer,
	"l5" integer,
	"why_down" text,
	"why_buy" text,
	"penny_why" text,
	"multi_bagger_case" text,
	"killer_risk" text,
	"fortress_note" text,
	"ocf" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "stocks_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "theses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"one_liner" text NOT NULL,
	"megatrend" text[],
	"moat_source" text,
	"financial_strength_score" integer,
	"investment_logic" text NOT NULL,
	"risks" text NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alpha_overrides" ADD CONSTRAINT "alpha_overrides_prediction_id_alpha_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."alpha_predictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_predictions" ADD CONSTRAINT "alpha_predictions_scan_id_alpha_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."alpha_scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_tracking" ADD CONSTRAINT "alpha_tracking_prediction_id_alpha_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."alpha_predictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_weight_history" ADD CONSTRAINT "alpha_weight_history_insight_id_alpha_insights_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."alpha_insights"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_members" ADD CONSTRAINT "collection_members_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_members" ADD CONSTRAINT "collection_members_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_reports" ADD CONSTRAINT "intelligence_reports_snapshot_id_macro_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."macro_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments_genie_feedback" ADD CONSTRAINT "investments_genie_feedback_session_id_investments_genie_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."investments_genie_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments_genie_feedback" ADD CONSTRAINT "investments_genie_feedback_recommendation_id_investments_genie_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."investments_genie_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments_genie_recommendations" ADD CONSTRAINT "investments_genie_recommendations_session_id_investments_genie_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."investments_genie_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theses" ADD CONSTRAINT "theses_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_genie_feedback_session" ON "investments_genie_feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_genie_recs_session" ON "investments_genie_recommendations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_genie_recs_symbol" ON "investments_genie_recommendations" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "idx_genie_sessions_user" ON "investments_genie_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_genie_watchlist_user" ON "investments_genie_watchlists" USING btree ("user_id");
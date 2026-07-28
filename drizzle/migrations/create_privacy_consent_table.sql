-- Session 29: Create the privacy_consent table.
-- It was already defined in lib/db/schema/consent.ts but never migrated
-- into this database — the register endpoint validated consent and
-- discarded it. Brand-new table; cannot affect any existing data.

CREATE TABLE IF NOT EXISTS "privacy_consent" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "data_collection" boolean NOT NULL,
  "feedback_usage" boolean NOT NULL,
  "email_notifications" boolean NOT NULL DEFAULT false,
  "marketing_emails" boolean NOT NULL DEFAULT false,
  "consent_version" varchar(10) NOT NULL DEFAULT '1.0',
  "consented_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_consent_user_id" ON "privacy_consent" ("user_id");

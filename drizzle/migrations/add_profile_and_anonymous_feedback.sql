-- Session 29: Expanded signup profile fields + anonymous feedback support
-- All changes are additive (new nullable columns) or constraint-loosening
-- (NOT NULL -> nullable). Neither operation can break or alter existing rows.
-- Safe to run against production with live accounts.

ALTER TABLE "auth_user" ADD COLUMN IF NOT EXISTS "country_of_residence" varchar(2);
ALTER TABLE "auth_user" ADD COLUMN IF NOT EXISTS "country_of_origin" varchar(2);
ALTER TABLE "auth_user" ADD COLUMN IF NOT EXISTS "signup_purpose" varchar(50);
ALTER TABLE "auth_user" ADD COLUMN IF NOT EXISTS "referral_source" varchar(50);

ALTER TABLE "feedback" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "feedback" ALTER COLUMN "user_email" DROP NOT NULL;
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "guest_email" varchar(255);

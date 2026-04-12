ALTER TABLE "trip"
ADD COLUMN "created_by_user_id" TEXT;

UPDATE "trip" AS t
SET "created_by_user_id" = tm."user_id"
FROM (
  SELECT DISTINCT ON ("trip_id")
    "trip_id",
    "user_id"
  FROM "trip_membership"
  ORDER BY "trip_id", "created_at" ASC, "id" ASC
) AS tm
WHERE tm."trip_id" = t."id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "trip"
    WHERE "created_by_user_id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot backfill trip.created_by_user_id because one or more trips do not have memberships';
  END IF;
END $$;

ALTER TABLE "trip"
ALTER COLUMN "created_by_user_id" SET NOT NULL;

ALTER TABLE "trip"
ADD CONSTRAINT "trip_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "trip_created_by_user_id_idx" ON "trip"("created_by_user_id");

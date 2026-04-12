ALTER TABLE "expense_split"
DROP CONSTRAINT "expense_split_expense_id_fkey",
ADD CONSTRAINT "expense_split_expense_id_fkey"
FOREIGN KEY ("expense_id") REFERENCES "expense"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trip_membership"
DROP CONSTRAINT "trip_membership_trip_id_fkey",
ADD CONSTRAINT "trip_membership_trip_id_fkey"
FOREIGN KEY ("trip_id") REFERENCES "trip"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "expense"
DROP CONSTRAINT "expense_trip_id_fkey",
ADD CONSTRAINT "expense_trip_id_fkey"
FOREIGN KEY ("trip_id") REFERENCES "trip"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contribution"
DROP CONSTRAINT "contribution_trip_id_fkey",
ADD CONSTRAINT "contribution_trip_id_fkey"
FOREIGN KEY ("trip_id") REFERENCES "trip"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invitation"
DROP CONSTRAINT "invitation_trip_id_fkey",
ADD CONSTRAINT "invitation_trip_id_fkey"
FOREIGN KEY ("trip_id") REFERENCES "trip"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

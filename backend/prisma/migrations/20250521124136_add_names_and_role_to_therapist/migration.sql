-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Therapist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'therapist'
);
INSERT INTO "new_Therapist" ("email", "id", "password") SELECT "email", "id", "password" FROM "Therapist";
DROP TABLE "Therapist";
ALTER TABLE "new_Therapist" RENAME TO "Therapist";
CREATE UNIQUE INDEX "Therapist_email_key" ON "Therapist"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

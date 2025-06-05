-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "performedById" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserActivityLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserActivityLog" ("action", "details", "id", "timestamp", "userId") SELECT "action", "details", "id", "timestamp", "userId" FROM "UserActivityLog";
DROP TABLE "UserActivityLog";
ALTER TABLE "new_UserActivityLog" RENAME TO "UserActivityLog";
CREATE INDEX "UserActivityLog_userId_idx" ON "UserActivityLog"("userId");
CREATE INDEX "UserActivityLog_performedById_idx" ON "UserActivityLog"("performedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

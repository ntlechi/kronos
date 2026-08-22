-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonPriority" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonPriority_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_tenantId_isActive_idx" ON "Season"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "SeasonPriority_seasonId_idx" ON "SeasonPriority"("seasonId");

-- CreateIndex
CREATE INDEX "SeasonPriority_projectId_idx" ON "SeasonPriority"("projectId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonPriority" ADD CONSTRAINT "SeasonPriority_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonPriority" ADD CONSTRAINT "SeasonPriority_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "EV" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Argentina',
    "status" TEXT NOT NULL DEFAULT 'Activa',
    "leaderName" TEXT,
    "leaderRole" TEXT,
    "electionDate" TIMESTAMP(3),
    "totalVolunteers" INTEGER NOT NULL DEFAULT 0,
    "idoneidad" BOOLEAN NOT NULL DEFAULT false,
    "planAnual" BOOLEAN NOT NULL DEFAULT false,
    "visitaPlanif" BOOLEAN NOT NULL DEFAULT false,
    "visitaRealizada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hosting" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalQuota" INTEGER NOT NULL DEFAULT 0,
    "shQuota" INTEGER NOT NULL DEFAULT 0,
    "nhQuota" INTEGER NOT NULL DEFAULT 0,
    "shStatus" TEXT NOT NULL DEFAULT 'Pendiente',
    "nhStatus" TEXT NOT NULL DEFAULT 'Pendiente',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sending" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL,
    "students" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EWA" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "sending" DOUBLE PRECISION,
    "preparation" DOUBLE PRECISION,
    "hosting" DOUBLE PRECISION,
    "devVolunt" DOUBLE PRECISION,
    "leadership" DOUBLE PRECISION,
    "communityEd" DOUBLE PRECISION,
    "finances" DOUBLE PRECISION,
    "marketing" DOUBLE PRECISION,
    "rrii" DOUBLE PRECISION,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EWA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinator" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "since" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "coordinatorId" INTEGER,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVNote" (
    "id" SERIAL NOT NULL,
    "evId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EVNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EVTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVTagOnEV" (
    "evId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "EVTagOnEV_pkey" PRIMARY KEY ("evId","tagId")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EWA_evId_year_key" ON "EWA"("evId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_evId_area_key" ON "Coordinator"("evId", "area");

-- CreateIndex
CREATE UNIQUE INDEX "EVTag_name_key" ON "EVTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogItem_type_key_key" ON "CatalogItem"("type", "key");

-- AddForeignKey
ALTER TABLE "Hosting" ADD CONSTRAINT "Hosting_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sending" ADD CONSTRAINT "Sending_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EWA" ADD CONSTRAINT "EWA_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinator" ADD CONSTRAINT "Coordinator_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Coordinator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EVNote" ADD CONSTRAINT "EVNote_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EVTagOnEV" ADD CONSTRAINT "EVTagOnEV_evId_fkey" FOREIGN KEY ("evId") REFERENCES "EV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EVTagOnEV" ADD CONSTRAINT "EVTagOnEV_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "EVTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

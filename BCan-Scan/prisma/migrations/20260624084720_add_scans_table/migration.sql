-- CreateTable
CREATE TABLE "scans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "patient_number" VARCHAR(255) NOT NULL,
    "classification" VARCHAR(100) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "level" VARCHAR(100) NOT NULL,
    "score" INTEGER NOT NULL,
    "report" TEXT NOT NULL,
    "image_base64" TEXT,
    "grad_cam_base64" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scans_user_id_idx" ON "scans"("user_id");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

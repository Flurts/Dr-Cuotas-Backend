import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1744349074248 implements MigrationInterface {
    name = 'BackendMigration1744349074248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rating_doctor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" character varying NOT NULL, "rating" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_a0d44540bfc47c2b5df3ef8138b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a0d44540bfc47c2b5df3ef8138" ON "rating_doctor" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_56c91b9213e8411d0566465be6" ON "rating_doctor" ("userId", "doctorId") `);
        await queryRunner.query(`ALTER TYPE "public"."surgery_category_enum" RENAME TO "surgery_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."surgery_category_enum" AS ENUM('FacialSurgeries', 'BreastSurgeries', 'BodySurgeries', 'ReconstructiveSurgeries', 'GeneralSurgeries', 'CosmeticSurgeries', 'OrthopedicSurgeries', 'NeurologicalSurgeries', 'OphthalmicSurgeries', 'PediatricSurgeries', 'UrologicSurgeries', 'GynecologicSurgeries', 'ThoracicSurgeries', 'TransplantSurgeries', 'ENTSurgeries', 'DentalSurgeries')`);
        await queryRunner.query(`ALTER TABLE "surgery" ALTER COLUMN "category" TYPE "public"."surgery_category_enum" USING "category"::"text"::"public"."surgery_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."surgery_category_enum_old"`);
        await queryRunner.query(`ALTER TABLE "rating_doctor" ADD CONSTRAINT "FK_c6a2001474fd5229e15e145313a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating_doctor" DROP CONSTRAINT "FK_c6a2001474fd5229e15e145313a"`);
        await queryRunner.query(`CREATE TYPE "public"."surgery_category_enum_old" AS ENUM('FacialSurgeries', 'BreastSurgeries', 'BodySurgeries', 'ReconstructiveSurgeries', 'GeneralSurgeries')`);
        await queryRunner.query(`ALTER TABLE "surgery" ALTER COLUMN "category" TYPE "public"."surgery_category_enum_old" USING "category"::"text"::"public"."surgery_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."surgery_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."surgery_category_enum_old" RENAME TO "surgery_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56c91b9213e8411d0566465be6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0d44540bfc47c2b5df3ef8138"`);
        await queryRunner.query(`DROP TABLE "rating_doctor"`);
    }

}

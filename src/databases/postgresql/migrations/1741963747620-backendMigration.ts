import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741963747620 implements MigrationInterface {
    name = 'BackendMigration1741963747620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" DROP CONSTRAINT "FK_865ead58955728192dc6be44982"`);
        await queryRunner.query(`ALTER TABLE "surgery" RENAME COLUMN "doctorId" TO "subcategory"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('success', 'pending', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" character varying(255) NOT NULL, "AdjudicadosId" character varying(255), "status" "public"."transaction_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "UQ_a1b19b56f68e9142139aa9219bd" UNIQUE ("externalId"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "surgery_doctor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid, "surgeryId" uuid, CONSTRAINT "PK_f488d917066bcbf1c35cedc543e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ad" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL, "link" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0193d5ef09746e88e9ea92c634d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0193d5ef09746e88e9ea92c634" ON "ad" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."evidence_type_enum" AS ENUM('youtube', 'media')`);
        await queryRunner.query(`CREATE TABLE "evidence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL, "link" character varying NOT NULL, "type" "public"."evidence_type_enum" NOT NULL DEFAULT 'media', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "doctorId" uuid, CONSTRAINT "PK_b864cb5d49854f89917fc0b44b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b864cb5d49854f89917fc0b44b" ON "evidence" ("id") `);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "country" text`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "provincia" text`);
        await queryRunner.query(`ALTER TABLE "surgery" DROP COLUMN "subcategory"`);
        await queryRunner.query(`CREATE TYPE "public"."surgery_subcategory_enum" AS ENUM('EyelidSurgery', 'Facelift', 'BreastAugmentation', 'BreastReduction', 'BreastLift', 'Liposuction', 'TummyTuck', 'ButtockLift')`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD "subcategory" "public"."surgery_subcategory_enum" DEFAULT 'BreastAugmentation'`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" ADD CONSTRAINT "FK_fdef2e28817ebffabf4d39787d8" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" ADD CONSTRAINT "FK_e21f79cbd6670d4ad6a4d9f61c0" FOREIGN KEY ("surgeryId") REFERENCES "surgery"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evidence" ADD CONSTRAINT "FK_9a0f4db3858ac017933e5b7482b" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evidence" DROP CONSTRAINT "FK_9a0f4db3858ac017933e5b7482b"`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" DROP CONSTRAINT "FK_e21f79cbd6670d4ad6a4d9f61c0"`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" DROP CONSTRAINT "FK_fdef2e28817ebffabf4d39787d8"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "surgery" DROP COLUMN "subcategory"`);
        await queryRunner.query(`DROP TYPE "public"."surgery_subcategory_enum"`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD "subcategory" uuid`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "provincia"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "country"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b864cb5d49854f89917fc0b44b"`);
        await queryRunner.query(`DROP TABLE "evidence"`);
        await queryRunner.query(`DROP TYPE "public"."evidence_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0193d5ef09746e88e9ea92c634"`);
        await queryRunner.query(`DROP TABLE "ad"`);
        await queryRunner.query(`DROP TABLE "surgery_doctor"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "surgery" RENAME COLUMN "subcategory" TO "doctorId"`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD CONSTRAINT "FK_865ead58955728192dc6be44982" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1720772377989 implements MigrationInterface {
    name = 'BackendMigration1720772377989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "date_payment"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "quota_price" integer`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "total_price" integer`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "start_date_payment" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "end_date_payment" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "doctorId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."adjudicated_adjudicated_status_enum" RENAME TO "adjudicated_adjudicated_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."adjudicated_adjudicated_status_enum" AS ENUM('Active', 'Verified', 'Validating', 'Rejected', 'Blocked')`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ALTER COLUMN "adjudicated_status" TYPE "public"."adjudicated_adjudicated_status_enum" USING "adjudicated_status"::"text"::"public"."adjudicated_adjudicated_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."adjudicated_adjudicated_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."file_db_file_type_enum" RENAME TO "file_db_file_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."file_db_file_type_enum" AS ENUM('CURRICULUM_VITAE', 'DOCTOR_PHOTOS', 'DOCTOR_VIDEOS', 'SURGERY_PHOTOS', 'SURGERY_VIDEOS', 'PAYMENT_RECEIPT')`);
        await queryRunner.query(`ALTER TABLE "file_db" ALTER COLUMN "file_type" TYPE "public"."file_db_file_type_enum" USING "file_type"::"text"::"public"."file_db_file_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_db_file_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD CONSTRAINT "FK_8a89c5cb755bba556668cf190c5" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP CONSTRAINT "FK_8a89c5cb755bba556668cf190c5"`);
        await queryRunner.query(`CREATE TYPE "public"."file_db_file_type_enum_old" AS ENUM('CURRICULUM_VITAE', 'DOCTOR_PHOTOS', 'DOCTOR_VIDEOS', 'SURGERY_PHOTOS', 'SURGERY_VIDEOS')`);
        await queryRunner.query(`ALTER TABLE "file_db" ALTER COLUMN "file_type" TYPE "public"."file_db_file_type_enum_old" USING "file_type"::"text"::"public"."file_db_file_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."file_db_file_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."file_db_file_type_enum_old" RENAME TO "file_db_file_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."adjudicated_adjudicated_status_enum_old" AS ENUM('Active', 'Validating', 'Rejected', 'Blocked')`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ALTER COLUMN "adjudicated_status" TYPE "public"."adjudicated_adjudicated_status_enum_old" USING "adjudicated_status"::"text"::"public"."adjudicated_adjudicated_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."adjudicated_adjudicated_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."adjudicated_adjudicated_status_enum_old" RENAME TO "adjudicated_adjudicated_status_enum"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "end_date_payment"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "start_date_payment"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "total_price"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" DROP COLUMN "quota_price"`);
        await queryRunner.query(`ALTER TABLE "adjudicated" ADD "date_payment" TIMESTAMP`);
    }

}

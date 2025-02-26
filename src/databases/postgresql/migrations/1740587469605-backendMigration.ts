import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1740587469605 implements MigrationInterface {
    name = 'BackendMigration1740587469605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" DROP CONSTRAINT "FK_865ead58955728192dc6be44982"`);
        await queryRunner.query(`CREATE TABLE "surgery_doctor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid, "surgeryId" uuid, CONSTRAINT "PK_f488d917066bcbf1c35cedc543e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "surgery" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" ADD CONSTRAINT "FK_fdef2e28817ebffabf4d39787d8" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" ADD CONSTRAINT "FK_e21f79cbd6670d4ad6a4d9f61c0" FOREIGN KEY ("surgeryId") REFERENCES "surgery"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery_doctor" DROP CONSTRAINT "FK_e21f79cbd6670d4ad6a4d9f61c0"`);
        await queryRunner.query(`ALTER TABLE "surgery_doctor" DROP CONSTRAINT "FK_fdef2e28817ebffabf4d39787d8"`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD "doctorId" uuid`);
        await queryRunner.query(`DROP TABLE "surgery_doctor"`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD CONSTRAINT "FK_865ead58955728192dc6be44982" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

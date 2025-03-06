import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741288477302 implements MigrationInterface {
    name = 'BackendMigration1741288477302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ADD "country" text`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "provincia" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "provincia"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "country"`);
    }

}

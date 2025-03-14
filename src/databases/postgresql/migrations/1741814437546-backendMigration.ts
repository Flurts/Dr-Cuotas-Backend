import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741814437546 implements MigrationInterface {
    name = 'BackendMigration1741814437546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "AdjudicadosId" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "AdjudicadosId"`);
    }

}

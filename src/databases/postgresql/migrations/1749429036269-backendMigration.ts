import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1749429036269 implements MigrationInterface {
    name = 'BackendMigration1749429036269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "amount" numeric(10,2) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "amount"`);
    }

}

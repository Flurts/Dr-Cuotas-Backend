import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1722992516960 implements MigrationInterface {
    name = 'BackendMigration1722992516960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" ADD "rating" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" DROP COLUMN "rating"`);
    }

}

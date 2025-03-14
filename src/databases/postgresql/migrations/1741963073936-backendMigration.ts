import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741963073936 implements MigrationInterface {
    name = 'BackendMigration1741963073936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" ALTER COLUMN "subcategory" SET DEFAULT 'BreastAugmentation'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" ALTER COLUMN "subcategory" SET DEFAULT 'Liposuction'`);
    }

}

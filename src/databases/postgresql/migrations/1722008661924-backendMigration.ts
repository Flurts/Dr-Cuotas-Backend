import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1722008661924 implements MigrationInterface {
    name = 'BackendMigration1722008661924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_01eea41349b6c9275aec646eee0"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);
    }

}

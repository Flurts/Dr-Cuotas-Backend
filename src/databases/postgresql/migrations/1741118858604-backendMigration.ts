import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741118858604 implements MigrationInterface {
    name = 'BackendMigration1741118858604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evidence" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."evidence_type_enum" AS ENUM('youtube', 'media')`);
        await queryRunner.query(`ALTER TABLE "evidence" ADD "type" "public"."evidence_type_enum" NOT NULL DEFAULT 'media'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evidence" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."evidence_type_enum"`);
        await queryRunner.query(`ALTER TABLE "evidence" ADD "type" character varying NOT NULL`);
    }

}

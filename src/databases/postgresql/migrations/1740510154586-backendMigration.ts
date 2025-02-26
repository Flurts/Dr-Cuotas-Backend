import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1740510154586 implements MigrationInterface {
    name = 'BackendMigration1740510154586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ad" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL, "link" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0193d5ef09746e88e9ea92c634d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0193d5ef09746e88e9ea92c634" ON "ad" ("id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0193d5ef09746e88e9ea92c634"`);
        await queryRunner.query(`DROP TABLE "ad"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741118682564 implements MigrationInterface {
    name = 'BackendMigration1741118682564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "evidence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL, "link" character varying NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "doctorId" uuid, CONSTRAINT "PK_b864cb5d49854f89917fc0b44b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b864cb5d49854f89917fc0b44b" ON "evidence" ("id") `);
        await queryRunner.query(`ALTER TABLE "evidence" ADD CONSTRAINT "FK_9a0f4db3858ac017933e5b7482b" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evidence" DROP CONSTRAINT "FK_9a0f4db3858ac017933e5b7482b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b864cb5d49854f89917fc0b44b"`);
        await queryRunner.query(`DROP TABLE "evidence"`);
    }

}

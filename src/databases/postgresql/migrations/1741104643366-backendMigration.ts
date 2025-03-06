import { MigrationInterface, QueryRunner } from "typeorm";

export class BackendMigration1741104643366 implements MigrationInterface {
    name = 'BackendMigration1741104643366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."surgery_subcategory_enum" AS ENUM('EyelidSurgery', 'Facelift', 'BreastAugmentation', 'BreastReduction', 'BreastLift', 'Liposuction', 'TummyTuck', 'ButtockLift')`);
        await queryRunner.query(`ALTER TABLE "surgery" ADD "subcategory" "public"."surgery_subcategory_enum" DEFAULT 'Liposuction'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "surgery" DROP COLUMN "subcategory"`);
        await queryRunner.query(`DROP TYPE "public"."surgery_subcategory_enum"`);
    }

}

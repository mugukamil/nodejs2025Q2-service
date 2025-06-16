import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserPassword1750112150247 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure password field can store hashed passwords (bcrypt produces 60-character strings)
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "password" TYPE VARCHAR(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to original password field length if needed
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "password" TYPE VARCHAR
        `);
    }
}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotesTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false
          }
        ]
      }),
      true
    );

    // extensões úteis no Postgres (se não existirem)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notes');
  }
}

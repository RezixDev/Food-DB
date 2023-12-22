// database.ts (Example for PostgreSQL)
import { Pool } from 'pg';

const pool = new Pool({
  user: 'piotr',
  host: 'localhost',
  database: 'mydatabase',
  password: 'Postgres',
  port: 5434,
});

export default pool;

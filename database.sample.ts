// database.ts (Example for PostgreSQL)
import { Pool } from 'pg';

const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: 5432,
});

export default pool;

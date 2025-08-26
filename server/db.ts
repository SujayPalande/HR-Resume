// PostgreSQL connection setup
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER || 'hr_user',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'hr_resume_scan',
  password: process.env.PGPASSWORD || 'yourpassword',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

export default pool;

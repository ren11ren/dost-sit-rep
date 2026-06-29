const { Pool } = require('pg');

const pool = new Pool({
  // Point to the local docker postgres service name
  host: process.env.DB_HOST || 'postgres',

  user: process.env.DB_USER || 'dostuser',
  password: process.env.DB_PASSWORD || 'dostpass',
  database: process.env.DB_NAME || 'dostdb',
  port: process.env.DB_PORT || 5432,
});
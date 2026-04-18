
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log('Connected:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();

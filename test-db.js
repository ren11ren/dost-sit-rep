const { Pool } = require('pg');

// Your encoded password: raiNier1106%40rainier
const pool = new Pool({
    connectionString: 'postgresql://postgres:raiNier1106%40rainier@db.vvdbdsabtbtptrqsmybg.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    },
    family: 4 // Force IPv4
});

console.log('🔌 Attempting to connect to Supabase...');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('');
        console.log('⚠️ Troubleshooting tips:');
        console.log('1. Check your internet connection');
        console.log('2. Make sure your Supabase project is active');
        console.log('3. Try the connection string from Supabase dashboard');
        console.log('4. Your password should be: raiNier1106@rainier');
        console.log('   URL encoded: raiNier1106%40rainier');
    } else {
        console.log('✅ Connected to Supabase successfully!');
        console.log('📅 Server time:', res.rows[0].now);
    }
    pool.end();
});

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      if (match[1] === 'VITE_SUPABASE_URL') supabaseUrl = match[2].trim();
      if (match[1] === 'VITE_SUPABASE_ANON_KEY') supabaseKey = match[2].trim();
    }
  });
} catch (e) {
  console.warn('Could not load .env file:', e.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env file!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('🔄 Testing connection to Supabase:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('issues').select('*').limit(5);
    if (error) {
      console.error('❌ Query failed:', error.message);
      if (error.code === 'PGRST205') {
        console.error('💡 Hint: Database tables are not created yet. Please execute supabase_schema.sql in your Supabase SQL Editor!');
      }
    } else {
      console.log('✅ Connection & Schema Query SUCCESSFUL!');
      console.log(`📊 Found ${data.length} rows in "issues" table.`);
    }
  } catch (err) {
    console.error('❌ Exception occurred:', err.message);
  }
}

checkConnection();

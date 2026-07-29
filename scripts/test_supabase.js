import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npumvyhwwijdreyhefqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdW12eWh3d2lqZHJleWhlZnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODYyNjAsImV4cCI6MjEwMDM2MjI2MH0.pMu17I54_NR8aoL_RCdcsmbaeNfhfIzfAz_ZtsA9d2s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('🔄 Testing connection to Supabase:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('issues').select('*').limit(5);
    if (error) {
      console.error('❌ Connection failed with error:', error.message);
    } else {
      console.log('✅ Connection SUCCESSFUL!');
      console.log(`📊 Found ${data.length} rows in "issues" table.`);
    }
  } catch (err) {
    console.error('❌ Exception occurred:', err.message);
  }
}

checkConnection();

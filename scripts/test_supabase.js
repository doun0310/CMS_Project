import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otukklnhcdlbqhrknqyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dWtrbG5oY2RsYnFocmtucXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTI5MTMsImV4cCI6MjEwMDM2ODkxM30.44CPG-Lsme4y17cqF-oorDFAgDrZw2uPLVnhGg2V6F4';

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

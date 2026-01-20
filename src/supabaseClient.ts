// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyxoqilietltbpwcswhk.supabase.co'; //supabase DataAPI URL
// supabase Legacy Anon public key 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eG9xaWxpZXRsdGJwd2Nzd2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDE5NTgsImV4cCI6MjA4NDExNzk1OH0.GAUs81AvLgZ8FBeoWjAMmCZerrvz2dNHUPAgzqxBxms';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export{} line core ensuring TS treats this file as a module
export {};

// Update Existing code in Github

// Open project folder - cd "C:\Users\Admin\Desktop\Junior Dev Assessment"
// Check changed files - git status
// Add the updated files - git add .
// Commit the changes - git commit -m "Fix register page and Supabase auth"
// Push to GitHub - git push origin main



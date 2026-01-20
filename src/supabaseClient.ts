// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyxoqilietltbpwcswhk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eG9xaWxpZXRsdGJwd2Nzd2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDE5NTgsImV4cCI6MjA4NDExNzk1OH0.GAUs81AvLgZ8FBeoWjAMmCZerrvz2dNHUPAgzqxBxms';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add this line to ensure TS treats this file as a module
export {};

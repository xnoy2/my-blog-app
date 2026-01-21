// src/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load URL and anon key from .env
const supabaseUrl: string = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey: string = process.env.REACT_APP_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey);

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to a Supabase Storage bucket
 * @param file - File object from input
 * @param bucket - Name of storage bucket (must match exactly in Supabase)
 * @returns public URL of uploaded file
 */
export const uploadFile = async (file: File, bucket: string): Promise<string> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;

    // Upload file
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicData.publicUrl;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};

/**
 * Get the current authenticated user
 * @returns user object or null
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};


//git init
//git add README.md
//git commit -m "first commit"
//git branch -M main
//git remote add origin https://github.com/xnoy2/my-blog-app.git
//git push -u origin main
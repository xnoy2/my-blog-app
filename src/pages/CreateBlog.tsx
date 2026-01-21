// src/pages/CreateBlog.tsx

// React hooks for state management
import React, { useState } from 'react';

// Supabase client, file upload helper, and user helper
import { supabase, uploadFile, getCurrentUser } from '../supabaseClient';

// Used to redirect user after creating a blog
import { useNavigate } from 'react-router-dom';

// CreateBlog page component
const CreateBlog: React.FC = () => {
  // Store blog title input
  const [title, setTitle] = useState('');

  // Store blog content input
  const [content, setContent] = useState('');

  // Store selected image file
  const [file, setFile] = useState<File | null>(null);

  // Store image preview URL
  const [preview, setPreview] = useState<string | null>(null);

  // Used to disable button while submitting
  const [loading, setLoading] = useState(false);

  // Navigation hook to redirect pages
  const navigate = useNavigate();

  // Handle file input change (image upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if a file is selected
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);

      // Create a local preview of the image
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle blog submission
  const handleSubmit = async () => {
    // Basic validation
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    setLoading(true);

    try {
      // Get currently logged-in user
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let imageUrl: string | null = null;

      // If user uploaded an image, upload it to Supabase Storage
      if (file) {
        // Upload image to "blog-images" bucket
        imageUrl = await uploadFile(file, 'blog-images');
      }

      // Insert new blog post into Supabase database
      const { error } = await supabase.from('blogs').insert([
        {
          title,           // blog title
          content,         // blog content
          author: user.id, // logged-in user's ID
          image_url: imageUrl, // uploaded image URL (optional)
        },
      ]);

      // Throw error if insert fails
      if (error) throw error;

      alert('Blog created successfully!');

      // Redirect user back to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      // Re-enable button after process
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Create Blog</h2>

      {/* Blog title input */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      {/* Blog content input */}
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      {/* Image upload input */}
      <input type="file" onChange={handleFileChange} style={{ marginBottom: '10px' }} />

      {/* Image preview */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ maxWidth: '100%', marginBottom: '10px', border: '1px solid #ccc' }}
        />
      )}

      {/* Submit button */}
      <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Posting...' : 'Post Blog'}
      </button>
    </div>
  );
};

// Export component so it can be used in routing
export default CreateBlog;

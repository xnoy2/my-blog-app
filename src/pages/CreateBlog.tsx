// src/pages/CreateBlog.tsx
import React, { useState, useRef } from 'react';
import { supabase, uploadFile, getCurrentUser } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ ref to clear file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ✅ Remove selected image (FIXED)
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);

    // ✅ THIS clears the filename
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle blog submission
  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let imageUrl: string | null = null;

      if (file) {
        imageUrl = await uploadFile(file, 'blog-images');
      }

      const { error } = await supabase.from('blogs').insert([
        {
          title,
          content,
          author: user.id,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      alert('Blog created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Create Blog</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <input
        type="file"
        ref={fileInputRef} // ✅ important
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />

      {preview && (
        <div style={{ marginBottom: '10px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '100%', border: '1px solid #ccc', marginBottom: '5px' }}
          />
          <br />
          <button
            onClick={handleRemoveImage}
            style={{
              padding: '4px 10px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Remove Image
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: '10px 20px' }}
      >
        {loading ? 'Posting...' : 'Post Blog'}
      </button>
    </div>
  );
};
export default CreateBlog;



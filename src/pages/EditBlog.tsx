// src/pages/EditBlog.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, uploadFile } from '../supabaseClient';

const EditBlog: React.FC = () => {
  // Get blog ID from URL params (/edit/:id)
  const { id } = useParams<{ id: string }>();

  // State for blog title
  const [title, setTitle] = useState('');

  // State for blog content
  const [content, setContent] = useState('');

  // State for newly selected image file
  const [file, setFile] = useState<File | null>(null);

  // State to store the current image URL from database
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Loading state for update process
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch the existing blog details from database
  const fetchBlog = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return alert(error.message);

    // Populate form fields with existing blog data
    setTitle(data.title);
    setContent(data.content);
    setCurrentImage(data.image_url || null);
  };

  // Run fetchBlog when component mounts or ID changes
  useEffect(() => {
    fetchBlog();
  }, [id]);

  // Handle blog update
  const handleUpdateBlog = async () => {
    // Basic validation
    if (!title || !content) return alert('Title and content are required');

    setLoading(true);

    try {
      // Keep existing image unless a new one is uploaded
      let imageUrl = currentImage;

      if (file) {
        // Upload new image if user selected a file
        imageUrl = await uploadFile(file, 'blog-images');
      }

      // Update blog record in Supabase
      const { error } = await supabase
        .from('blogs')
        .update({ title, content, image_url: imageUrl })
        .eq('id', id);

      if (error) throw error;

      alert('Blog updated successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <h2>Edit Blog</h2>

      {/* Title input */}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {/* Content textarea */}
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {/* Display current blog image */}
      {currentImage && (
        <div style={{ marginBottom: '10px' }}>
          <p>Current Image:</p>
          <img src={currentImage} alt="blog" style={{ maxWidth: '200px' }} />
        </div>
      )}

      {/* Select new image file */}
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      {/* Update button */}
      <button
        onClick={handleUpdateBlog}
        disabled={loading}
        style={{ marginTop: '10px', padding: '10px 20px' }}
      >
        {loading ? 'Updating...' : 'Update Blog'}
      </button>
    </div>
  );
};

export default EditBlog;

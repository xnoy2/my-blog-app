// src/pages/EditBlog.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, uploadFile } from '../supabaseClient';

const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Fetch blog
  const fetchBlog = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return alert(error.message);

    setTitle(data.title);
    setContent(data.content);
    setCurrentImage(data.image_url || null);
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  // 🗑 REMOVE IMAGE (Storage + DB)
  const handleRemoveImage = async () => {
    if (!currentImage || !id) return;

    const confirm = window.confirm('Remove current image?');
    if (!confirm) return;

    try {
      setLoading(true);

      // Extract file name from URL
      const fileName = currentImage.split('/').pop();
      if (!fileName) throw new Error('Invalid image path');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('blog-images')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Update DB
      const { error: dbError } = await supabase
        .from('blogs')
        .update({ image_url: null })
        .eq('id', id);

      if (dbError) throw dbError;

      setCurrentImage(null);
      alert('Image removed successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 💾 Update blog
  const handleUpdateBlog = async () => {
    if (!title || !content) {
      return alert('Title and content are required');
    }

    setLoading(true);

    try {
      let imageUrl = currentImage;

      // Upload new image if selected
      if (file) {
        imageUrl = await uploadFile(file, 'blog-images');
      }

      const { error } = await supabase
        .from('blogs')
        .update({
          title,
          content,
          image_url: imageUrl,
        })
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

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {/* 🖼 CURRENT IMAGE */}
      {currentImage && (
        <div style={{ marginBottom: '10px' }}>
          <p>Current Image:</p>
          <img
            src={currentImage}
            alt="blog"
            style={{ maxWidth: '200px', display: 'block', marginBottom: '5px' }}
          />
          <button
            onClick={handleRemoveImage}
            disabled={loading}
            style={{ backgroundColor: '#d9534f', color: '#fff', padding: '5px 10px' }}
          >
            Remove Image
          </button>
        </div>
      )}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

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

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

  // Fetch the existing blog details
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

  const handleUpdateBlog = async () => {
    if (!title || !content) return alert('Title and content are required');
    setLoading(true);

    try {
      let imageUrl = currentImage;

      if (file) {
        // Upload new image if a file is selected
        imageUrl = await uploadFile(file, 'blog-images');
      }

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
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {currentImage && (
        <div style={{ marginBottom: '10px' }}>
          <p>Current Image:</p>
          <img src={currentImage} alt="blog" style={{ maxWidth: '200px' }} />
        </div>
      )}

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

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

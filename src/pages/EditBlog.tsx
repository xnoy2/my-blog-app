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

  // Fetch blog
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

  // Remove image
  const handleRemoveImage = async () => {
    if (!currentImage || !id) return;
    if (!window.confirm('Remove current image?')) return;

    try {
      setLoading(true);
      const fileName = currentImage.split('/').pop();
      if (!fileName) throw new Error('Invalid image path');

      await supabase.storage.from('blog-images').remove([fileName]);
      await supabase.from('blogs').update({ image_url: null }).eq('id', id);

      setCurrentImage(null);
      alert('Image removed');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update blog
  const handleUpdateBlog = async () => {
    if (!title || !content) {
      return alert('Title and content are required');
    }

    setLoading(true);
    try {
      let imageUrl = currentImage;

      if (file) {
        imageUrl = await uploadFile(file, 'blog-images');
      }

      await supabase
        .from('blogs')
        .update({ title, content, image_url: imageUrl })
        .eq('id', id);

      alert('Blog updated successfully');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card blog-editor" style={{ position: 'relative' }}>
        {/* Top-right X button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          ✖
        </button>

        {/* Header */}
        <div className="editor-header">
          <h2>✏️ Edit Blog</h2>
          <p className="muted-text">Update your content and keep your post fresh</p>
        </div>

        {/* Title */}
        <label className="form-label">Blog Title</label>
        <input
          className="form-input"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Content */}
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea large-textarea"
          placeholder="Write your blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Image Section */}
        <div className="image-section">
          {currentImage && (
            <>
              <p className="form-label">Current Image</p>
              <img src={currentImage} alt="blog" className="image-preview" />
              <div className="blog-actions">
                <button className="delete-btn" onClick={handleRemoveImage} disabled={loading}>
                  🗑️Remove Image
                </button>
              </div>
            </>
          )}

          <label className="form-label">Upload New Image</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        {/* Update Button */}
        <div className="editor-actions">
          <button
            className="primary-btn"
            onClick={handleUpdateBlog}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Blog'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;

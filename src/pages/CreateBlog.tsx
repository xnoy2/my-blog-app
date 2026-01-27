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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      if (file) imageUrl = await uploadFile(file, 'blog-images');

      const { error } = await supabase.from('blogs').insert([
        { title, content, author: user.id, image_url: imageUrl },
      ]);

      if (error) throw error;

      alert('Blog created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
       <div className="card" style={{ position: 'relative' }}>
        {/* X button on top-right */}
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
        <h2 className="page-title">✍️ Create New Blog</h2>

        <label className="form-label">Title</label>
        <input
          type="text"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />

        <label className="form-label">Content</label>
        <textarea
          placeholder="Write your blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="form-textarea"
        />

        <label className="form-label">Image (optional)</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="form-input"
        />

        {preview && (
          <div className="image-preview-wrapper">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="btn-group">
              <button onClick={handleRemoveImage} className="remove-btn">
                Remove Image
              </button>
            </div>
          </div>
        )}

        <div className="btn-group">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Posting...' : 'Publish Blog'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;

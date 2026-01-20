import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditBlog() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  // Fetch blog data when component mounts
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) alert(error.message);
      else {
        setTitle(data.title);
        setContent(data.content);
      }
    };

    fetchBlog();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;

    const { error } = await supabase
      .from('blogs')
      .update({ title, content, updated_at: new Date() })
      .eq('id', id);

    if (error) alert(error.message);
    else {
      alert('Blog updated successfully!');
      navigate('/dashboard'); // redirect back to dashboard
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Edit Blog</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <textarea
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', height: '150px', padding: '8px' }}
        />
      </div>
      <button onClick={handleUpdate} style={{ padding: '10px 20px' }}>
        Update Blog
      </button>
    </div>
  );
}

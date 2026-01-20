import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    // Get current logged-in user
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      alert('You must be logged in to create a blog.');
      return;
    }

    // Insert blog into Supabase
    const { error } = await supabase.from('blogs').insert([
      {
        title,
        content,
        author: user.data.user.id,
      },
    ]);

    if (error) alert(error.message);
    else {
      alert('Blog created successfully!');
      navigate('/dashboard'); // redirect to dashboard
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Create New Blog</h2>
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
      <button onClick={handleCreate} style={{ padding: '10px 20px' }}>
        Create Blog
      </button>
    </div>
  );
}

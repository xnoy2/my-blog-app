import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

type Blog = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 3; // blogs per page sitted to 3

  // Fetch blogs with pagination
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = page * limit - 1;

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a blog
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      alert('Blog deleted!');
      fetchBlogs(); // refresh after deletion
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h1>Dashboard</h1>

      {/* Navigation Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLogout} style={{ marginRight: '10px' }}>
          Logout
        </button>
        <button onClick={() => navigate('/create')}>Create New Blog</button>
      </div>

      {/* Blog Listing */}
      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        blogs.map((blog) => (
          <div
            key={blog.id}
            style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}
          >
            <h3>{blog.title}</h3>
            <p>{blog.content}</p>
            <small>Author ID: {blog.author}</small> <br />
            <small>Created: {new Date(blog.created_at).toLocaleString()}</small>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => navigate(`/edit/${blog.id}`)}
                style={{ marginRight: '10px' }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(blog.id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{ marginRight: '10px' }}
        >
          Previous
        </button>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Dashboard;

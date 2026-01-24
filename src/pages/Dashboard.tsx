// src/pages/Dashboard.tsx
import React, { useState, useEffect} from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BlogComments from '../components/BlogComments';


// Blog type definition
type Blog = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  image_url?: string;
  isAuthor?: boolean;
};

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // ✅ added

  const limit = 3;
  const navigate = useNavigate();

  // Fetch current logged-in user ID and email
 useEffect(() => {
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
      setUserEmail(data.user.email ?? ''); // ✅ FIX HERE
    }
  };
  fetchUser();
}, []);

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = page * limit - 1;

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const blogsWithAuthorCheck = (data || []).map((blog) => ({
        ...blog,
        isAuthor: blog.author === userId,
      }));

      setBlogs(blogsWithAuthorCheck);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }

    setBlogs((prev) => prev.filter((blog) => blog.id !== id));
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (userId) fetchBlogs();
  }, [page, userId]);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h1>Dashboard</h1>

      {/* ✅ Welcome message */}
      {userEmail && (
        <p>
          Welcome, <strong>{userEmail}</strong>
        </p>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLogout} style={{ marginRight: '10px' }}>
          Logout
        </button>
        <button onClick={() => navigate('/create')}>Create New Blog</button>
      </div>

      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        blogs.map((blog) => (
          <div
            key={blog.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '8px',
            }}
          >
            <h3>{blog.title}</h3>

            {blog.image_url && (
              <img
                src={blog.image_url}
                alt="blog"
                style={{ maxWidth: '100%', marginBottom: '10px' }}
              />
            )}

            <p>{blog.content}</p>
            <small>Created: {new Date(blog.created_at).toLocaleString()}</small>

            {/* Show buttons only if author */}
            {blog.isAuthor && (
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => navigate(`/edit/${blog.id}`)}
                  style={{ marginRight: '10px' }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(blog.id)}>Delete</button>
              </div>
            )}

            <div style={{ marginTop: '15px' }}>
              <BlogComments blogId={blog.id} />
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Dashboard;

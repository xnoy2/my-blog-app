import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BlogComments from '../components/BlogComments';

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const limit = 3;
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? '');
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

      setBlogs(
        (data || []).map((blog) => ({
          ...blog,
          isAuthor: blog.author === userId,
        }))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchBlogs();
  }, [page, userId]);

  // Delete blog
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="page-title">Dashboard</h1>

        {userEmail && (
          <p className="welcome-text">
            Welcome, <strong>🧑‍🦰{userEmail}</strong>
          </p>
        )}

        <div className="dashboard-header">
          <button className="secondary-btn" onClick={handleLogout}>
            🏃🚪 Logout
          </button>
          <button
            className="secondary-btn"
            onClick={() => navigate('/create')}
          >
           ✍🏼 Create New Blog
          </button>
        </div>

        {loading && <p>Loading blogs...</p>}
        {!loading && blogs.length === 0 && (
          <p className="empty-text">No blogs found.</p>
        )}

        {blogs.map((blog) => (
          <div className="blog-card" key={blog.id}>
            <div className="blog-title">{blog.title}</div>

            <small className="muted-text">
              {new Date(blog.created_at).toLocaleString()}
            </small>

            {blog.image_url && (
              <img
                src={blog.image_url}
                alt="blog"
                className="blog-image"
              />
            )}

            <div className="blog-content">{blog.content}</div>

            {blog.isAuthor && (
              <div className="blog-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit/${blog.id}`)}
                >
                  Edit 
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(blog.id)}
                >
                   Delete
                </button>
              </div>
            )}

            <div style={{ marginTop: '15px' }}>
              <BlogComments blogId={blog.id} />
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="pagination">
          <button
            className="secondary-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="secondary-btn"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

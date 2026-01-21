// src/pages/Dashboard.tsx
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
  authorEmail?: string; // added
};

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [userEmail, setUserEmail] = useState(''); // current logged-in user
  const limit = 3;
  const navigate = useNavigate();

  // Fetch current logged-in user email
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email || '');
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

      // Map blogs to include authorEmail (currently using userEmail if blog author = current user)
      const blogsWithEmail = (data || []).map((blog) => ({
        ...blog,
        authorEmail: blog.author === data[0]?.author ? userEmail : 'Unknown',
      }));

      setBlogs(blogsWithEmail);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, blogAuthorId: string) => {
  try {
    // Get current logged-in user
    const { data: currentUser } = await supabase.auth.getUser();
    const currentUserId = currentUser?.user?.id;

    // Check if current user is the author
    if (currentUserId !== blogAuthorId) {
      alert("You can't delete this blog. You are not the author.");
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    // Delete blog
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;

    // Update state
    setBlogs((prev) => prev.filter((blog) => blog.id !== id));
    alert('Blog deleted!');
  } catch (err: any) {
    alert(err.message);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userEmail]);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h1>Dashboard</h1>

      <p>
        Welcome, <strong>{userEmail}</strong>!
      </p>

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
                style={{ maxWidth: '100%', marginBottom: '10px', borderRadius: '4px' }}
              />
            )}
            <p>{blog.content}</p>
             <br />
            <small>Author ID: {blog.author}</small> <br />
            <small>Created: {new Date(blog.created_at).toLocaleString()}</small>

            <div style={{ marginTop: '10px' }}>
              <button onClick={() => navigate(`/edit/${blog.id}`)} style={{ marginRight: '10px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(blog.id, blog.author)}>Delete</button>
            </div>

            <div style={{ marginTop: '15px' }}>
              <BlogComments blogId={blog.id} />
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{ marginRight: '10px' }}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} style={{ marginLeft: '10px' }}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

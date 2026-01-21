// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BlogComments from '../components/BlogComments';

// Type definition for a Blog object
type Blog = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  image_url?: string;
  authorEmail?: string; // optional field for displaying author email
};

const Dashboard: React.FC = () => {
  // State to store blog list
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // State to handle loading status
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  // Logged-in user's email
  const [userEmail, setUserEmail] = useState('');

  const limit = 3; // number of blogs per page
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

  // Fetch blogs from Supabase
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

      // Attach authorEmail (basic placeholder logic)
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

  // Handle blog deletion
  const handleDelete = async (id: string, blogAuthorId: string) => {
    try {
      // Get currently logged-in user
      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserId = currentUser?.user?.id;

      // Prevent deletion if user is not the author
      if (currentUserId !== blogAuthorId) {
        alert("You can't delete this blog. You are not the author.");
        return;
      }

      // Confirm delete action
      if (!window.confirm('Are you sure you want to delete this blog?')) return;

      // Delete blog from database
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;

      // Remove deleted blog from UI
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      alert('Blog deleted!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Logout user and redirect to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Fetch blogs when page or userEmail changes
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userEmail]);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h1>Dashboard</h1>

      {/* Display logged-in user email */}
      <p>
        Welcome, <strong>{userEmail}</strong>!
      </p>

      {/* Action buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLogout} style={{ marginRight: '10px' }}>
          Logout
        </button>
        <button onClick={() => navigate('/create')}>Create New Blog</button>
      </div>

      {/* Blog list section */}
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

            {/* Show blog image if available */}
            {blog.image_url && (
              <img
                src={blog.image_url}
                alt="blog"
                style={{ maxWidth: '100%', marginBottom: '10px', borderRadius: '4px' }}
              />
            )}

            <p>{blog.content}</p>
            <br />

            {/* Blog metadata */}
            <small>Author ID: {blog.author}</small> <br />
            <small>Created: {new Date(blog.created_at).toLocaleString()}</small>

            {/* Edit and Delete actions */}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => navigate(`/edit/${blog.id}`)} style={{ marginRight: '10px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(blog.id, blog.author)}>Delete</button>
            </div>

            {/* Comments section */}
            <div style={{ marginTop: '15px' }}>
              <BlogComments blogId={blog.id} />
            </div>
          </div>
        ))
      )}

      {/* Pagination controls */}
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

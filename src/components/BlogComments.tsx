// src/components/BlogComments.tsx

// Import React hooks for state and lifecycle handling
import React, { useState, useEffect } from 'react';

// Import Supabase client and helper functions
import { supabase, uploadFile, getCurrentUser } from '../supabaseClient';

// Props interface: we need the blog ID to know which comments to load
interface BlogCommentsProps {
  blogId: string;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ blogId }) => {
  // Store all comments for this blog
  const [comments, setComments] = useState<any[]>([]);

  // Store text input for new comment
  const [commentText, setCommentText] = useState('');

  // Store selected image file (optional)
  const [file, setFile] = useState<File | null>(null);

  // Store image preview URL before uploading
  const [preview, setPreview] = useState<string | null>(null);

  // Fetch all comments related to this blog from Supabase
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId) // only comments for this blog
      .order('created_at', { ascending: true }); // oldest first

    if (error) {
      console.error(error);
    } else {
      setComments(data || []);
    }
  };

  // Run fetchComments when the component loads or when blogId changes
  useEffect(() => {
    fetchComments();
  }, [blogId]);

  // Handle file selection and generate preview image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // save file
      setPreview(URL.createObjectURL(e.target.files[0])); // show preview
    }
  };

  // Handle posting a new comment
  const handlePostComment = async () => {
    // Prevent empty comments
    if (!commentText) return alert('Comment cannot be empty.');

    try {
      // Get currently logged-in user
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let imageUrl: string | null = null;

      // Upload image if user selected one
      if (file) {
        imageUrl = await uploadFile(file, 'blog-images');
      }

      // Insert comment into Supabase database
      const { error } = await supabase.from('comments').insert([
        {
          blog_id: blogId,
          author: user.id,        // link comment to author
          content: commentText,   // comment text
          image_url: imageUrl,    // optional image
        },
      ]);

      if (error) throw error;

      // Reset form after successful post
      setCommentText('');
      setFile(null);
      setPreview(null);

      // Reload comments so the new one appears immediately
      fetchComments();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
      <h4>Comments</h4>

      {/* Display comments list */}
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ marginBottom: '10px' }}>
            <p>{c.content}</p>

            {/* Show image if comment has one */}
            {c.image_url && (
              <img
                src={c.image_url}
                alt="Comment"
                style={{ maxWidth: '50px' }}
              />
            )}
            <br />
            <small>By: {c.author}</small>
            <p>_____________________________________________________________</p>
          </div>
        ))
      )}

      {/* Comment input form */}
      <textarea
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      {/* Image upload input */}
      <input type="file" onChange={handleFileChange} style={{ marginBottom: '10px' }} />

      {/* Image preview before upload */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ maxWidth: '200px', marginBottom: '10px', border: '1px solid #ccc' }}
        />
      )}

      {/* Submit comment */}
      <button onClick={handlePostComment} style={{ padding: '6px 12px' }}>
        Post Comment
      </button>
    </div>
  );
};
// To use to the other file
export default BlogComments;

// src/components/BlogComments.tsx
import React, { useState, useEffect } from 'react';
import { supabase, uploadFile, getCurrentUser } from '../supabaseClient';

interface BlogCommentsProps {
  blogId: string;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ blogId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Load comments for this blog
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setComments(data || []);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePostComment = async () => {
    if (!commentText) return alert('Comment cannot be empty.');

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let imageUrl: string | null = null;
      if (file) {
        // Upload comment image to the same bucket
        imageUrl = await uploadFile(file, 'blog-images');
      }

      const { error } = await supabase.from('comments').insert([
        {
          blog_id: blogId,
          author: user.id,
          content: commentText,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      // Reset form
      setCommentText('');
      setFile(null);
      setPreview(null);

      // Reload comments
      fetchComments();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
      <h4>Comments</h4>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ marginBottom: '10px' }}>
            <p>{c.content}</p>
            {c.image_url && <img src={c.image_url} alt="Comment" style={{ maxWidth: '50px' }} />}
            <small>By: {c.author}</small>
            <p>_____________________________________________________________</p>
          </div>
        ))
      )}

      {/* Comment form */}
      <textarea
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <input type="file" onChange={handleFileChange} style={{ marginBottom: '10px' }} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ maxWidth: '200px', marginBottom: '10px', border: '1px solid #ccc' }}
        />
      )}
      <button onClick={handlePostComment} style={{ padding: '6px 12px' }}>
        Post Comment
      </button>
    </div>
  );
};

export default BlogComments;

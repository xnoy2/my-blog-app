// src/components/BlogComments.tsx
import React, { useEffect, useState } from 'react';
import { supabase, uploadFile } from '../supabaseClient';

interface BlogCommentsProps {
  blogId: string;
}

type Comment = {
  id: string;
  blog_id: string;
  author: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

const BlogComments: React.FC<BlogCommentsProps> = ({ blogId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // New comment
  const [commentText, setCommentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Edit comment
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  /* =========================
     GET CURRENT USER
  ========================== */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  /* =========================
     FETCH COMMENT
  ========================== */
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true });

    if (!error) setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  /* =========================
     CREATE COMMENT
  ========================== */
  const handlePostComment = async () => {
    if (!commentText || !userId) return alert('Comment required');

    let imageUrl: string | null = null;
    if (file) imageUrl = await uploadFile(file, 'blog-images');

    const { error } = await supabase.from('comments').insert({
      blog_id: blogId,
      author: userId,
      content: commentText,
      image_url: imageUrl,
    });

    if (error) return alert(error.message);

    setCommentText('');
    setFile(null);
    setPreview(null);
    fetchComments();
  };

  /* =========================
     START EDIT
  ========================== */
  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.content);
    setEditFile(null);
    setRemoveImage(false);
  };

  /* =========================
     UPDATE COMMENT
  ========================== */
  const handleUpdate = async (comment: Comment) => {
    let imageUrl = comment.image_url;

    // Remove image checkbox
    if (removeImage) imageUrl = null;

    // Upload new image
    if (editFile) {
      imageUrl = await uploadFile(editFile, 'blog-images');
    }

    const { error } = await supabase
      .from('comments')
      .update({
        content: editText,
        image_url: imageUrl,
      })
      .eq('id', comment.id);

    if (error) return alert(error.message);

    setEditingId(null);
    setEditText('');
    setEditFile(null);
    setRemoveImage(false);
    fetchComments();
  };

  /* =========================
     DELETE COMMENT
  ========================== */
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;

    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) return alert(error.message);

    fetchComments();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Comments</h4>

      {comments.map((c) => (
        <div key={c.id} style={{ borderBottom: '1px solid #ddd', marginBottom: 10 }}>
          {editingId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: '100%' }}
              />

              {c.image_url && (
                <>
                  <img src={c.image_url} alt="" style={{ maxWidth: 100 }} />
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => setRemoveImage(e.target.checked)}
                    />{' '}
                    Remove image
                  </label>
                </>
              )}

              <input type="file" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />

              <br />
              <button onClick={() => handleUpdate(c)}>Update</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{c.content}</p>

              {c.image_url && <img src={c.image_url} alt="" style={{ maxWidth: 80 }} />}

              <br />
              <small>Author: {c.author}</small>

              {c.author === userId && (
                <>
                  <br />
                  <button onClick={() => startEdit(c)}>Edit</button>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </>
              )}
            </>
          )}
        </div>
      ))}

      <textarea
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ width: '100%' }}
      />

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      {preview && <img src={preview} alt="preview" style={{ maxWidth: 100 }} />}

      <br />
      <button onClick={handlePostComment}>Post Comment</button>
    </div>
  );
};

export default BlogComments;

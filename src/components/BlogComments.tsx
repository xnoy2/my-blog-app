// src/components/BlogComments.tsx
import React, { useEffect, useState, useRef } from 'react';
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

  const fileInputRef = useRef<HTMLInputElement | null>(null); // ✅ ref for input reset

  // Edit comment
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

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

  // ✅ POST COMMENT
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

    // Reset comment input and image
    setCommentText('');
    setFile(null);
    setPreview(null);

    // ✅ Reset actual file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    fetchComments();
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.content);
    setEditFile(null);
    setRemoveImage(false);
  };

  const handleUpdate = async (comment: Comment) => {
    let imageUrl = comment.image_url;
    if (removeImage) imageUrl = null;
    if (editFile) imageUrl = await uploadFile(editFile, 'blog-images');

    const { error } = await supabase
      .from('comments')
      .update({ content: editText, image_url: imageUrl })
      .eq('id', comment.id);

    if (error) return alert(error.message);

    setEditingId(null);
    setEditText('');
    setEditFile(null);
    setRemoveImage(false);
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;

    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) return alert(error.message);

    fetchComments();
  };

  return (
    <div className="blog-comments">
      <h4 className="page-title">Comments</h4>

      {comments.map((c) => (
        <div key={c.id} className="comment-box">
          {editingId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="form-textarea"
              />

              {c.image_url && (
                <div>
                  <img src={c.image_url} alt="" className="image-preview1" />
                  <label className="form-label">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => setRemoveImage(e.target.checked)}
                    />{' '}
                    Remove image
                  </label>
                </div>
              )}

              <input
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                className="form-input"
              />

              <div className="comment-actions">
                <button className="edit-btn1" onClick={() => handleUpdate(c)}>
                  Update
                </button>
                <button className="secondary-btn1" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{c.content}</p>
              {c.image_url && <img src={c.image_url} alt="" className="image-preview1" />}
              <br />
              <small className="muted-text">Author: {c.author}</small>
              {c.author === userId && (
                <div className="comment-actions">
                  <button className="secondary-btn1" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button className="secondary-btn1" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <textarea
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="form-textarea"
      />
      <input
        type="file"
        ref={fileInputRef} // ✅ attach ref to reset
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null);
        }}
        className="form-input"
      />
      {preview && <img src={preview} alt="preview" className="image-preview1" />}
      <button className="form-button1" onClick={handlePostComment}>
        Post Comment
      </button>
    </div>
  );
};

export default BlogComments;

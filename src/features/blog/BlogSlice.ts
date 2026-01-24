//It controls how blog data is stored, updated, and accessed across the entire app.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Type for a single blog post
type Blog = {
  id: string;       // Unique blog ID
  title: string;    // Blog title
  content: string;  // Blog content/Description
  author: string;   // Author ID or email
  created_at: string; // Creation timestamp
};

// State type for the blog slice (stores all blogs)
type BlogState = {
  blogs: Blog[];
};

// Initial state with an empty blog list
const initialState: BlogState = {
  blogs: [],
};

// Create the Redux slice
const blogSlice = createSlice({
  name: 'blog',       // Slice name
  initialState,       // Initial state
  reducers: {
    // Set the blogs in state
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
    },
  },
});

// Export actions to use in components
export const { setBlogs } = blogSlice.actions;

// Export reducer to include in the store
export default blogSlice.reducer;

// Ensures TypeScript treats this file as a module

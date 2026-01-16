import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Type for the blog state
type Blog = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

type BlogState = {
  blogs: Blog[];
};

// Initial state
const initialState: BlogState = {
  blogs: [],
};

// Create the slice
const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
    },
  },
});

// Export actions and reducer
export const { setBlogs } = blogSlice.actions;
export default blogSlice.reducer;

// ✅ Ensure TypeScript treats this as a module
// (this is optional here because we already exported above)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Redux Provider makes the store available to the whole app
import { Provider } from 'react-redux';

// configureStore is used to create a Redux store easily
import { configureStore } from '@reduxjs/toolkit';

// Blog reducer that handles blog-related state
import blogReducer from './features/blog/BlogSlice'; // correct path

// Create the Redux store
const store = configureStore({
  reducer: {
    // "blog" is the state key, blogReducer handles its logic
    blog: blogReducer,
  },
});

// Type for accessing the entire Redux state (used in useSelector)
export type RootState = ReturnType<typeof store.getState>;

// Type for dispatching Redux actions (used in useDispatch)
export type AppDispatch = typeof store.dispatch;

// Get the root HTML element and create a React root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the app
root.render(
  // Provider wraps the app so Redux state is accessible everywhere
  <Provider store={store}>
    <App />
  </Provider>
);

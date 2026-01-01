import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import PostEditor from './pages/admin/PostEditor';
import PostList from './pages/admin/PostList';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/posts" element={<Layout><Posts /></Layout>} />
        <Route path="/posts/:id" element={<Layout><PostDetail /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/posts" element={<AdminLayout><PostList /></AdminLayout>} />
        <Route path="/admin/post/new" element={<AdminLayout><PostEditor /></AdminLayout>} />
        <Route path="/admin/post/edit/:id" element={<AdminLayout><PostEditor /></AdminLayout>} />
        <Route path="/admin/media" element={<AdminLayout><div className="text-white p-8 bg-brand-surface rounded-2xl border border-slate-800">Media Library Placeholder</div></AdminLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
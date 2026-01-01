export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML
  imageUrl: string;
  category: string;
  tags: string[];
  downloadUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  createdAt: string;
  views: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  buttonText?: string;
  buttonLink?: string;
  createdAt: string;
  active: boolean;
}

export interface Stats {
  totalPosts: number;
  totalViews: number;
  storageUsedMB: number;
}

export interface User {
  id: string;
  email: string;
}
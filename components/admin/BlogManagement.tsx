"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  contentEn: string;
  contentBn: string;
  authorEn: string;
  authorBn: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  isActive: boolean;
  readTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagementNew() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load blog data from API
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const response = await fetch('/api/admin/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogPosts(data.posts || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load blog posts' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading blog posts' });
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const handleEditPost = (postId: string) => {
    router.push(`/en/admin/settings/blog/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await fetch(`/api/admin/blog?id=${postId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Blog post deleted successfully!' });
          setBlogPosts(blogPosts.filter(post => post.id !== postId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete blog post' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleFeatured = async (postId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: postId,
          featured: !post.featured,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog post featured status updated!' });
        setBlogPosts(blogPosts.map(p => 
          p.id === postId ? { ...p, featured: !p.featured } : p
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update featured status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleToggleActive = async (postId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: postId,
          isActive: !post.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog post status updated!' });
        setBlogPosts(blogPosts.map(p => 
          p.id === postId ? { ...p, isActive: !p.isActive } : p
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.titleBn.includes(searchTerm) ||
      post.excerptEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerptBn.includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {blogPosts.filter(p => p.isActive).length} active
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {blogPosts.filter(p => p.featured).length} featured
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/settings/blog/new')}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Post</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search blog posts..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="electoral">Electoral Process</option>
          <option value="technology">Technology</option>
          <option value="rights">Citizen Rights</option>
          <option value="transparency">Transparency</option>
          <option value="security">Security</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'success' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Blog Posts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {post.titleEn}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {post.excerptEn.substring(0, 60)}...
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {post.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {post.authorEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(post.isActive)}`}>
                      {post.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-slate-400 dark:text-slate-500">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {post.readTime} min read
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Post"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(post.id)}
                        className={`${post.featured ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'}`}
                        title={post.featured ? 'Remove from Featured' : 'Add to Featured'}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(post.id)}
                        className={`${post.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                        title={post.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Post"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No blog posts</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No posts match your search criteria.' 
                : 'Get started by creating a new blog post.'}
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/en/admin/settings/blog/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Blog Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

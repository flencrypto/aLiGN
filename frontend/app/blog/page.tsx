'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { intelApi, Blog } from '@/lib/api';

const BLOG_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  pending_approval: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  published: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function blogStatusColor(status: string) {
  return BLOG_STATUS_COLORS[status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    intelApi.listBlogs().then(setBlogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: number) {
    setApproving(id);
    try {
      const updated = await intelApi.approveBlog(id);
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } finally {
      setApproving(null);
    }
  }

  return (
    <>
      <Header title="Blog Engine" />
      <div className="p-6 space-y-6">
        <p className="text-slate-400 text-sm">AI-generated institutional content · Human approval required</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-slate-400">No blog posts yet. Generate one from an Intelligence record.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => setExpanded(expanded === blog.id ? null : blog.id)}
                      className="text-white font-medium text-sm text-left truncate hover:text-blue-400 transition-colors"
                    >
                      {blog.title ?? 'Untitled Draft'}
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${blogStatusColor(blog.status)}`}
                    >
                      {blog.status.replace('_', ' ')}
                    </span>
                    {blog.created_at && (
                      <span className="text-slate-500 text-xs hidden md:block flex-shrink-0">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {blog.status === 'pending_approval' && (
                      <button
                        onClick={() => handleApprove(blog.id)}
                        disabled={approving === blog.id}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                      >
                        {approving === blog.id ? 'Approving…' : '✓ Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === blog.id ? null : blog.id)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      {expanded === blog.id ? '▲ Hide' : '▼ Preview'}
                    </button>
                  </div>
                </div>

                {expanded === blog.id && (
                  <div className="border-t border-slate-700 px-5 py-4 space-y-4">
                    {blog.seo_meta_description && (
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          SEO Description
                        </p>
                        <p className="text-slate-300 text-sm">{blog.seo_meta_description}</p>
                      </div>
                    )}
                    {blog.body_markdown && (
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          Body Preview
                        </p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-700/50 rounded p-3">
                          {blog.body_markdown.slice(0, 500)}
                          {blog.body_markdown.length > 500 ? '…' : ''}
                        </p>
                      </div>
                    )}
                    {blog.linkedin_variant && (
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          LinkedIn Variant
                        </p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap bg-blue-500/10 border border-blue-500/20 rounded p-3">
                          {blog.linkedin_variant}
                        </p>
                      </div>
                    )}
                    {blog.x_variant && (
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          X (Twitter) Variant
                        </p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap bg-slate-700/50 rounded p-3">
                          {blog.x_variant}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

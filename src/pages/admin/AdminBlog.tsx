import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { blogPosts as SEED_BLOG, type BlogPost } from '../../data/blog';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Types ───────────────────────────────────────────────────────────────────────
interface AdminBlogPost extends BlogPost {
  status: 'draft' | 'published';
  author: string;
  publishAt?: string;
}

const BLOG_KEY   = 'lodr_admin_blog';
const CATEGORIES = ['Tips', 'Guides', 'News', 'Hotel', 'Travel'];
const AUTHORS    = ['Kwame Asante', 'Amara Nkosi', 'Brice Tagne'];

// ── Persistence ────────────────────────────────────────────────────────────────
function loadPosts(): AdminBlogPost[] {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (raw) return JSON.parse(raw) as AdminBlogPost[];
  } catch { /* fall through */ }
  return SEED_BLOG.map((p) => ({ ...p, status: 'published' as const, author: 'Kwame Asante' }));
}
function savePosts(posts: AdminBlogPost[]) {
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

function isPublished(post: AdminBlogPost): boolean {
  const today = new Date().toISOString().split('T')[0];
  if (post.publishAt && post.publishAt <= today) return true;
  return post.status === 'published';
}

// ── Form schema ────────────────────────────────────────────────────────────────
const postSchema = z.object({
  title:      z.string().min(3, 'Title required'),
  category:   z.string().min(1, 'Category required'),
  author:     z.string().min(2, 'Author required'),
  coverImage: z.string().url('Valid image URL required'),
  excerpt:    z.string().min(10, 'Excerpt required'),
  content:    z.string().min(20, 'Content required'),
  publishAt:  z.string().optional(),
});
type PostFormValues = z.infer<typeof postSchema>;

const BLANK: PostFormValues = {
  title: '', category: 'Tips', author: AUTHORS[0],
  coverImage: '', excerpt: '', content: '', publishAt: '',
};

// ── Post Editor Dialog ─────────────────────────────────────────────────────────
function PostEditorDialog({
  open, post, onClose, onSaveDraft, onPublish,
}: {
  open: boolean;
  post: AdminBlogPost | null;
  onClose: () => void;
  onSaveDraft: (v: PostFormValues) => void;
  onPublish:   (v: PostFormValues) => void;
}) {
  const form = useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: BLANK });

  useEffect(() => {
    form.reset(post ? {
      title: post.title, category: post.category, author: post.author,
      coverImage: post.image, excerpt: post.excerpt, content: post.content,
      publishAt: post.publishAt ?? '',
    } : BLANK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post?.slug]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {post ? 'Edit Post' : 'New Post'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Post title…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="author" render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {AUTHORS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="coverImage" render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl><Input placeholder="https://images.unsplash.com/…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="excerpt" render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl><Textarea placeholder="Short description shown in the blog list…" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Content <span className="text-[#9ca3af] font-normal">(Markdown)</span></FormLabel>
                <FormControl><Textarea placeholder="Write your post content in Markdown…" rows={12} className="font-mono text-xs" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="publishAt" render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Schedule Publish Date{' '}
                  <span className="text-[#9ca3af] font-normal">(optional — leave blank to publish immediately)</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" min={today} {...field} value={field.value ?? ''} className="w-52" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2 flex-wrap">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="button" variant="outline" onClick={form.handleSubmit(onSaveDraft)}>
                Save as Draft
              </Button>
              <Button type="button"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
                onClick={form.handleSubmit(onPublish)}
              >
                Publish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminBlog() {
  const [posts,        setPosts]        = useState<AdminBlogPost[]>(loadPosts);
  const [editorOpen,   setEditorOpen]   = useState(false);
  const [editPost,     setEditPost]     = useState<AdminBlogPost | null>(null);
  const [deleteSlug,   setDeleteSlug]   = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => { savePosts(posts); }, [posts]);

  const publishedCount = posts.filter(isPublished).length;
  const draftCount     = posts.length - publishedCount;

  const filtered = statusFilter === 'all'
    ? posts
    : posts.filter((p) => (statusFilter === 'published') === isPublished(p));

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function upsertPost(values: PostFormValues, status: 'draft' | 'published') {
    const slug = editPost?.slug ?? slugify(values.title);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const next: AdminBlogPost = {
      slug, date,
      title:    values.title,
      category: values.category,
      excerpt:  values.excerpt,
      image:    values.coverImage,
      content:  values.content,
      status,
      author:   values.author,
      publishAt: values.publishAt || undefined,
    };
    setPosts((prev) =>
      editPost
        ? prev.map((p) => (p.slug === editPost.slug ? next : p))
        : [next, ...prev],
    );
    setEditorOpen(false);
  }

  function togglePublish(slug: string) {
    setPosts((prev) => prev.map((p) => {
      if (p.slug !== slug) return p;
      return { ...p, status: isPublished(p) ? 'draft' : 'published', publishAt: undefined };
    }));
  }

  const columns: ColumnDef<AdminBlogPost>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{row.original.title}</p>
          <p className="text-[10px] text-[#9ca3af] mt-0.5 truncate">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs px-2 py-0.5 bg-[#f3f4f6] dark:bg-[#2a2a2a] text-text-secondary dark:text-[#9ca3af] rounded-full">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => <span className="text-sm text-text-secondary dark:text-[#9ca3af]">{row.original.author}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const pub       = isPublished(row.original);
        const scheduled = !pub && !!row.original.publishAt;
        return (
          <Badge className={
            pub       ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0' :
            scheduled ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0' :
                        'bg-[#f3f4f6] text-text-secondary dark:bg-[#2a2a2a] dark:text-[#9ca3af] border-0'
          }>
            {pub ? 'Published' : scheduled ? 'Scheduled' : 'Draft'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-text-secondary dark:text-[#9ca3af]">
          {row.original.publishAt ? `Sched: ${row.original.publishAt}` : row.original.date}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const post = row.original;
        const pub  = isPublished(post);
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
              onClick={() => { setEditPost(post); setEditorOpen(true); }}
              aria-label={`Edit ${post.title}`}>
              <Pencil size={13} />
            </Button>
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              aria-label={`Preview ${post.title}`}>
              <ExternalLink size={13} />
            </Button>
            <Button variant="ghost" size="sm"
              className={`h-7 px-2 text-xs ${pub ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
              onClick={() => togglePublish(post.slug)}>
              {pub ? 'Unpublish' : 'Publish'}
            </Button>
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
              onClick={() => setDeleteSlug(post.slug)}
              aria-label={`Delete ${post.title}`}>
              <Trash2 size={13} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Blog</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {posts.length} posts · {publishedCount} published · {draftCount} draft
          </p>
        </div>
        <Button onClick={() => { setEditPost(null); setEditorOpen(true); }}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2">
          <Plus size={15} /> New Post
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'all',       label: `All (${posts.length})` },
          { key: 'published', label: `Published (${publishedCount})` },
          { key: 'draft',     label: `Drafts (${draftCount})` },
        ] as const).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-button text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
                : 'bg-[#f3f4f6] dark:bg-[#2a2a2a] text-text-secondary dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#333333]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="title"
        searchPlaceholder="Search posts…"
        pageSize={10}
      />

      <PostEditorDialog
        open={editorOpen}
        post={editPost}
        onClose={() => setEditorOpen(false)}
        onSaveDraft={(v) => upsertPost(v, 'draft')}
        onPublish={(v) => upsertPost(v, 'published')}
      />

      <Dialog open={!!deleteSlug} onOpenChange={(v) => !v && setDeleteSlug(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete Post?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This will permanently remove the post from the blog.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteSlug(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => { if (deleteSlug) { setPosts((prev) => prev.filter((p) => p.slug !== deleteSlug)); setDeleteSlug(null); } }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

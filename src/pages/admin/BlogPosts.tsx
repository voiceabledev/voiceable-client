import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { adminApi, type AdminBlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildPayload(form: {
  slug: string;
  title: string;
  description: string;
  body: string;
  author: string;
  tags: string;
  canonical: string;
  og_image: string;
  draft: boolean;
  published_at: string;
}) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: form.description.trim() || null,
    body: form.body,
    author: form.author.trim() || "Voiceable",
    tags: form.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    canonical: form.canonical.trim() || null,
    og_image: form.og_image.trim() || null,
    draft: form.draft,
    published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
  };
}

export default function AdminBlogPosts() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    body: "",
    author: "Voiceable",
    tags: "",
    canonical: "",
    og_image: "",
    draft: true,
    published_at: "",
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.blogPosts.list();
      if (response.data) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = () => {
    setEditing(null);
    setFormData({
      slug: "",
      title: "",
      description: "",
      body: "",
      author: "Voiceable",
      tags: "",
      canonical: "",
      og_image: "",
      draft: true,
      published_at: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (post: AdminBlogPost) => {
    setEditing(post);
    setFormData({
      slug: post.slug,
      title: post.title,
      description: post.description ?? "",
      body: post.body,
      author: post.author,
      tags: (post.tags || []).join(", "),
      canonical: post.canonical ?? "",
      og_image: post.og_image ?? "",
      draft: post.draft,
      published_at: toDatetimeLocal(post.published_at),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.slug.trim() || !formData.title.trim()) {
      toast({
        title: "Validation",
        description: "Slug and title are required.",
        variant: "destructive",
      });
      return;
    }

    const payload = buildPayload(formData);
    setSaving(true);
    try {
      if (editing) {
        await adminApi.blogPosts.update(editing.id, payload);
        toast({ title: "Saved", description: "Blog post updated." });
      } else {
        await adminApi.blogPosts.create(payload);
        toast({ title: "Created", description: "Blog post created." });
      }
      setDialogOpen(false);
      await fetchPosts();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Save failed.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: AdminBlogPost) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try {
      await adminApi.blogPosts.destroy(post.id);
      toast({ title: "Deleted", description: "Blog post removed." });
      await fetchPosts();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Delete failed.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage marketing blog content (Markdown body, drafts, publish date).
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-mono text-sm">{post.slug}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    {post.draft ? (
                      <span className="text-amber-600 dark:text-amber-400">Draft</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">Published</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(post)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {posts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No posts yet.</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!!editing}
                placeholder="my-post-url"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body (Markdown)</Label>
              <Textarea
                id="body"
                rows={12}
                className="font-mono text-sm"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="product, voice-ai"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="canonical">Canonical URL (optional)</Label>
              <Input
                id="canonical"
                value={formData.canonical}
                onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="og_image">OG image URL (optional)</Label>
              <Input
                id="og_image"
                value={formData.og_image}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="draft"
                checked={formData.draft}
                onCheckedChange={(checked) => setFormData({ ...formData, draft: checked })}
              />
              <Label htmlFor="draft">Draft</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="published_at">Published at (optional)</Label>
              <Input
                id="published_at"
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { team as SEED_TEAM, type TeamMember } from '../../data/team';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// ── Types ───────────────────────────────────────────────────────────────────────
interface AdminTeamMember extends TeamMember {
  visible:    boolean;
  order:      number;
  instagram?: string;
  linkedin?:  string;
  website?:   string;
}

const TEAM_KEY = 'lodr_admin_team';

// ── Persistence ────────────────────────────────────────────────────────────────
function loadMembers(): AdminTeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (raw) return JSON.parse(raw) as AdminTeamMember[];
  } catch { /* fall through */ }
  return SEED_TEAM.map((m, i) => ({ ...m, visible: true, order: i }));
}
function saveMembers(members: AdminTeamMember[]) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(members));
}

// ── Form schema ────────────────────────────────────────────────────────────────
const teamSchema = z.object({
  name:      z.string().min(2, 'Name required'),
  role:      z.string().min(2, 'Role required'),
  bio:       z.string().min(10, 'Bio required'),
  image:     z.string().url('Valid image URL required'),
  instagram: z.string().optional(),
  linkedin:  z.string().optional(),
  website:   z.string().optional(),
  visible:   z.boolean(),
});
type TeamFormValues = z.infer<typeof teamSchema>;

const BLANK: TeamFormValues = {
  name: '', role: '', bio: '', image: '',
  instagram: '', linkedin: '', website: '', visible: true,
};

// ── Add/Edit Dialog ────────────────────────────────────────────────────────────
function TeamDialog({
  open, member, onClose, onSave,
}: {
  open: boolean;
  member: AdminTeamMember | null;
  onClose: () => void;
  onSave: (values: TeamFormValues) => void;
}) {
  const form = useForm<TeamFormValues>({ resolver: zodResolver(teamSchema), defaultValues: BLANK });

  useEffect(() => {
    form.reset(member ? {
      name:      member.name,
      role:      member.role,
      bio:       member.bio,
      image:     member.image,
      instagram: member.instagram ?? '',
      linkedin:  member.linkedin  ?? '',
      website:   member.website   ?? '',
      visible:   member.visible,
    } : BLANK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role / Title</FormLabel>
                  <FormControl><Input placeholder="e.g. General Manager" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Textarea placeholder="A short bio shown on the Team page…" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem>
                <FormLabel>Photo URL</FormLabel>
                <FormControl><Input placeholder="https://images.unsplash.com/…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="instagram" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram <span className="text-[#9ca3af] font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="@handle" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="linkedin" render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn <span className="text-[#9ca3af] font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="linkedin.com/in/handle" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>Website <span className="text-[#9ca3af] font-normal">(optional)</span></FormLabel>
                <FormControl><Input placeholder="https://example.com" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="visible" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  Visible on Team page
                </FormLabel>
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                {member ? 'Save Changes' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminTeam() {
  const [members,    setMembers]    = useState<AdminTeamMember[]>(loadMembers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<AdminTeamMember | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  useEffect(() => { saveMembers(members); }, [members]);

  const sorted = [...members].sort((a, b) => a.order - b.order);
  const visibleCount = members.filter((m) => m.visible).length;

  function toggleVisible(id: string) {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, visible: !m.visible } : m));
  }

  function moveUp(id: string) {
    setMembers((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((m) => m.id === id);
      if (idx <= 0) return prev;
      const updated = arr.map((m) => ({ ...m }));
      [updated[idx].order, updated[idx - 1].order] = [updated[idx - 1].order, updated[idx].order];
      return updated;
    });
  }

  function moveDown(id: string) {
    setMembers((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= arr.length - 1) return prev;
      const updated = arr.map((m) => ({ ...m }));
      [updated[idx].order, updated[idx + 1].order] = [updated[idx + 1].order, updated[idx].order];
      return updated;
    });
  }

  function handleSave(values: TeamFormValues) {
    if (editMember) {
      setMembers((prev) => prev.map((m) =>
        m.id === editMember.id ? { ...m, ...values } : m,
      ));
    } else {
      const maxOrder = members.length > 0 ? Math.max(...members.map((m) => m.order)) + 1 : 0;
      setMembers((prev) => [...prev, {
        id:    'tm_' + Math.random().toString(36).slice(2, 9),
        order: maxOrder,
        ...values,
      }]);
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<AdminTeamMember>[] = [
    {
      id: 'photo',
      header: 'Photo',
      cell: ({ row }) => (
        <img src={row.original.image} alt={row.original.name}
          className="w-10 h-10 rounded-full object-cover shrink-0" />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#111111] dark:text-white">{row.original.name}</p>
          <p className="text-xs text-[#9ca3af] mt-0.5 max-w-48 truncate">{row.original.bio}</p>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <span className="text-sm text-text-secondary dark:text-[#9ca3af]">{row.original.role}</span>,
    },
    {
      id: 'visible',
      header: 'Visible',
      cell: ({ row }) => (
        <Switch
          checked={row.original.visible}
          onCheckedChange={() => toggleVisible(row.original.id)}
          aria-label={`Toggle visibility for ${row.original.name}`}
        />
      ),
    },
    {
      id: 'order',
      header: 'Order',
      cell: ({ row }) => (
        <span className="text-xs text-text-secondary dark:text-[#9ca3af] font-mono">
          #{row.original.order + 1}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const m = row.original;
        const sortedIdx = sorted.findIndex((s) => s.id === m.id);
        return (
          <div className="flex items-center gap-1 justify-end">
            <button type="button"
              onClick={() => moveUp(m.id)}
              disabled={sortedIdx === 0}
              className="p-1 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
              aria-label={`Move ${m.name} up`}
            >
              <ArrowUp size={13} />
            </button>
            <button type="button"
              onClick={() => moveDown(m.id)}
              disabled={sortedIdx === sorted.length - 1}
              className="p-1 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
              aria-label={`Move ${m.name} down`}
            >
              <ArrowDown size={13} />
            </button>
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
              onClick={() => { setEditMember(m); setDialogOpen(true); }}
              aria-label={`Edit ${m.name}`}>
              <Pencil size={13} />
            </Button>
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
              onClick={() => setDeleteId(m.id)}
              aria-label={`Delete ${m.name}`}>
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
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Team</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {members.length} members · {visibleCount} visible on site
          </p>
        </div>
        <Button
          onClick={() => { setEditMember(null); setDialogOpen(true); }}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} /> Add Member
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sorted}
        searchKey="name"
        searchPlaceholder="Search team members…"
        pageSize={10}
      />

      <TeamDialog
        open={dialogOpen}
        member={editMember}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Remove Team Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This member will be removed from the Team page permanently.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => {
                if (deleteId) {
                  setMembers((prev) => prev.filter((m) => m.id !== deleteId));
                  setDeleteId(null);
                }
              }}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

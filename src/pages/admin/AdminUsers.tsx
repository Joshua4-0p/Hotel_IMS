import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ShieldOff, Copy, RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useAuth } from '../../context/AuthContext';
import type { AdminRole } from '../../context/AuthContext';
import { useAdminData, type AdminUser } from '../../context/AdminDataContext';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Constants ───────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  manager:     'Manager',
  front_desk:  'Front Desk',
};

const ROLE_BADGE: Record<AdminRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0',
  manager:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  front_desk:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function generatePassword(): string {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const all    = upper + lower + digits;
  return (
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    Array.from({ length: 7 }, () => all[Math.floor(Math.random() * all.length)]).join('')
  );
}

// ── Form schema ────────────────────────────────────────────────────────────────
const userSchema = z.object({
  name:  z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  role:  z.enum(['super_admin', 'manager', 'front_desk']),
});
type UserFormValues = z.infer<typeof userSchema>;

// ── Access Denied ──────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="p-6 flex items-center justify-center min-h-96">
      <div className="text-center">
        <ShieldOff size={48} className="mx-auto text-[#9ca3af] mb-4" />
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white">Access Restricted</h2>
        <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-1">
          Only super admins can manage staff accounts.
        </p>
      </div>
    </div>
  );
}

// ── Add/Edit Dialog ────────────────────────────────────────────────────────────
function UserDialog({
  open, user: editUser, onClose, onSave,
}: {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (values: UserFormValues) => void;
}) {
  const isNew = !editUser;
  const [tempPwd, setTempPwd] = useState(() => generatePassword());
  const [copied, setCopied]   = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: editUser
      ? { name: editUser.name, email: editUser.email, role: editUser.role }
      : { name: '', email: '', role: 'front_desk' },
  });

  // Reset when switching between add/edit
  useState(() => {
    if (open) {
      form.reset(editUser
        ? { name: editUser.name, email: editUser.email, role: editUser.role }
        : { name: '', email: '', role: 'front_desk' },
      );
      setTempPwd(generatePassword());
      setCopied(false);
    }
  });

  function copyPassword() {
    navigator.clipboard.writeText(tempPwd).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard not available in some contexts */ });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {isNew ? 'Add Staff Account' : 'Edit Staff Account'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" placeholder="staff@lodr.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="front_desk">Front Desk</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Temporary password — new accounts only */}
            {isNew && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-[#374151] dark:text-[#d1d5db]">
                  Temporary Password
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-[#f3f4f6] dark:bg-[#2a2a2a] px-3 py-2 rounded-button text-[#111111] dark:text-white border border-[#e5e7eb] dark:border-[#3a3a3a]">
                    {tempPwd}
                  </code>
                  <Button type="button" variant="outline" size="sm" className="shrink-0 h-9 w-9 p-0"
                    onClick={() => setTempPwd(generatePassword())}>
                    <RefreshCw size={13} />
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="shrink-0 h-9 w-9 p-0"
                    onClick={copyPassword}>
                    <Copy size={13} className={copied ? 'text-emerald-600' : ''} />
                  </Button>
                </div>
                <p className="text-[10px] text-[#9ca3af]">
                  Share this password with the staff member. They should change it on first login.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                {isNew ? 'Add Account' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminUsers() {
  const { user, adminRole } = useAuth();
  const { adminUsers, addAdminUser, updateAdminUser, removeAdminUser } = useAdminData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser,   setEditUser]   = useState<AdminUser | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  if (adminRole !== 'super_admin') return <AccessDenied />;

  const activeCount = adminUsers.filter((u) => u.active).length;

  function toggleActive(id: string) {
    const target = adminUsers.find((u) => u.id === id);
    if (!target || target.email === user?.email) return;
    updateAdminUser(id, { active: !target.active });
  }

  function handleSave(values: UserFormValues) {
    if (editUser) {
      updateAdminUser(editUser.id, { name: values.name, email: values.email, role: values.role });
    } else {
      addAdminUser({ name: values.name, email: values.email, role: values.role, active: true });
    }
    setDialogOpen(false);
    setEditUser(null);
  }

  function handleDelete(id: string) {
    removeAdminUser(id);
    setDeleteId(null);
  }

  function fmtLastLogin(ts: string) {
    if (!ts) return 'Never';
    try {
      return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-[#111111] dark:text-white">{row.original.name}</p>
          <p className="text-xs text-[#9ca3af] mt-0.5">{row.original.email}</p>
          {row.original.email === user?.email && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">You</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge className={ROLE_BADGE[row.original.role]}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-xs text-text-secondary dark:text-[#9ca3af]">
          {fmtLastLogin(row.original.lastLogin)}
        </span>
      ),
    },
    {
      id: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isSelf = row.original.email === user?.email;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.active}
              onCheckedChange={() => toggleActive(row.original.id)}
              disabled={isSelf}
              aria-label={`Toggle active for ${row.original.name}`}
            />
            <span className={`text-xs ${row.original.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9ca3af]'}`}>
              {row.original.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isSelf = row.original.email === user?.email;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm"
              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
              onClick={() => { setEditUser(row.original); setDialogOpen(true); }}
              aria-label={`Edit ${row.original.name}`}>
              <Pencil size={13} />
            </Button>
            {!isSelf && (
              <Button variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
                onClick={() => setDeleteId(row.original.id)}
                aria-label={`Remove ${row.original.name}`}>
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-275 mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Staff Accounts</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {adminUsers.length} accounts · {activeCount} active
          </p>
        </div>
        <Button onClick={() => { setEditUser(null); setDialogOpen(true); }}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2">
          <Plus size={15} /> Add Account
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-text-secondary dark:text-[#9ca3af]">
        <span className="font-medium">Roles:</span>
        {(['super_admin', 'manager', 'front_desk'] as AdminRole[]).map((role) => (
          <span key={role} className="flex items-center gap-1.5">
            <Badge className={`${ROLE_BADGE[role]} text-[10px]`}>{ROLE_LABELS[role]}</Badge>
          </span>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={adminUsers}
        searchKey="name"
        searchPlaceholder="Search staff members…"
        pageSize={10}
      />

      <UserDialog
        open={dialogOpen}
        user={editUser}
        onClose={() => { setDialogOpen(false); setEditUser(null); }}
        onSave={handleSave}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Remove Staff Account?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This will permanently remove the account. The staff member will lose admin access.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

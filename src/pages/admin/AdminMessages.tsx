import { useState, useMemo, useEffect } from 'react';
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useAdminData, type AdminMessage } from '../../context/AdminDataContext';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Local storage helpers ──────────────────────────────────────────────────────
const ARCHIVED_KEY    = 'lodr_msg_archived';
const ASSIGNMENTS_KEY = 'lodr_msg_assignments';

function loadArchived(): Set<string> {
  try {
    const raw = localStorage.getItem(ARCHIVED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}
function saveArchived(s: Set<string>) {
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify([...s]));
}

function loadAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveAssignments(a: Record<string, string>) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(a));
}

// ── Message Detail Dialog ─────────────────────────────────────────────────────
function MessageDetailDialog({
  msg,
  assignment,
  staffNames,
  onClose,
  onMarkRead,
  onMarkReplied,
  onAssign,
  onArchive,
}: {
  msg: AdminMessage | null;
  assignment: string;
  staffNames: string[];
  onClose: () => void;
  onMarkRead: () => void;
  onMarkReplied: () => void;
  onAssign: (name: string) => void;
  onArchive: () => void;
}) {
  if (!msg) return null;

  return (
    <Dialog open={!!msg} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white pr-8 leading-snug">
            {msg.subject}
          </DialogTitle>
        </DialogHeader>

        {/* Sender info */}
        <div className="flex items-start gap-3 p-3 bg-[#f8f9fa] dark:bg-[#2a2a2a] rounded-button">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111] dark:text-white">{msg.from}</p>
            <a href={`mailto:${msg.email}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{msg.email}</a>
            {msg.phone && <p className="text-xs text-[#9ca3af] mt-0.5">{msg.phone}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-[#9ca3af]">{msg.date}</span>
            {msg.read    && <Badge className="bg-[#f3f4f6] text-[#585858] dark:bg-[#2a2a2a] dark:text-[#9ca3af] border-0 text-[10px]">Read</Badge>}
            {msg.replied && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">Replied</Badge>}
          </div>
        </div>

        {/* Message body */}
        <div className="bg-white dark:bg-[#161616] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-button p-4">
          <p className="text-sm text-[#333333] dark:text-[#d1d5db] whitespace-pre-wrap leading-relaxed">
            {msg.body}
          </p>
        </div>

        {/* Assign to staff */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary dark:text-[#9ca3af] shrink-0">Assign to:</span>
          <Select value={assignment || '__none__'} onValueChange={(v) => onAssign(v === '__none__' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs flex-1 max-w-48">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {staffNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {assignment && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">→ {assignment}</span>
          )}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          {!msg.read && (
            <Button variant="outline" size="sm" onClick={onMarkRead} className="gap-1.5 text-xs">
              <MailOpen size={13} /> Mark Read
            </Button>
          )}
          {!msg.replied && (
            <Button variant="outline" size="sm" onClick={onMarkReplied} className="gap-1.5 text-xs">
              Mark Replied
            </Button>
          )}
          <Button size="sm"
            className="gap-1.5 text-xs bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
            onClick={() => {
              window.open(`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`);
              onMarkReplied();
            }}
          >
            <Reply size={13} /> Reply via Email
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5 text-xs ml-auto" onClick={onArchive}>
            <Trash2 size={13} /> Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminMessages() {
  const { messages, markMessageRead, markMessageReplied, adminUsers } = useAdminData();

  const [archived,     setArchived]     = useState<Set<string>>(loadArchived);
  const [assignments,  setAssignments]  = useState<Record<string, string>>(loadAssignments);
  const [detailMsg,    setDetailMsg]    = useState<AdminMessage | null>(null);
  const [readFilter,   setReadFilter]   = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => { saveArchived(archived); },    [archived]);
  useEffect(() => { saveAssignments(assignments); }, [assignments]);

  const staffNames = adminUsers.map((u) => u.name);

  const visible = useMemo(() => {
    const base = messages.filter((m) => !archived.has(m.id));
    if (readFilter === 'unread') return base.filter((m) => !m.read);
    if (readFilter === 'read')   return base.filter((m) => m.read);
    return base;
  }, [messages, archived, readFilter]);

  const unreadCount = messages.filter((m) => !archived.has(m.id) && !m.read).length;

  function openDetail(msg: AdminMessage) {
    setDetailMsg(msg);
    if (!msg.read) markMessageRead(msg.id);
  }

  function handleArchive() {
    if (!detailMsg) return;
    setArchived((prev) => new Set([...prev, detailMsg.id]));
    setDetailMsg(null);
  }

  function handleAssign(staffName: string) {
    if (!detailMsg) return;
    setAssignments((prev) => ({ ...prev, [detailMsg.id]: staffName }));
  }

  const columns: ColumnDef<AdminMessage>[] = [
    {
      accessorKey: 'from',
      header: 'From',
      cell: ({ row }) => (
        <button type="button" className="text-left w-full" onClick={() => openDetail(row.original)}>
          <p className={`text-sm ${row.original.read ? 'font-normal text-text-secondary dark:text-[#9ca3af]' : 'font-semibold text-[#111111] dark:text-white'}`}>
            {row.original.from}
          </p>
          <p className="text-xs text-[#9ca3af] mt-0.5 truncate max-w-48">{row.original.email}</p>
        </button>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <button type="button" className="text-left w-full" onClick={() => openDetail(row.original)}>
          <p className={`text-sm truncate max-w-xs ${row.original.read ? 'text-text-secondary dark:text-[#9ca3af]' : 'font-medium text-[#111111] dark:text-white'}`}>
            {row.original.subject}
          </p>
          <p className="text-xs text-[#9ca3af] mt-0.5 truncate max-w-xs">{row.original.body.slice(0, 60)}…</p>
        </button>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-xs text-[#9ca3af]">{row.original.date}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={row.original.read
            ? 'bg-[#f3f4f6] text-text-secondary dark:bg-[#2a2a2a] dark:text-[#9ca3af] border-0 text-[10px]'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[10px]'
          }>
            {row.original.read ? 'Read' : 'Unread'}
          </Badge>
          {row.original.replied && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
              Replied
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'assignedTo',
      header: 'Assigned',
      cell: ({ row }) => (
        <span className="text-xs text-text-secondary dark:text-[#9ca3af]">
          {assignments[row.original.id] || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
            onClick={() => openDetail(row.original)}
            aria-label={`Open message from ${row.original.from}`}>
            {row.original.read ? <MailOpen size={13} /> : <Mail size={13} />}
          </Button>
          <Button variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
            onClick={() => setArchived((prev) => new Set([...prev, row.original.id]))}
            aria-label={`Archive message from ${row.original.from}`}>
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Messages</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {visible.length} messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {([
          { key: 'all',    label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'read',   label: 'Read' },
        ] as const).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setReadFilter(key)}
            className={`px-3 py-1.5 rounded-button text-xs font-medium transition-colors ${
              readFilter === key
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
        data={visible}
        searchKey="from"
        searchPlaceholder="Search by sender name…"
        pageSize={10}
      />

      <MessageDetailDialog
        msg={detailMsg}
        assignment={detailMsg ? (assignments[detailMsg.id] ?? '') : ''}
        staffNames={staffNames}
        onClose={() => setDetailMsg(null)}
        onMarkRead={() => { if (detailMsg) markMessageRead(detailMsg.id); }}
        onMarkReplied={() => { if (detailMsg) markMessageReplied(detailMsg.id); }}
        onAssign={handleAssign}
        onArchive={handleArchive}
      />
    </div>
  );
}

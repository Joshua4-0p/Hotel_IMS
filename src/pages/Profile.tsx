import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Globe, Lock, ChevronLeft, Pencil, Check } from 'lucide-react';
import { useAuth, type User as UserType } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface FieldRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function FieldRow({ label, value, icon }: FieldRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-[#E3E3E3] last:border-0">
      <span className="text-[#BDBDBD] mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="label text-[#585858]">{label}</p>
        <p className="body-md text-[#000000] mt-0.5 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

interface EditFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function EditField({ label, type = 'text', value, onChange, placeholder, required, autoComplete }: EditFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label text-[#585858]">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="px-3 py-2.5 border border-[#C3C3C3] rounded-[0.5rem] body-sm focus:outline-none focus:border-[#141414] transition-colors"
      />
    </label>
  );
}

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { toast }                       = useToast();
  const [editing, setEditing]           = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  const [form, setForm] = useState<Omit<UserType, 'id'>>({
    name:     user?.name     ?? '',
    email:    user?.email    ?? '',
    location: user?.location ?? '',
    country:  user?.country  ?? '',
    phone:    user?.phone    ?? '',
  });

  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError,   setPwError]   = useState('');

  function set(field: keyof typeof form) {
    return (v: string) => setForm((prev) => ({ ...prev, [field]: v }));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim())  { toast('Name is required.', 'error'); return; }
    if (!form.email.trim()) { toast('Email is required.', 'error'); return; }
    updateProfile(form);
    toast('Profile updated!');
    setEditing(false);
  }

  function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    toast('Password updated!');
    setNewPw('');
    setConfirmPw('');
    setShowPwSection(false);
  }

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="container-wide section-py">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">

          {/* Back link */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 body-sm text-[#585858] hover:text-[#000000] transition-colors w-fit"
          >
            <ChevronLeft size={15} /> Back to Dashboard
          </Link>

          {/* Avatar + Name */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#141414] text-white flex items-center justify-center heading-lg font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="heading-xl text-[#000000]">{user?.name}</h1>
              <p className="body-sm text-[#585858]">{user?.email}</p>
            </div>
          </div>

          {/* Profile card */}
          <div
            className="bg-white rounded-[0.75rem] border border-[#E3E3E3] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E3E3]">
              <h2 className="heading-md text-[#000000]">Profile Details</h2>
              <button
                onClick={() => setEditing((v) => !v)}
                className="flex items-center gap-1.5 body-sm text-[#585858] hover:text-[#000000] transition-colors"
              >
                {editing ? <Check size={14} /> : <Pencil size={14} />}
                {editing ? 'Cancel edit' : 'Edit profile'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* View mode */}
              {!editing && (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6"
                >
                  <FieldRow label="Full name"   value={user?.name     ?? ''} icon={<User    size={16} />} />
                  <FieldRow label="Email"        value={user?.email    ?? ''} icon={<Mail    size={16} />} />
                  <FieldRow label="Phone"        value={user?.phone    ?? ''} icon={<Phone   size={16} />} />
                  <FieldRow label="Location"     value={user?.location ?? ''} icon={<MapPin  size={16} />} />
                  <FieldRow label="Country"      value={user?.country  ?? ''} icon={<Globe   size={16} />} />
                </motion.div>
              )}

              {/* Edit mode */}
              {editing && (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSave}
                  className="p-6 flex flex-col gap-4"
                  noValidate
                >
                  <EditField
                    label="Full name" value={form.name} onChange={set('name')}
                    placeholder="John Smith" required autoComplete="name"
                  />
                  <EditField
                    label="Email" type="email" value={form.email} onChange={set('email')}
                    placeholder="you@example.com" required autoComplete="email"
                  />
                  <EditField
                    label="Phone" type="tel" value={form.phone} onChange={set('phone')}
                    placeholder="+1 (555) 000-0000" autoComplete="tel"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <EditField
                      label="Location" value={form.location} onChange={set('location')}
                      placeholder="New York" autoComplete="address-level2"
                    />
                    <EditField
                      label="Country" value={form.country} onChange={set('country')}
                      placeholder="United States" autoComplete="country-name"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-2 w-full py-3 bg-[#141414] text-white rounded-[0.5rem] body-md font-medium hover:bg-[#2a2a2a] transition-colors"
                  >
                    Save changes
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Change password */}
          <div
            className="bg-white rounded-[0.75rem] border border-[#E3E3E3] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            <button
              onClick={() => setShowPwSection((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-[#585858]" />
                <span className="body-md font-medium text-[#000000]">Change Password</span>
              </div>
              <span className="body-sm text-[#585858]">{showPwSection ? 'Cancel' : 'Update'}</span>
            </button>

            <AnimatePresence>
              {showPwSection && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handlePasswordSave}
                  className="overflow-hidden"
                  noValidate
                >
                  <div className="px-6 pb-6 flex flex-col gap-4 border-t border-[#E3E3E3]">
                    <div className="pt-4">
                      <EditField
                        label="New password" type="password"
                        value={newPw} onChange={setNewPw}
                        placeholder="Min. 6 characters" autoComplete="new-password"
                      />
                    </div>
                    <EditField
                      label="Confirm new password" type="password"
                      value={confirmPw} onChange={setConfirmPw}
                      placeholder="Re-enter new password" autoComplete="new-password"
                    />
                    {pwError && <p className="body-sm text-red-500">{pwError}</p>}
                    <button
                      type="submit"
                      className="py-2.5 bg-[#141414] text-white rounded-[0.5rem] body-sm font-medium hover:bg-[#2a2a2a] transition-colors"
                    >
                      Update password
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Danger zone */}
          <div className="rounded-[0.75rem] border border-red-100 bg-red-50/50 p-5 flex items-center justify-between">
            <div>
              <p className="body-sm font-medium text-red-700">Sign out</p>
              <p className="label text-red-400 mt-0.5">You will be redirected to the home page.</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-[0.5rem] body-sm font-medium hover:bg-red-100 transition-colors"
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

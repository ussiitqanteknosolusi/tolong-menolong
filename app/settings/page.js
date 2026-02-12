'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft, User, Lock, Bell, Palette, Globe,
  Save, Eye, EyeOff, Loader2, Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification prefs (localStorage based)
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [donationNotif, setDonationNotif] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setPhone(data.data.phone || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Load notification prefs
    const savedPrefs = localStorage.getItem(`notif_prefs_${user.id}`);
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setEmailNotif(prefs.email ?? true);
      setPushNotif(prefs.push ?? true);
      setDonationNotif(prefs.donation ?? true);
    }

    fetchProfile();
  }, [user, router]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updates = {};
      if (name !== profile.name) updates.name = name;
      if (phone !== profile.phone) updates.phone = phone;

      if (Object.keys(updates).length === 0) {
        toast.info('Tidak ada perubahan');
        return;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        updateUser(updates);
        toast.success('Profil berhasil diperbarui!');
      } else {
        toast.error('Gagal menyimpan perubahan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error('Password baru wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        toast.success('Password berhasil diperbarui!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Gagal mengubah password');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifPrefs = () => {
    const prefs = {
      email: emailNotif,
      push: pushNotif,
      donation: donationNotif,
    };
    localStorage.setItem(`notif_prefs_${user.id}`, JSON.stringify(prefs));
    toast.success('Preferensi notifikasi disimpan');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Pengaturan</h1>
        </div>

        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Informasi Profil
          </h2>
          <Card className="mb-6 border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama Lengkap</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={email} disabled className="bg-gray-100 text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Nomor Telepon</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-gray-50" placeholder="08xxxxxxxxxx" />
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Ubah Password
          </h2>
          <Card className="mb-6 border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <label className="text-sm font-medium mb-1 block">Password Baru</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bg-gray-50 pr-10"
                  placeholder="Minimal 6 karakter"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Konfirmasi Password Baru</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-gray-50"
                  placeholder="Ulangi password baru"
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Ubah Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifikasi
          </h2>
          <Card className="mb-6 border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <ToggleItem
                label="Notifikasi Email"
                desc="Terima pemberitahuan melalui email"
                checked={emailNotif}
                onChange={() => setEmailNotif(!emailNotif)}
              />
              <ToggleItem
                label="Push Notification"
                desc="Terima pemberitahuan di browser"
                checked={pushNotif}
                onChange={() => setPushNotif(!pushNotif)}
              />
              <ToggleItem
                label="Notifikasi Donasi"
                desc="Diberitahu saat ada donasi masuk"
                checked={donationNotif}
                onChange={() => setDonationNotif(!donationNotif)}
              />
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleSaveNotifPrefs}
                >
                  <Check className="w-4 h-4" />
                  Simpan Preferensi
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

function ToggleItem({ label, desc, checked, onChange }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
        onClick={onChange}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

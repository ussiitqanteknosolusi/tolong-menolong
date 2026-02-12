'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlarmClock, ChevronLeft, Plus, Trash2, Bell, BellOff,
  Loader2, Clock, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

const REMINDER_OPTIONS = [
  { label: 'Setiap Hari', value: 'daily', desc: 'Pengingat setiap hari pukul 08:00' },
  { label: 'Setiap Minggu', value: 'weekly', desc: 'Pengingat setiap hari Jumat pukul 08:00' },
  { label: 'Setiap Bulan', value: 'monthly', desc: 'Pengingat setiap tanggal 1 pukul 08:00' },
];

export default function RemindersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Load saved reminders from localStorage
    const saved = localStorage.getItem(`reminders_${user.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      setReminders(data.reminders || []);
      setIsActive(data.isActive || false);
      setSelectedFrequency(data.frequency || null);
      setCustomAmount(data.amount || '');
    }
  }, [user, router]);

  const saveReminder = () => {
    if (!selectedFrequency) {
      toast.error('Pilih frekuensi pengingat terlebih dahulu');
      return;
    }

    const data = {
      isActive: true,
      frequency: selectedFrequency,
      amount: customAmount,
      reminders: [
        ...reminders,
        {
          id: Date.now().toString(),
          frequency: selectedFrequency,
          amount: customAmount,
          createdAt: new Date().toISOString(),
        }
      ]
    };

    localStorage.setItem(`reminders_${user.id}`, JSON.stringify(data));
    setReminders(data.reminders);
    setIsActive(true);
    toast.success('Pengingat donasi berhasil diaktifkan! 🔔');
  };

  const toggleActive = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    const saved = localStorage.getItem(`reminders_${user.id}`);
    const data = saved ? JSON.parse(saved) : {};
    data.isActive = newState;
    localStorage.setItem(`reminders_${user.id}`, JSON.stringify(data));

    toast.success(newState ? 'Pengingat diaktifkan 🔔' : 'Pengingat dinonaktifkan');
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    
    const saved = localStorage.getItem(`reminders_${user.id}`);
    const data = saved ? JSON.parse(saved) : {};
    data.reminders = updated;
    if (updated.length === 0) {
      data.isActive = false;
      setIsActive(false);
    }
    localStorage.setItem(`reminders_${user.id}`, JSON.stringify(data));
    toast.success('Pengingat dihapus');
  };

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Pengingat Donasi</h1>
        </div>

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`mb-6 border-none shadow-lg overflow-hidden ${
            isActive
              ? 'bg-gradient-to-br from-blue-500 to-blue-700'
              : 'bg-gradient-to-br from-gray-400 to-gray-600'
          } text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <BellOff className="w-5 h-5 opacity-60" />
                  )}
                  <span className="text-sm font-medium opacity-90">
                    {isActive ? 'Pengingat Aktif' : 'Pengingat Tidak Aktif'}
                  </span>
                </div>
                {reminders.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-none"
                    onClick={toggleActive}
                  >
                    {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                )}
              </div>
              <p className="text-2xl font-bold">
                {reminders.length} Pengingat
              </p>
              <p className="text-sm opacity-80 mt-1">
                Tetap konsisten dalam kebaikan
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Set Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Atur Pengingat Baru
          </h2>
          <Card className="mb-6 border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              {/* Frequency */}
              <div>
                <p className="text-sm font-medium mb-2">Frekuensi</p>
                <div className="space-y-2">
                  {REMINDER_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedFrequency === opt.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFrequency(opt.value)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedFrequency === opt.value
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFrequency === opt.value && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm font-medium mb-2">Target Donasi (opsional)</p>
                <Input
                  type="number"
                  placeholder="Contoh: 10000"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="bg-gray-50"
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={saveReminder}
              >
                <Plus className="w-4 h-4 mr-2" />
                Simpan Pengingat
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Existing Reminders */}
        {reminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
              Pengingat Saya
            </h2>
            <Card className="border-none shadow-sm">
              <CardContent className="p-0 divide-y">
                {reminders.map(r => {
                  const opt = REMINDER_OPTIONS.find(o => o.value === r.frequency);
                  return (
                    <div key={r.id} className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <AlarmClock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{opt?.label || r.frequency}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.amount ? `Target: Rp ${parseInt(r.amount).toLocaleString('id-ID')}` : 'Tanpa target'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteReminder(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Repeat, ChevronLeft, Plus, Trash2, Play, Pause,
  Loader2, Heart, Search, Edit2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0);
}

const AMOUNT_OPTIONS = [10000, 25000, 50000, 100000];
const FREQUENCY_OPTIONS = [
  { label: 'Setiap Menit', value: 'minute' },
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
];

export default function AutoDonatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [autoDonations, setAutoDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [autoRes, campRes] = await Promise.all([
          fetch(`/api/recurring-donations?userId=${user.id}`),
          fetch('/api/campaigns')
        ]);
        
        const autoData = await autoRes.json();
        const campData = await campRes.json();
        
        if (autoData.success) {
          // Normalize DB snake_case to UI camelCase
          const normalized = autoData.data.map(d => ({
            ...d,
            isActive: !!d.is_active
          }));
          setAutoDonations(normalized);
        }
        if (campData.success) setCampaigns(campData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const saveAutoDonation = async () => {
    if (!selectedCampaign || !amount) {
      toast.error('Pilih campaign dan jumlah donasi');
      return;
    }

    try {
      const url = editingId 
        ? `/api/recurring-donations/${editingId}` 
        : '/api/recurring-donations';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          campaignId: selectedCampaign.id,
          amount: parseInt(amount),
          frequency,
          // If creating, default active. If editing, preserve active state or just update details.
          // The API might handle isActive separately, but for PUT we might need to send it if we want to change details.
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(editingId ? 'Donasi otomatis diperbarui!' : 'Donasi otomatis berhasil diatur! 🎉');
        resetForm();
        // Refresh list
        const autoRes = await fetch(`/api/recurring-donations?userId=${user.id}`);
        const autoData = await autoRes.json();
        if (autoData.success) {
            const normalized = autoData.data.map(d => ({
                ...d,
                isActive: !!d.is_active
            }));
            setAutoDonations(normalized);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan donasi otomatis');
    }
  };

  const resetForm = () => {
    setShowSetup(false);
    setSelectedCampaign(null);
    setAmount('');
    setFrequency('monthly');
    setEditingId(null);
  };

  const handleEdit = (donation) => {
    // Find campaign details
    const campaign = campaigns.find(c => c.title === donation.campaignTitle) || { id: donation.campaign_id, title: donation.campaignTitle };
    
    setSelectedCampaign(campaign);
    setAmount(donation.amount.toString());
    setFrequency(donation.frequency);
    setEditingId(donation.id);
    setShowSetup(true);
  };

  const toggleAutoDonation = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/recurring-donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setAutoDonations(prev => prev.map(d =>
          d.id === id ? { ...d, isActive: !currentStatus } : d
        ));
        toast.success(!currentStatus ? 'Donasi otomatis diaktifkan' : 'Donasi otomatis dijeda');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAutoDonation = async (id) => {
    if(!confirm('Apakah Anda yakin ingin menghapus donasi otomatis ini?')) return;
    try {
      const res = await fetch(`/api/recurring-donations/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        setAutoDonations(prev => prev.filter(d => d.id !== id));
        toast.success('Donasi otomatis dihapus');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div>
            <h1 className="text-xl font-bold">Donasi Otomatis</h1>
            <p className="text-xs text-muted-foreground">Dukung galang dana pilihanmu tanpa putus</p>
          </div>
          <Badge className="bg-blue-100 text-blue-600 border-none ml-auto">BARU</Badge>
        </div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">Bagaimana cara kerjanya?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Donasi otomatis memungkinkan kamu untuk secara konsisten mendukung 
                    campaign pilihan tanpa perlu mengingat-ingat. Atur jumlah dan frekuensi, 
                    dan sistem akan mengirimkan pengingat pembayaran secara otomatis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Auto Donations */}
        {autoDonations.length > 0 && !showSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
              Donasi Otomatis Aktif ({autoDonations.filter(d => d.isActive).length})
            </h2>
            <div className="space-y-3">
              {autoDonations.map(d => (
                <Card key={d.id} className={`border-none shadow-sm ${!d.isActive && 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${d.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {d.campaignTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {formatCurrency(d.amount)} / {d.frequency === 'minute' ? 'menit' : d.frequency === 'daily' ? 'hari' : d.frequency === 'weekly' ? 'minggu' : 'bulan'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(d)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleAutoDonation(d.id, d.isActive)}
                        >
                          {d.isActive ? (
                            <Pause className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600"
                          onClick={() => deleteAutoDonation(d.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Setup Form */}
        {showSetup ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{editingId ? 'Edit Donasi Otomatis' : 'Buat Donasi Otomatis Baru'}</h3>

                {/* Select Campaign */}
                <div>
                  <p className="text-sm font-medium mb-2">Pilih Campaign</p>
                  <Input
                    placeholder="Cari campaign..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="mb-2 bg-gray-50"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-1">
                    {filteredCampaigns.slice(0, 10).map(c => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          selectedCampaign?.id === c.id
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCampaign(c)}
                      >
                        {c.title}
                      </div>
                    ))}
                  </div>
                    {selectedCampaign && (
                        <div className="mt-2 text-xs text-emerald-600 font-medium">
                            Terpilih: {selectedCampaign.title}
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div>
                  <p className="text-sm font-medium mb-2">Jumlah Donasi</p>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {AMOUNT_OPTIONS.map(opt => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={parseInt(amount) === opt ? 'default' : 'outline'}
                        className={parseInt(amount) === opt ? 'bg-emerald-600' : ''}
                        onClick={() => setAmount(opt.toString())}
                      >
                        {(opt / 1000)}rb
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Atau masukkan jumlah lain"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <p className="text-sm font-medium mb-2">Frekuensi</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FREQUENCY_OPTIONS.map(opt => (
                      <Button
                        key={opt.value}
                        variant={frequency === opt.value ? 'default' : 'outline'}
                        className={frequency === opt.value ? 'bg-emerald-600' : ''}
                        onClick={() => setFrequency(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={saveAutoDonation}>
                    {editingId ? 'Simpan Perubahan' : 'Simpan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 gap-2"
              onClick={() => setShowSetup(true)}
            >
              <Plus className="w-5 h-5" />
              Tambah Donasi Otomatis
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet, ChevronLeft, Plus, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Clock, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [donations, setDonations] = useState([]);
  const [topups, setTopups] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [donationsRes, topupsRes, userRes] = await Promise.all([
        fetch(`/api/users/${user.id}/donations`),
        fetch(`/api/users/${user.id}/topups`),
        fetch(`/api/users/${user.id}`)
      ]);
      
      const donationsData = await donationsRes.json();
      const topupsData = await topupsRes.json();
      const userData = await userRes.json();
      
      if (donationsData.success && topupsData.success) {
        // Combine and tag transactions
        const combined = [
          ...donationsData.data.map(d => ({ ...d, type: 'donation' })),
          ...topupsData.data.map(t => ({ 
            id: t.id,
            amount: t.amount,
            status: t.status,
            date: t.created_at,
            campaignTitle: 'Top Up Saldo',
            type: 'topup'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setDonations(combined);
        setTopups(topupsData.data);
        
        const total = donationsData.data
          .filter(d => d.status === 'paid')
          .reduce((sum, d) => sum + d.amount, 0);
        setTotalDonated(total);
      }

      if (userData.success) {
        setBalance(userData.data.balance || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const handleTopUp = async (amount) => {
    const finalAmount = amount || topUpAmount;
    if (!finalAmount || finalAmount < 10000) {
      alert('Minimal top up Rp 10.000');
      return;
    }

    setIsTopUpLoading(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parseInt(finalAmount),
          email: user.email,
          name: user.name
        }),
      });
      const data = await res.json();
      if (data.success && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat tagihan top up');
    } finally {
      setIsTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const paidDonations = donations.filter(d => d.status === 'paid');

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Kantong Donasimu</h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-none shadow-lg overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 opacity-80" />
                    <span className="text-xs opacity-80 font-medium">Saldo Kantong Donasi</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
                    <TrendingUp className="w-4 h-4 opacity-80" />
                    <span className="text-xs opacity-80 font-medium">Total Terdonasi</span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(totalDonated)}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20 flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Terakhir Digunakan</p>
                  <p className="text-sm font-medium">
                    {paidDonations.length > 0 
                      ? new Date(paidDonations[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      : '-'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Status Akun</p>
                  <p className="text-sm font-medium">Aktif ✨</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Up Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Isi Saldo (Top Up)
          </h2>
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[50000, 100000, 250000].map(amt => (
                  <Button 
                    key={amt} 
                    variant="outline" 
                    size="sm" 
                    className="h-10 hover:border-emerald-500 hover:text-emerald-600"
                    onClick={() => handleTopUp(amt)}
                    disabled={isTopUpLoading}
                  >
                    {amt / 1000}rb
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</div>
                  <input 
                    type="number" 
                    placeholder="Jumlah lainnya"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-xl shadow-md active:scale-95 transition-all"
                  onClick={() => handleTopUp()}
                  disabled={isTopUpLoading}
                >
                  {isTopUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center mb-2">
                Top up aman & instan via Xendit (Virtual Account, E-Wallet, QRIS)
              </p>

               {/* Debug Simulation Button */}
               {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                        onClick={async () => {
                            // Find latest pending topup
                            const pending = topups.find(t => t.status === 'pending');
                            if (!pending) {
                                alert('Buat tagihan top up dulu baru bisa disimulasikan!');
                                return;
                            }
                            
                            try {
                                const res = await fetch('/api/debug/simulate-topup-success', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ topupId: pending.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    alert('Simulasi Berhasil! Saldo bertambah.');
                                    fetchData(); // Refresh UI
                                } else {
                                    alert('Gagal: ' + data.message);
                                }
                            } catch (e) {
                                console.error(e);
                                alert('Error simulasi');
                            }
                        }}
                    >
                        ⚡ Simulasi Bayar Sukses (Dev Only)
                    </Button>
                </div>
               )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
              Riwayat Transaksi
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-emerald-600 h-7" onClick={fetchData}>
              Refresh
            </Button>
          </div>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              {donations.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-semibold text-gray-900">Belum ada transaksi</p>
                  <p className="text-sm mt-1">Mulai isi saldo atau berdonasi sekarang</p>
                </div>
              ) : (
                donations.slice(0, 20).map(d => (
                  <div key={d.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-xl ${
                      d.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {d.status === 'paid' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {d.campaignTitle}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {new Date(d.date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short'
                        })}
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {d.status === 'paid' ? 'Donasi Keluar' : 'Menunggu Bayar'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        d.status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'
                      }`}>
                        {d.status === 'paid' ? '-' : ''}{formatCurrency(d.amount)}
                      </p>
                      <Badge variant="ghost" className={cn(
                        "text-[9px] uppercase font-bold p-0 h-auto",
                        d.status === 'paid' ? "text-emerald-500" : "text-yellow-500"
                      )}>
                        {d.status === 'paid' ? 'Berhasil' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

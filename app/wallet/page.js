'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet, ChevronLeft, Plus, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Clock, Loader2, Calendar, Filter, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// ✅ Date filter presets
const DATE_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: 'week', label: '7 Hari' },
  { key: 'month', label: '30 Hari' },
  { key: 'custom', label: 'Custom' },
];

function getDateRange(filterKey) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filterKey) {
    case 'today':
      return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    case 'week': {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      return { from: d.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    case 'month': {
      const d = new Date(today); d.setDate(d.getDate() - 30);
      return { from: d.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    default: return { from: null, to: null };
  }
}

const ITEMS_PER_PAGE = 20;

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [topups, setTopups] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // ✅ Pagination & Filter state
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Build URL params for date filter
  const buildDateParams = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFilter === 'custom') {
      if (customDateFrom) params.set('dateFrom', customDateFrom);
      if (customDateTo) params.set('dateTo', customDateTo);
    } else if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range.from) params.set('dateFrom', range.from);
      if (range.to) params.set('dateTo', range.to);
    }
    return params;
  }, [dateFilter, customDateFrom, customDateTo]);

  const fetchData = useCallback(async (newOffset = 0, append = false) => {
    if (!user) return;
    
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      // Build API params with pagination
      const donParams = buildDateParams();
      donParams.set('limit', String(ITEMS_PER_PAGE));
      donParams.set('offset', String(newOffset));

      const topupParams = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        offset: String(newOffset),
      });

      const [donationsRes, topupsRes, userRes] = await Promise.all([
        fetch(`/api/users/${user.id}/donations?${donParams}`),
        fetch(`/api/users/${user.id}/topups?${topupParams}`),
        !append ? fetch(`/api/users/${user.id}`) : Promise.resolve(null),
      ]);
      
      const donationsData = await donationsRes.json();
      const topupsData = await topupsRes.json();
      
      if (donationsData.success && topupsData.success) {
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

        if (append) {
          setTransactions(prev => [...prev, ...combined]);
        } else {
          setTransactions(combined);
        }

        setTopups(topupsData.data);
        
        // Calculate total count from both sources
        const donTotal = donationsData.pagination?.total || 0;
        const topTotal = topupsData.pagination?.total || 0;
        setTotalCount(donTotal + topTotal);
        setHasMore(donationsData.pagination?.hasMore || topupsData.pagination?.hasMore || false);
        setOffset(newOffset);
        
        if (!append) {
          const total = donationsData.data
            .filter(d => d.status === 'paid')
            .reduce((sum, d) => sum + d.amount, 0);
          setTotalDonated(total);
        }
      }

      if (!append && userRes) {
        const userData = await userRes.json();
        if (userData.success) {
          setBalance(userData.data.balance || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, buildDateParams]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchData(0, false);
  }, [user, authLoading, dateFilter, customDateFrom, customDateTo]);

  // Custom date validation (max 7 days)
  const handleCustomDateFrom = (val) => {
    setCustomDateFrom(val);
    if (customDateTo) {
      const diff = (new Date(customDateTo) - new Date(val)) / (1000 * 60 * 60 * 24);
      if (diff > 7) {
        const maxTo = new Date(val);
        maxTo.setDate(maxTo.getDate() + 7);
        setCustomDateTo(maxTo.toISOString().split('T')[0]);
        toast.info('Rentang maksimal 7 hari');
      }
    }
  };

  const handleCustomDateTo = (val) => {
    if (customDateFrom) {
      const diff = (new Date(val) - new Date(customDateFrom)) / (1000 * 60 * 60 * 24);
      if (diff > 7) { toast.error('Rentang maksimal 7 hari'); return; }
      if (diff < 0) { toast.error('Tanggal akhir harus setelah tanggal awal'); return; }
    }
    setCustomDateTo(val);
  };

  const handleLoadMore = () => {
    fetchData(offset + ITEMS_PER_PAGE, true);
  };

  const handleTopUp = async (amount) => {
    const finalAmount = amount || topUpAmount;
    if (!finalAmount || finalAmount < 10000) {
      toast.error('Minimal top up Rp 10.000');
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
      toast.error('Gagal membuat tagihan top up');
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-lg overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 opacity-80" />
                    <span className="text-xs opacity-80 font-medium">Saldo Kantong Donasi</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
                    <TrendingUp className="w-4 h-4 opacity-80" />
                    <span className="text-xs opacity-80 font-medium">Total Terdonasi</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(totalDonated)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20 flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Terakhir Digunakan</p>
                  <p className="text-sm font-medium">
                    {transactions.filter(d => d.status === 'paid').length > 0
                      ? new Date(transactions.filter(d => d.status === 'paid')[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
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
                      const pending = topups.find(t => t.status === 'pending');
                      if (!pending) { toast.error('Buat tagihan top up dulu!'); return; }
                      try {
                        const res = await fetch('/api/debug/simulate-topup-success', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ topupId: pending.id })
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast.success('Simulasi Berhasil! Saldo bertambah.');
                          fetchData(0, false);
                        } else { toast.error('Gagal: ' + data.message); }
                      } catch (e) { console.error(e); toast.error('Error simulasi'); }
                    }}
                  >
                    ⚡ Simulasi Bayar Sukses (Dev Only)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ Transaction History with Filter & Pagination */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
              Riwayat Transaksi
              {totalCount > 0 && <span className="text-emerald-600 ml-1">({totalCount})</span>}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs h-7 gap-1",
                  showFilters ? "text-emerald-600 bg-emerald-50" : "text-gray-500"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-3 h-3" />
                Filter
                {dateFilter !== 'all' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 h-7" onClick={() => fetchData(0, false)}>
                Refresh
              </Button>
            </div>
          </div>

          {/* ✅ Date Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden mb-3"
            >
              <Card className="border-none shadow-sm">
                <CardContent className="p-3 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" /> Rentang Waktu
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DATE_FILTERS.map(f => (
                        <Badge
                          key={f.key}
                          className={cn(
                            "cursor-pointer py-1 px-2.5 rounded-md text-[11px] transition-all",
                            dateFilter === f.key
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          onClick={() => setDateFilter(f.key)}
                        >
                          {f.label}
                        </Badge>
                      ))}
                    </div>
                    {dateFilter === 'custom' && (
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-muted-foreground">Dari</label>
                          <input
                            type="date"
                            value={customDateFrom}
                            onChange={(e) => handleCustomDateFrom(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full h-8 px-2 rounded-md border border-gray-200 text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-muted-foreground">Sampai</label>
                          <input
                            type="date"
                            value={customDateTo}
                            onChange={(e) => handleCustomDateTo(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full h-8 px-2 rounded-md border border-gray-200 text-xs"
                          />
                        </div>
                      </div>
                    )}
                    {dateFilter === 'custom' && (
                      <p className="text-[9px] text-muted-foreground mt-1">⚠️ Maks 7 hari</p>
                    )}
                  </div>
                  {dateFilter !== 'all' && (
                    <Button variant="ghost" size="sm" className="text-[10px] w-full h-6" onClick={() => setDateFilter('all')}>
                      <X className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Transaction List */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-semibold text-gray-900">
                    {dateFilter !== 'all' ? 'Tidak ada transaksi' : 'Belum ada transaksi'}
                  </p>
                  <p className="text-sm mt-1">
                    {dateFilter !== 'all' ? 'Coba ubah filter tanggal' : 'Mulai isi saldo atau berdonasi sekarang'}
                  </p>
                </div>
              ) : (
                <>
                  {transactions.map(d => (
                    <div key={`${d.type}-${d.id}`} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-xl ${
                        d.type === 'topup'
                          ? 'bg-blue-50 text-blue-600'
                          : d.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {d.type === 'topup' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : d.status === 'paid' ? (
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
                          {new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          {d.type === 'topup' ? 'Top Up Saldo' : d.status === 'paid' ? 'Donasi Keluar' : 'Menunggu Bayar'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          d.type === 'topup'
                            ? 'text-blue-600'
                            : d.status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'
                        }`}>
                          {d.type === 'topup' ? '+' : '-'}{formatCurrency(d.amount)}
                        </p>
                        <Badge variant="ghost" className={cn(
                          "text-[9px] uppercase font-bold p-0 h-auto",
                          d.type === 'topup' ? 'text-blue-500'
                            : d.status === 'paid' ? "text-emerald-500" : "text-yellow-500"
                        )}>
                          {d.status === 'paid' ? 'Berhasil' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* ✅ Load More */}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-emerald-600 h-8"
                      >
                        {loadingMore ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Memuat...</>
                        ) : (
                          `Muat lebih banyak (${transactions.length}/${totalCount})`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

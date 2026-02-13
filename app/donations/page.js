'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, CheckCircle, Clock, Zap, Loader2, Calendar, ChevronDown, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ✅ Date range presets
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
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { from: monthAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    default:
      return { from: null, to: null };
  }
}

const ITEMS_PER_PAGE = 15;

export default function MyDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Filter states
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchDonations = useCallback(async (newOffset = 0, append = false) => {
    if (!user) { setLoading(false); return; }

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        offset: String(newOffset),
      });

      // Apply date filter
      if (dateFilter === 'custom') {
        if (customDateFrom) params.set('dateFrom', customDateFrom);
        if (customDateTo) params.set('dateTo', customDateTo);
      } else if (dateFilter !== 'all') {
        const range = getDateRange(dateFilter);
        if (range.from) params.set('dateFrom', range.from);
        if (range.to) params.set('dateTo', range.to);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/users/${user.id}/donations?${params}`);
      const data = await res.json();
      
      if (data.success) {
        if (append) {
          setDonations(prev => [...prev, ...data.data]);
        } else {
          setDonations(data.data);
        }
        setTotalCount(data.pagination?.total || data.data.length);
        setHasMore(data.pagination?.hasMore || false);
        setOffset(newOffset);
      }
    } catch (e) {
      console.error('Failed to fetch donations:', e);
      toast.error('Gagal memuat riwayat donasi');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, dateFilter, statusFilter, customDateFrom, customDateTo]);

  // Re-fetch when filters change
  useEffect(() => {
    if (user) {
      fetchDonations(0, false);
    }
  }, [user, dateFilter, statusFilter, customDateFrom, customDateTo]);

  // ✅ Validate custom date range (max 7 days)
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
      if (diff > 7) {
        toast.error('Rentang maksimal 7 hari. Silakan perkecil tanggal.');
        return;
      }
      if (diff < 0) {
        toast.error('Tanggal akhir harus setelah tanggal awal.');
        return;
      }
    }
    setCustomDateTo(val);
  };

  const handleLoadMore = () => {
    const nextOffset = offset + ITEMS_PER_PAGE;
    fetchDonations(nextOffset, true);
  };

  const clearFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  const hasActiveFilters = dateFilter !== 'all' || statusFilter !== 'all';

  const handleSimulateSuccess = async (externalId) => {
    try {
      const res = await fetch('/api/debug/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donasi berhasil disimulasikan sukses!');
        setDonations(prev => prev.map(d =>
          d.externalId === externalId ? { ...d, status: 'paid' } : d
        ));
      } else {
        toast.error('Gagal simulasi: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server debug');
    }
  };

  if (!user && !loading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Silakan Login</h1>
        <p className="text-muted-foreground mb-6">Anda perlu login untuk melihat riwayat donasi.</p>
        <Link href="/login?redirect=/donations">
          <Button>Login Sekarang</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Donasi Saya</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} transaksi ditemukan
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-xl transition-all",
              showFilters && "bg-emerald-50 border-emerald-200 text-emerald-600"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </Button>
        </div>

        {/* ✅ Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <Card className="border-none shadow-md rounded-2xl">
              <CardContent className="p-4 space-y-4">
                {/* Date Filter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Rentang Waktu
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DATE_FILTERS.map(f => (
                      <Badge
                        key={f.key}
                        className={cn(
                          "cursor-pointer py-1.5 px-3 rounded-lg text-xs transition-all",
                          dateFilter === f.key
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        onClick={() => setDateFilter(f.key)}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>

                  {/* Custom Date Inputs */}
                  {dateFilter === 'custom' && (
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Dari</label>
                        <input
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => handleCustomDateFrom(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Sampai</label>
                        <input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => handleCustomDateTo(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                  {dateFilter === 'custom' && (
                    <p className="text-[10px] text-muted-foreground mt-1">⚠️ Maksimal rentang 7 hari</p>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Semua' },
                      { key: 'paid', label: 'Sukses' },
                      { key: 'pending', label: 'Pending' },
                    ].map(s => (
                      <Badge
                        key={s.key}
                        className={cn(
                          "cursor-pointer py-1.5 px-3 rounded-lg text-xs transition-all",
                          statusFilter === s.key
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        onClick={() => setStatusFilter(s.key)}
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="text-xs w-full" onClick={clearFilters}>
                    <X className="w-3 h-3 mr-1" /> Reset Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active filter badges */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dateFilter !== 'all' && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {DATE_FILTERS.find(f => f.key === dateFilter)?.label}
                {dateFilter === 'custom' && customDateFrom && ` (${customDateFrom})`}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setDateFilter('all')} />
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {statusFilter === 'paid' ? 'Sukses' : 'Pending'}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Memuat riwayat donasi...</span>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? 'Tidak Ada Hasil' : 'Belum Ada Donasi'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Tidak ada donasi yang sesuai dengan filter. Coba ubah filter.'
                : 'Mulai berbagi kebaikan dengan berdonasi'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>Reset Filter</Button>
            ) : (
              <Link href="/">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Jelajahi Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/campaign/${donation.campaignSlug || donation.campaignId}`}
                          className="font-semibold hover:text-emerald-600 transition-colors line-clamp-2 text-sm"
                        >
                          {donation.campaignTitle}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(donation.date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        {donation.status === 'paid' ? (
                          <Badge variant="outline" className="mt-1 border-emerald-500 text-emerald-600 text-[10px]">
                            <CheckCircle className="w-3 h-3 mr-1" /> Sukses
                          </Badge>
                        ) : donation.status === 'pending' ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-600 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Menunggu
                            </Badge>
                            {donation.paymentUrl && (
                              <a href={donation.paymentUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="h-6 text-[10px] border-emerald-500 text-emerald-600">
                                  Bayar
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 text-[9px] text-gray-400 hover:text-emerald-600"
                              onClick={() => handleSimulateSuccess(donation.externalId || donation.invoiceId?.replace('SPC-', 'DON-'))}
                            >
                              <Zap className="w-2.5 h-2.5 mr-0.5" /> Simulasi
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="destructive" className="mt-1 text-[10px]">
                            {donation.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* ✅ Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="rounded-xl px-8 h-10 border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memuat...
                    </>
                  ) : (
                    `Muat Lebih Banyak (${donations.length}/${totalCount})`
                  )}
                </Button>
              </div>
            )}

            {/* Summary */}
            <div className="text-center pt-4 pb-2">
              <p className="text-sm text-muted-foreground">
                Total donasi sukses: <strong className="text-emerald-600">
                  {formatCurrency(
                    donations.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0)
                  )}
                </strong>
                {hasMore && <span className="text-xs block mt-1">(dari {donations.length} transaksi yang dimuat)</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

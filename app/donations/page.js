'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MyDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/users/${user.id}/donations`);
            const data = await res.json();
            if (data.success) {
                setDonations(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch donations:', e);
        } finally {
            setLoading(false);
        }
    };
    
    fetchDonations();
  }, [user]);

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
            // Refresh list
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

  if (loading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Memuat riwayat donasi...</span>
        </div>
    );
  }

  if (!user) {
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
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Donasi Saya</h1>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Belum Ada Donasi</h2>
            <p className="text-muted-foreground mb-4">
              Mulai berbagi kebaikan dengan berdonasi
            </p>
            <Link href="/">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                Jelajahi Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/campaign/${donation.campaignSlug || donation.campaignId}`} // Prefer slug if available
                          className="font-semibold hover:text-emerald-600 transition-colors line-clamp-2"
                        >
                          {donation.campaignTitle}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(donation.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        {donation.status === 'paid' ? (
                            <Badge
                            variant="outline"
                            className="mt-1 border-emerald-500 text-emerald-600"
                            >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sukses
                            </Badge>
                        ) : donation.status === 'pending' ? (
                            <div className="flex flex-col items-end">
                                <Badge
                                variant="outline"
                                className="mt-1 border-yellow-500 text-yellow-600 mb-2"
                                >
                                <Clock className="w-3 h-3 mr-1" />
                                Menunggu
                                </Badge>
                                {donation.paymentUrl && (
                                    <a href={donation.paymentUrl} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                                            Bayar
                                        </Button>
                                    </a>
                                )}
                                {/* Debug Button for Localhost */}
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 text-[10px] text-gray-400 mt-1 hover:text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => handleSimulateSuccess(donation.externalId || donation.invoiceId?.replace('SPC-', 'DON-'))} // Fallback logic just in case
                                >
                                    <Zap className="w-3 h-3 mr-1" />
                                    Simulasi Sukses
                                </Button>
                            </div>
                        ) : (
                            <Badge variant="destructive" className="mt-1">
                                {donation.status}
                            </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Total donasi sukses: <strong className="text-emerald-600">
                  {formatCurrency(
                      donations
                        .filter(d => d.status === 'paid')
                        .reduce((sum, d) => sum + d.amount, 0)
                  )}
                </strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

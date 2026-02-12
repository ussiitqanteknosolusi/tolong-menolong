'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donation');
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    if (donationId) {
      // Fetch donation details
      fetch(`/api/donations/${donationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDonation(data.data);
          }
        })
        .catch(console.error);
    }
  }, [donationId]);

  const handleSimulateSuccess = async () => {
    if (!donation) return;
    setLoading(true);
    try {
        const payload = {
            order: { invoice_number: donation.xendit_external_id },
            transaction: { status: 'SUCCESS' }
        };
        
        await fetch('/api/webhook/doku', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Refresh data
        const res = await fetch(`/api/donations/${donationId}`);
        const data = await res.json();
        if (data.success) setDonation(data.data);
        
    } catch (e) {
        console.error('Simulation failed', e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-emerald-50 to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
            <p className="text-muted-foreground mb-6">
              Terima kasih atas kebaikan Anda. Semoga menjadi ladang pahala.
            </p>

            {donation && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Donasi</span>
                  <span className="text-sm font-mono">{donation.xendit_external_id || donation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-bold ${
                      donation.status === 'paid' ? 'text-emerald-600' : 
                      donation.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {donation.status === 'paid' ? 'LUNAS' : donation.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nominal</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Rp {Number(donation.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Dev Simulation Button */}
            {process.env.NODE_ENV === 'development' && donation?.status === 'pending' && (
                <div className="mb-4 p-4 border border-yellow-200 bg-yellow-50 rounded text-sm">
                    <p className="mb-2 text-yellow-800 font-medium">Mode Pengembangan (Localhost)</p>
                    <Button 
                        onClick={handleSimulateSuccess} 
                        disabled={loading}
                        variant="warning"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        {loading ? 'Memproses...' : 'Simulasi Webhook Sukses (DOKU)'}
                    </Button>
                </div>
            )}

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link href="/donations" className="block">
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Lihat Donasi Saya
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

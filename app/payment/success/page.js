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
                  <span className="text-sm font-mono">{donation.externalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Campaign</span>
                  <span className="text-sm font-medium">{donation.campaignTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nominal</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Rp {donation.amount?.toLocaleString('id-ID')}
                  </span>
                </div>
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

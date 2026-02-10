'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donation');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-50 to-background">
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
              className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-red-600" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
            <p className="text-muted-foreground mb-6">
              Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
            </p>

            {donationId && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  ID Transaksi: <span className="font-mono">{donationId}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <Button variant="ghost" className="w-full text-muted-foreground">
                <HelpCircle className="w-4 h-4 mr-2" />
                Butuh Bantuan?
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

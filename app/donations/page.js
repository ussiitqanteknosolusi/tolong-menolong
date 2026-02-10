'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { myDonations, formatCurrency } from '@/lib/mock-data';

export default function MyDonationsPage() {
  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Donasi Saya</h1>

        {myDonations.length === 0 ? (
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
            {myDonations.map((donation, index) => (
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
                          href={`/campaign/${donation.campaignId}`}
                          className="font-semibold hover:text-emerald-600 transition-colors line-clamp-2"
                        >
                          {donation.campaignTitle}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(donation.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 border-emerald-500 text-emerald-600"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sukses
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Total donasi: <strong className="text-emerald-600">
                  {formatCurrency(myDonations.reduce((sum, d) => sum + d.amount, 0))}
                </strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

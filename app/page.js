'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import CategoryGrid from '@/components/category-grid';
import CampaignCard from '@/components/campaign-card';
import { campaigns, formatCurrency } from '@/lib/mock-data';

const stats = [
  { label: 'Total Donasi', value: 'Rp 125 M+', icon: TrendingUp },
  { label: 'Campaign Sukses', value: '15,000+', icon: Shield },
  { label: 'Donatur Aktif', value: '2.5 Juta+', icon: Clock },
];

export default function HomePage() {
  return (
    <main className="pb-20 md:pb-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats */}
      <section className="py-6 border-b">
        <div className="container">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-emerald-600">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryGrid />

      {/* Campaign Listing */}
      <section className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Campaign Populer</h2>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-emerald-600">
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Mulai Galang Dana Sekarang
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Buat campaign dalam hitungan menit dan mulai kumpulkan donasi untuk
              tujuan baikmu.
            </p>
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-white/90"
            >
              Mulai Galang Dana
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">100% Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Transparan</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Pencairan Cepat</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

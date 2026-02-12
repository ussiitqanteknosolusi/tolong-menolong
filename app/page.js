'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import CategoryGrid from '@/components/category-grid';
import CampaignCard from '@/components/campaign-card';
import { formatCurrency } from '@/lib/mock-data';

const defaultStats = [
  { label: 'Total Donasi', value: 'Rp 125 M+', icon: TrendingUp },
  { label: 'Campaign Sukses', value: '15,000+', icon: Shield },
  { label: 'Donatur Aktif', value: '2.5 Juta+', icon: Clock },
];

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, statsRes, articlesRes] = await Promise.all([
             fetch('/api/campaigns?limit=6&status=active'),
             fetch('/api/stats'),
             fetch('/api/articles?limit=3')
        ]);
        
        const campaignsData = await campaignsRes.json();
        const statsData = await statsRes.json();
        const articlesData = await articlesRes.json();

        if (campaignsData.success) {
            setCampaigns(campaignsData.data);
        }
        
        if (articlesData.success) {
            setArticles(articlesData.data);
        }

        if (statsData.success) {
            const s = statsData.data;
             setStats([
                { label: 'Total Donasi', value: formatCurrency(s.totalDonations), icon: TrendingUp },
                { label: 'Campaign Aktif', value: s.activeCampaigns + '+', icon: Shield },
                { label: 'Donatur Terdaftar', value: s.totalUsers + '+', icon: Clock },
             ]);
        }

      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

          {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {campaigns.length > 0 ? (
                    campaigns.map((campaign, index) => (
                    <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground py-8">
                        Belum ada campaign yang tersedia.
                    </p>
                )}
            </div>
          )}
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-xl md:text-2xl font-bold">Kabar & Cerita Terbaru</h2>
                <p className="text-muted-foreground text-sm mt-1">Inspirasi dan update dari #OrangBaik</p>
             </div>
             <Link href="/articles">
               <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50">
                 Semua Artikel
                 <ArrowRight className="w-4 h-4 ml-1" />
               </Button>
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.length > 0 ? (
                articles.slice(0, 3).map((article) => (
                  <Link href={`/articles/${article.slug}`} key={article.id} className="group">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                             {article.image_url ? (
                                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-300">
                                    <span className="font-bold text-3xl opacity-30">BP</span>
                                </div>
                             )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                {article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                            </p>
                            <span className="text-emerald-600 text-sm font-medium inline-flex items-center">
                                Baca Selengkapnya <ArrowRight className="w-3 h-3 ml-1" />
                            </span>
                        </div>
                    </div>
                  </Link>
                ))
            ) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                    Belum ada artikel terbaru.
                </div>
            )}
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
            <Link href="/campaigns/new">
                <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-white/90"
                >
                Mulai Galang Dana
                <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
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

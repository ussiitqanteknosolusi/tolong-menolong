'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/mock-data';

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/campaigns?limit=5&status=active');
        const data = await res.json();
        if (data.success) {
            setCampaigns(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch hero campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  const nextSlide = () => {
    if (campaigns.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const prevSlide = () => {
    if (campaigns.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  if (loading) {
    return (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 animate-pulse flex items-center justify-center">
            <span className="sr-only">Loading...</span>
        </div>
    );
  }

  if (campaigns.length === 0) return null;

  const campaign = campaigns[currentIndex];
  // Calculate progress safely
  const progress = campaign.targetAmount > 0 
      ? Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100) 
      : 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-background">
      <div className="container py-6 md:py-12">
        <div className="relative rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]"
            >
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <Badge className="mb-3 bg-red-500 hover:bg-red-600">Mendesak</Badge>
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
                    {campaign.title}
                  </h1>
                  <p className="text-sm md:text-base text-white/80 mb-4 flex items-center gap-1">
                    {campaign.organizer.name}
                    {campaign.organizer.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </p>

                  <div className="space-y-2 mb-4">
                    <Progress value={progress} className="h-2 bg-white/20" />
                    <div className="flex justify-between text-sm text-white">
                      <span className="font-semibold">
                        Terkumpul {formatCurrency(campaign.currentAmount)}
                      </span>
                      <span className="text-white/70">{progress}%</span>
                    </div>
                  </div>

                  <Link href={`/campaign/${campaign.slug}`}>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      Donasi Sekarang
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex gap-2">
            {campaigns.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-emerald-500'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

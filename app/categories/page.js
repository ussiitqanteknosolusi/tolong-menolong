'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, LayoutGrid, ArrowRight, Loader2,
  Heart, GraduationCap, Home, HeartPulse, 
  Baby, Mosque, Globe, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Icon mapper for categories
const iconMap = {
  'Heart': Heart,
  'School': GraduationCap,
  'Home': Home,
  'Hospital': HeartPulse,
  'Baby': Baby,
  'Mosque': Mosque,
  'Globe': Globe,
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategori Campaign</h1>
            <p className="text-muted-foreground text-sm">Temukan berbagai kebaikan berdasarkan bidang yang Anda peduli</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-muted-foreground">Memuat kategori...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = iconMap[cat.icon] || Heart;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/category/${cat.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                          cat.color || "bg-emerald-50 text-emerald-600"
                        )}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {cat.campaignCount || 0} Campaign
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-emerald-600 rounded-3xl text-white overflow-hidden relative"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Heart className="w-10 h-10 fill-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold mb-2">Belum menemukan yang dicari?</h3>
               <p className="text-emerald-50 text-sm mb-4 md:mb-0">
                 Anda bisa melihat semua campaign aktif yang sedang berlangsung dan mulai berbagi kebaikan hari ini.
               </p>
            </div>
            <Link href="/campaigns">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl px-8 font-bold h-12">
                Jelajah Semua
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {/* Abstract blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </motion.div>
      </div>
    </main>
  );
}

// Inline CN util to ensure it works without external dependencies if needed
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

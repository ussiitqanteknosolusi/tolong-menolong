'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Heart, 
  GraduationCap, 
  Home, 
  HeartPulse, 
  Baby, 
  Globe,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import CampaignCard from '@/components/campaign-card';
import { Button } from '@/components/ui/button';

// Icon mapper for categories
const iconMap = {
  'Heart': Heart,
  'School': GraduationCap,
  'Home': Home,
  'Hospital': HeartPulse,
  'Baby': Baby,
  'Mosque': Home,
  'Globe': Globe,
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryId = params.id;
        
        // Fetch categories to find current one and its metadata
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        
        if (catData.success) {
          const currentCat = catData.data.find(c => c.id === categoryId || c.slug === categoryId);
          setCategory(currentCat);
          
          // Fetch campaigns for this category
          const campRes = await fetch(`/api/campaigns?status=active&category=${categoryId}`);
          const campData = await campRes.json();
          
          if (campData.success) {
            // Further filter if needed, although API should handle it
            setCampaigns(campData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-muted-foreground animate-pulse">Memuat koleksi kebaikan...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Kategori tidak ditemukan</h1>
        <p className="text-muted-foreground mb-8">Maaf, kategori yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/categories">
          <Button variant="outline" className="rounded-xl px-8">Lihat Semua Kategori</Button>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[category.icon] || Heart;

  return (
    <main className="pb-20 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b py-10 mb-8 shadow-sm">
        <div className="container">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categories" className="hover:text-emerald-600 transition-colors">
              Kategori
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-600">{category.name}</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center gap-6"
          >
            <div className={cn(
               "w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner shrink-0",
               category.color || "bg-emerald-50 text-emerald-600"
            )}>
              <Icon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Menampilkan semua campaign aktif dalam kategori {category.name.toLowerCase()}. 
                Yuk, bantu mereka sekarang!
              </p>
            </div>
            <div className="flex flex-col gap-1 items-center md:items-end justify-center px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0">
               <p className="text-2xl font-bold text-emerald-600">{campaigns.length}</p>
               <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Campaign Aktif</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="container">
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <HeartPulse className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada campaign</h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Saat ini belum ada campaign aktif di kategori {category.name}. Jadilah yang pertama memulai kebaikan di sini!
            </p>
            <div className="flex gap-3 justify-center">
                <Link href="/campaigns/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-emerald-200/50">
                    Mulai Galang Dana
                  </Button>
                </Link>
                <Link href="/campaigns">
                  <Button variant="outline" className="rounded-xl px-8 h-12 font-bold border-gray-200">
                    Lihat Campaign Lain
                  </Button>
                </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      {campaigns.length > 0 && (
         <div className="container mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-4 italic">"Sekecil apapun bantuanmu, sangat berarti bagi mereka."</p>
            <Button variant="ghost" onClick={() => router.back()} className="text-emerald-600 hover:bg-emerald-50 gap-2">
               <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
         </div>
      )}
    </main>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

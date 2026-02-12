'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, SlidersHorizontal, ArrowLeft, 
  Loader2, X, ChevronDown, LayoutGrid, List
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import CampaignCard from '@/components/campaign-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function CampaignsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 9;

  const fetchCampaigns = async (pageNum = 0, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const offset = pageNum * ITEMS_PER_PAGE;
      const res = await fetch(`/api/campaigns?status=active&limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await res.json();
      
      if (data.success) {
        if (isLoadMore) {
          setCampaigns(prev => [...prev, ...data.data]);
        } else {
          setCampaigns(data.data);
        }
        setHasMore(data.data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch categories once
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
      } catch (err) {
        console.error('Cat fetch fail', err);
      }
      
      // Fetch first page of campaigns
      fetchCampaigns(0);
    };
    
    fetchInitialData();
  }, []);

  // Handle filter changes - reset pagination
  useEffect(() => {
    setPage(0);
    fetchCampaigns(0);
  }, [selectedCategory, sortBy]); // We don't trigger auto-fetch on searchQuery to avoid too many requests

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCampaigns(nextPage, true);
  };

  // Sync category state with URL param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'most_funded') return b.currentAmount - a.currentAmount;
    if (sortBy === 'urgent') return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPage(0);
    router.push('/campaigns');
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-14 z-20">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari campaign atau penggalang dana..."
                className="pl-10 h-11 bg-gray-50 border-none shadow-sm focus-visible:ring-emerald-500 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className={cn(
                  "h-11 rounded-xl gap-2 transition-all",
                  showFilters && "bg-emerald-50 border-emerald-200 text-emerald-600"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
                {(selectedCategory !== 'all' || sortBy !== 'newest') && (
                  <Badge className="ml-1 bg-emerald-500 text-white h-5 w-5 flex items-center justify-center p-0 rounded-full">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <Card className="border-none shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Filter & Urutkan</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                      Reset Semua
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Kategori</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          className={cn(
                            "cursor-pointer py-2 px-4 rounded-lg text-sm transition-all",
                            selectedCategory === 'all' 
                              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          onClick={() => setSelectedCategory('all')}
                        >
                          Semua
                        </Badge>
                        {categories.map(cat => (
                          <Badge 
                            key={cat.id}
                            className={cn(
                              "cursor-pointer py-2 px-4 rounded-lg text-sm transition-all",
                              selectedCategory === cat.id || selectedCategory === cat.name
                                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                            onClick={() => setSelectedCategory(cat.id)}
                          >
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Urutkan Berdasarkan</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={sortBy === 'newest' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy('newest')}
                          className={cn("rounded-lg", sortBy === 'newest' && "bg-emerald-600")}
                        >
                          Terbaru
                        </Button>
                        <Button 
                          variant={sortBy === 'most_funded' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy('most_funded')}
                          className={cn("rounded-lg", sortBy === 'most_funded' && "bg-emerald-600")}
                        >
                          Terbesar
                        </Button>
                        <Button 
                          variant={sortBy === 'urgent' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy('urgent')}
                          className={cn("rounded-lg", sortBy === 'urgent' && "bg-emerald-600")}
                        >
                          Mendesak
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">
            {loading ? 'Mencari...' : `${filteredCampaigns.length} Campaign ditemukan`}
          </h2>
          {selectedCategory !== 'all' && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Kategori: {categories.find(c => c.id === selectedCategory || c.name === selectedCategory)?.name || selectedCategory}
              <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSelectedCategory('all')} />
            </Badge>
          )}
        </div>

        {/* Results */}
        {loading && page === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-muted-foreground animate-pulse">Memuat campaign terbaik untuk Anda...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign, idx) => (
                <CampaignCard key={`${campaign.id}-${idx}`} campaign={campaign} index={idx % ITEMS_PER_PAGE} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-12 text-center">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  variant="outline"
                  className="rounded-xl px-12 h-12 font-bold border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    "Muat Lebih Banyak"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Coba gunakan kata kunci lain atau ubah filter untuk menemukan campaign yang Anda cari.
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8">
              Lihat Semua Campaign
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

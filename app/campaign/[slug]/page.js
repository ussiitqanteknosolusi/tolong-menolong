'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Clock,
  Users,
  Share2,
  Heart,
  ChevronLeft,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonationModal from '@/components/donation-modal';

// Helper functions locally defined to replace mock-data dependency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getProgressPercentage(current, target) {
  if (!target) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.round(percentage), 100);
}

export default function CampaignDetailPage() {
  const params = useParams(); // params.slug
  const router = useRouter();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [donors, setDonors] = useState([]); // Donors list state

  const handleDonateClick = () => {
    // Allow donation without login? User preference.
    // Code in Step 1094 required login.
    // Usually crowdfunding allows guest donations.
    // I will keep logic consistent with previous code for now, but maybe relax it?
    // Let's stick to auth requirement as per previous code.
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk berdonasi');
      router.push(`/login?redirect=/campaign/${params.slug}`);
      return;
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchCampaign = async () => {
        try {
            // Check if slug exists
            if (!params.slug) return;

            const res = await fetch(`/api/campaigns/${params.slug}`);
            const data = await res.json();
            
            if (data.success) {
                setCampaign({
                    ...data.data,
                    // Ensure numeric values for helpers
                    currentAmount: parseFloat(data.data.currentAmount || 0),
                    targetAmount: parseFloat(data.data.targetAmount || 0),
                    // If backend return image_url, map to image
                    image: data.data.image || data.data.image_url || '/placeholder.jpg' 
                });
                
                // Trigger animation
                setTimeout(() => setShowProgress(true), 100);
            } else {
                toast.error('Gagal memuat campaign: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('Fetch campaign error:', e);
            toast.error('Gagal memuat campaign');
        } finally {
            setLoading(false);
        }
    };

    fetchCampaign();
  }, [params.slug]);

  useEffect(() => {
    const fetchDonors = async () => {
        if (!campaign?.id) return;
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}/donations`);
            const data = await res.json();
            if (data.success) {
                setDonors(data.data);
            }
        } catch (e) {
            console.error('Fetch donors error:', e);
        }
    };
    
    if (campaign?.id) {
        fetchDonors();
    }
  }, [campaign?.id]);

  const handleShare = async () => {
    const shareData = {
      title: campaign.title,
      text: `Bantu ${campaign.title} di BerbagiPath!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link berhasil disalin!');
    }
  };

  const shareToSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Bantu ${campaign.title} di BerbagiPath!`);
    
    let shareUrl = '';
    if (platform === 'whatsapp') {
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
    } else if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    }
    
    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-muted-foreground">Memuat Campaign...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Campaign tidak ditemukan.</p>
        <Link href="/">
             <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const progress = getProgressPercentage(campaign.currentAmount, campaign.targetAmount);

  return (
    <>
      <main className="pb-24 md:pb-8">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background border-b md:hidden">
          <div className="flex items-center gap-3 p-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold text-sm line-clamp-1 flex-1">
              {campaign.title}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {campaign.isUrgent && (
            <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
              Mendesak
            </Badge>
          )}
        </div>

        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Organizer */}
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <h1 className="text-xl md:text-2xl font-bold flex-1">
                    {campaign.title}
                  </h1>
                  {campaign.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={campaign.organizer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${campaign.organizer?.name}`} />
                    <AvatarFallback>
                      {campaign.organizer?.name?.charAt(0) || 'O'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {campaign.organizer?.name || 'Organizer'}
                      {campaign.organizer?.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Penggalang Dana
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:block p-6 bg-card rounded-xl border shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground">Terkumpul</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(campaign.currentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="font-medium">
                        {formatCurrency(campaign.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={showProgress ? progress : 0}
                      className="h-3 transition-all duration-1000"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-emerald-600">
                        {progress}% tercapai
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{campaign.daysLeft}</strong> hari lagi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{Number(campaign.donorCount || 0).toLocaleString('id-ID')}</strong> donatur
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-lg"
                    onClick={handleDonateClick}
                  >
                    <Heart className="w-5 h-5 mr-2 fill-white" />
                    Donasi Sekarang
                  </Button>
                </div>
              </motion.div>

              {/* Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="story">Cerita</TabsTrigger>
                  <TabsTrigger value="donors">
                    Donatur ({Number(campaign.donorCount || 0)})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="mt-4">
                  <div
                    className="prose prose-sm max-w-none w-full break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: campaign.story || campaign.description }} 
                  />
                </TabsContent>

                <TabsContent value="donors" className="mt-4">
                  <div className="space-y-4">
                    {donors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Belum ada donatur. Jadilah yang pertama!
                        </div>
                    ) : (
                        donors.map((donor, idx) => (
                           <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-4 p-4 border rounded-xl bg-card/50 hover:bg-card transition-colors"
                          >
                             <Avatar className="w-10 h-10 border border-gray-100">
                                <AvatarImage src={donor.avatar} className="object-cover" />
                                <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                    {donor.name?.charAt(0) || 'D'}
                                </AvatarFallback>
                             </Avatar>
                             <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                       <p className="font-semibold text-sm text-gray-900 line-clamp-1">{donor.name}</p>
                                       <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          {new Date(donor.createdAt).toLocaleDateString('id-ID', {
                                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                          })}
                                       </p>
                                    </div>
                                    <p className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                                        {formatCurrency(donor.amount)}
                                    </p>
                                </div>
                                {donor.message && (
                                    <div className="mt-2 text-sm text-gray-600 bg-emerald-50/50 p-3 rounded-lg rounded-tl-none">
                                       "{donor.message}"
                                    </div>
                                )}
                             </div>
                          </motion.div>
                        ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-semibold mb-3">Bagikan Campaign</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => shareToSocial('whatsapp')}>
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => shareToSocial('facebook')}>
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => shareToSocial('twitter')}>
                      Twitter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Progress & CTA */}
        <div className="lg:hidden">
          <div className="container py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground">Terkumpul</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(campaign.currentAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(campaign.targetAmount)}
                  </p>
                </div>
              </div>
              <Progress
                value={showProgress ? progress : 0}
                className="h-2 transition-all duration-1000"
              />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">{campaign.daysLeft}</strong> hari lagi
                </span>
                <span>
                  <strong className="text-foreground">{Number(campaign.donorCount || 0).toLocaleString('id-ID')}</strong> donatur
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-background border-t md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-10"
            onClick={handleDonateClick}
          >
            <Heart className="w-5 h-5 mr-2 fill-white" />
            Donasi Sekarang
          </Button>
        </div>
      </main>

      {/* Donation Modal */}
      {campaign && (
          <DonationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            campaign={campaign}
            user={user}
          />
      )}
    </>
  );
}



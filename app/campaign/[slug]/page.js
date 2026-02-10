'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonationModal from '@/components/donation-modal';
import {
  getCampaignBySlug,
  formatCurrency,
  getProgressPercentage,
  recentDonors,
} from '@/lib/mock-data';

export default function CampaignDetailPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const campaignData = getCampaignBySlug(params.slug);
    setCampaign(campaignData);
    // Trigger progress animation after mount
    setTimeout(() => setShowProgress(true), 100);
  }, [params.slug]);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Memuat...</div>
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
            <Button variant="ghost" size="icon">
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
                    <AvatarImage src={campaign.organizer.avatar} />
                    <AvatarFallback>
                      {campaign.organizer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {campaign.organizer.name}
                      {campaign.organizer.isVerified && (
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
                        <strong>{campaign.donorCount.toLocaleString('id-ID')}</strong> donatur
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-lg"
                    onClick={() => setIsModalOpen(true)}
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
                    Donatur ({campaign.donorCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="mt-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: campaign.story }}
                  />
                </TabsContent>

                <TabsContent value="donors" className="mt-4">
                  <div className="space-y-4">
                    {recentDonors.map((donor, idx) => (
                      <motion.div
                        key={donor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-emerald-100 text-emerald-600">
                            {donor.isAnonymous ? 'H' : donor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">
                              {donor.isAnonymous ? 'Hamba Allah' : donor.name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {donor.time}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-600 font-semibold">
                            {formatCurrency(donor.amount)}
                          </p>
                          {donor.message && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                              <MessageCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                              {donor.message}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
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
                    <Button variant="outline" size="sm" className="flex-1">
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
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
                  <strong className="text-foreground">{campaign.donorCount.toLocaleString('id-ID')}</strong> donatur
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t md:hidden z-40">
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-12"
            onClick={() => setIsModalOpen(true)}
          >
            <Heart className="w-5 h-5 mr-2 fill-white" />
            Donasi Sekarang
          </Button>
        </div>
      </main>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
      />
    </>
  );
}

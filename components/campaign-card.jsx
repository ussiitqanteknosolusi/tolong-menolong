'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getProgressPercentage } from '@/lib/mock-data';

export default function CampaignCard({ campaign, index = 0 }) {
  const progress = getProgressPercentage(campaign.currentAmount, campaign.targetAmount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/campaign/${campaign.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {campaign.isUrgent && (
              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                Mendesak
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1 leading-tight">
                {campaign.title}
              </h3>
              {campaign.isVerified && (
                <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              {campaign.organizer.name}
              {campaign.organizer.isVerified && (
                <BadgeCheck className="w-3 h-3 text-emerald-500" />
              )}
            </p>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(campaign.currentAmount)}
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{campaign.daysLeft} hari lagi</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{campaign.donorCount.toLocaleString('id-ID')} donatur</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

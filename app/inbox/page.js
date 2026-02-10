'use client';

import { motion } from 'framer-motion';
import { Bell, Heart, Tag, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notifications } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const iconMap = {
  update: Bell,
  thankyou: Heart,
  promo: Tag,
};

export default function InboxPage() {
  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <Button variant="ghost" size="sm" className="text-emerald-600">
            <CheckCheck className="w-4 h-4 mr-1" />
            Tandai Semua Dibaca
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((notif, index) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'transition-colors cursor-pointer hover:bg-muted/50',
                    !notif.isRead && 'bg-emerald-50 border-emerald-200'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          notif.type === 'update' && 'bg-blue-100 text-blue-600',
                          notif.type === 'thankyou' && 'bg-emerald-100 text-emerald-600',
                          notif.type === 'promo' && 'bg-orange-100 text-orange-600'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm">{notif.title}</h3>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

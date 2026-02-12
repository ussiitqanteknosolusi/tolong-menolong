'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, Tag, CheckCheck, Loader2, Info, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

const iconMap = {
  system: Bell,
  donation: Heart,
  promo: Tag,
  info: Info
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
        router.push('/login');
        return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/notifications`);
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, authLoading, router]);

  const markAsRead = async (id) => {
    try {
        await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
        console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
      // Optimistic update
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));

      // In a real app, you might want a batch update endpoint
      await Promise.all(unreadIds.map(id => 
          fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      ));
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
      );
  }

  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600"
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.is_read)}
            >
                <CheckCheck className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Tandai Semua Dibaca</span>
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={async () => {
                    const confirm = window.confirm('Hapus semua notifikasi yang sudah dibaca?');
                    if (!confirm) return;
                    
                    setNotifications(prev => prev.filter(n => !n.is_read));
                    try {
                        await fetch(`/api/users/${user.id}/notifications/read`, { method: 'DELETE' });
                    } catch (err) {
                        console.error('Failed to clear notifications', err);
                    }
                }}
                disabled={!notifications.some(n => n.is_read)}
            >
                <Trash2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Bersihkan</span>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                  Belum ada notifikasi
              </div>
          ) : (
              notifications.map((notif, index) => {
                const Icon = iconMap[notif.type] || Bell;
                const isRead = !!notif.is_read;
                
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        'transition-colors cursor-pointer hover:bg-muted/50 border-none shadow-sm',
                        !isRead ? 'bg-emerald-50/50' : 'bg-white'
                      )}
                      onClick={() => !isRead && markAsRead(notif.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                              notif.type === 'system' && 'bg-blue-100 text-blue-600',
                              notif.type === 'donation' && 'bg-emerald-100 text-emerald-600',
                              notif.type === 'promo' && 'bg-orange-100 text-orange-600',
                              !['system', 'donation', 'promo'].includes(notif.type) && 'bg-gray-100 text-gray-600'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className={cn("text-sm font-semibold", !isRead ? "text-gray-900" : "text-gray-700")}>
                                {notif.title}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(notif.created_at)}
                              </span>
                            </div>
                            <p className={cn("text-sm leading-relaxed", !isRead ? "text-gray-800" : "text-muted-foreground")}>
                              {notif.message}
                            </p>
                          </div>
                          {!isRead && (
                            <div className="self-center">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block shadow-sm" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
          )}
        </div>
      </div>
    </main>
  );
}

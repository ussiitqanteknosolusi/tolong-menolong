'use client';

import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        if (data.success) {
            setNotifications(data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch admin notifications", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifs();
    // Poll every minute
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b bg-gray-50/50">
            <h4 className="font-semibold text-sm">Notifikasi</h4>
            <p className="text-xs text-muted-foreground">Tugas yang memerlukan tindakan Anda</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></span>
                Memuat...
            </div>
            ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">Tidak ada notifikasi baru</p>
                <p className="text-xs text-muted-foreground mt-1">Semua beres! Silakan nikmati kopi Anda ☕</p>
            </div>
            ) : (
                <div className="py-1">
                    {notifications.map((notif, idx) => (
                        <DropdownMenuItem key={idx} className="cursor-pointer p-0 focus:bg-gray-50" asChild>
                            <Link href={notif.href} className="flex items-start gap-3 p-3 w-full border-b last:border-0 hover:bg-gray-50 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notif.type === 'alert' ? 'bg-blue-100 text-blue-600' :
                                    notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {notif.type === 'alert' ? <Info className="w-4 h-4" /> : 
                                    notif.type === 'warning' ? <AlertCircle className="w-4 h-4" /> : 
                                    <Bell className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">ACTION REQUIRED</p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

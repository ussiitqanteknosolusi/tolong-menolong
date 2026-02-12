'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Heart, ChevronDown, User, Bell, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

export default function DesktopNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/users/${user.id}/notifications`);
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.data);
                    setUnreadCount(data.data.filter(n => !n.is_read).length);
                }
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };

        fetchNotifications();
        // Set an interval for simple polling (optional, for demo)
        const interval = setInterval(fetchNotifications, 30000); 
        return () => clearInterval(interval);
    }
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
        const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        if (res.ok) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setCategories(data.data);
            }
        })
        .catch(err => console.error('Failed to load categories', err));
  }, []);

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-emerald-100">
            <Image 
              src="/logo.png" 
              alt="BerbagiPath" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-xl text-emerald-600 hidden sm:inline">BerbagiPath</span>
        </Link>

        {/* Desktop Search & Nav */}
        <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari campaign atau penggalang dana..."
              className="pl-10 bg-muted/50"
            />
          </div>

          
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px] p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                     <h3 className="font-semibold text-sm">Notifikasi</h3>
                     {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} BARU
                        </span>
                     )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif.id}
                                className={cn(
                                    "p-4 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/50",
                                    !notif.is_read && "bg-emerald-50/50"
                                )}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "mt-1 w-2 h-2 rounded-full shrink-0",
                                        !notif.is_read ? "bg-emerald-500" : "bg-transparent"
                                    )} />
                                    <div className="space-y-1">
                                        <p className={cn("text-xs leading-none", !notif.is_read ? "font-bold text-gray-900" : "font-medium text-gray-600")}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60">
                                            {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                  </div>
                  <div className="p-3 border-t text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <Link href="/inbox" className="text-xs font-semibold text-emerald-600">
                        Lihat Semua Notifikasi
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/donations">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&mouth=smile&eyebrows=default`} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil Saya</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Button>
              </Link>
            </>
          )}
          
          <Link href="/campaigns/new">
            <Button className={user ? "bg-emerald-500 hover:bg-emerald-600 ml-2" : "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 ml-2"}>
               Galang Dana
            </Button>
          </Link>
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          isSearchOpen ? 'max-h-20 py-3 px-4 border-t' : 'max-h-0'
        )}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari campaign..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>
    </header>
  );
}

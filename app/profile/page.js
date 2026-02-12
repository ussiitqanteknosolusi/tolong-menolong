'use client';

import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Slider } from '@/components/ui/slider'; // If available or use input range
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  Bell,
  FileText,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Flag,
  Megaphone,
  DollarSign,
  LayoutDashboard,
  Wallet,
  AlarmClock,
  Repeat,
  Coins,
  Info,
  ShieldCheck,
  PiggyBank,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

const menuSections = [
  {
    title: 'Keuangan & Donasi',
    items: [
      { 
        icon: Wallet, 
        label: 'Kantong Donasimu', 
        href: '/wallet',
        isDynamic: true,
        valueColor: 'text-blue-500'
      },
      { 
        icon: Repeat, 
        label: 'Donasi Otomatis', 
        subLabel: 'Dukung galang dana pilihanmu tanpa putus',
        href: '/auto-donate',
        badge: 'BARU'
      },
      { icon: Coins, label: 'Saya menunaikan zakat', href: '/zakat' },
    ]
  },
  {
    title: 'Akun & Lainnya',
    items: [
      { icon: Settings, label: 'Pengaturan', href: '/settings' },
      { icon: FileText, label: 'Artikel & Berita', href: '/articles' },
      { icon: HelpCircle, label: 'Bantuan', href: '/help' },
      { icon: Info, label: 'Tentang BerbagiPath', href: '/about' },
      { icon: ShieldCheck, label: 'Syarat & Ketentuan', href: '/terms' },
    ]
  }
];

const legacyMenuItems = [
  { icon: Heart, label: 'Donasi Saya', href: '/donations' },
  { icon: Bell, label: 'Notifikasi', href: '/inbox' },
  { icon: Flag, label: 'Lapor Masalah', href: '/report' },
];

export default function ProfilePage() {
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Crop state
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropOpen(true);
      e.target.value = null;
    }
  };

  const handleSaveCrop = async () => {
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      
      const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
          // Update user profile in DB
          const updateRes = await fetch(`/api/users/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatar: uploadData.url })
          });

            if (updateRes.ok) {
                setProfile(prev => ({ 
                    ...(prev || user), 
                    avatar: uploadData.url, 
                    avatar_url: uploadData.url 
                }));
                // Update auth context so navbar avatar updates immediately
                updateUser({ avatar_url: uploadData.url });
                setIsCropOpen(false);
            }
      }
    } catch (err) {
        console.error('Upload failed', err);
    } finally {
        setIsUploading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      // If we're not loading and there's no user, just stop loading
      // and let the component render the login prompt
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
       try {
         const res = await fetch(`/api/users/${user.id}`);
         const data = await res.json();
         if (data.success) {
            setProfile(data.data);
         }
       } catch (error) {
         console.error('Failed to fetch profile', error);
       } finally {
         setLoading(false);
       }
    };

    fetchProfile();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Belum Masuk Akun</h1>
            <p className="text-muted-foreground mb-8">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat profil, donasi, dan riwayat transaksi.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/login?redirect=/profile')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold rounded-xl transition-all active:scale-95"
              >
                Masuk Sekarang
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/register')}
                className="w-full h-12 text-base font-semibold rounded-xl border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Daftar Akun Baru
              </Button>
            </div>
          </motion.div>
          <div className="mt-8">
            <Button variant="ghost" onClick={() => router.push('/')} className="text-gray-500 hover:text-emerald-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const displayUser = profile || user;
  const isOrganizer = displayUser.role === 'organizer' || displayUser.isVerified;

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-8 max-w-lg mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block cursor-pointer group" onClick={handleAvatarClick}>
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-sm group-hover:opacity-80 transition-opacity">
                <AvatarImage src={displayUser.avatar || displayUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.email}&mouth=smile&eyebrows=default`} />
                <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl">
                {displayUser.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-4 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">{displayUser.name}</h1>
          <p className="text-sm text-muted-foreground">{displayUser.email}</p>
          
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" size="sm" className="rounded-full px-6" onClick={handleAvatarClick}>
                Ganti Foto Profil
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x h-full">
                    <div className="p-3 md:p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col justify-center h-full">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-600 text-emerald-600">
                          {displayUser.donationCount || 0}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Donasi</p>
                    </div>
                    <div className="p-3 md:p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col justify-center h-full">
                        <p className="text-sm md:text-xl font-bold text-emerald-600 break-words leading-tight">
                          {formatCurrency(displayUser.totalDonations || 0)}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Total Nominal</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
               {/* Verification Item */}
               {displayUser.isVerified ? (
                    <div className="flex items-center gap-4 p-4 bg-emerald-50/50 border-b border-gray-100">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                             <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                             <p className="font-medium text-emerald-900">Akun Terverifikasi</p>
                             <p className="text-xs text-emerald-700">Organizer Terpercaya</p>
                        </div>
                    </div>
                ) : (
                    <Link href="/verify" className="flex items-center gap-4 p-4 hover:bg-yellow-50 transition-colors border-b border-gray-100 group">
                          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg group-hover:bg-yellow-200 transition-colors">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-yellow-900 transition-colors">Verifikasi Akun</p>
                              <p className="text-xs text-muted-foreground group-hover:text-yellow-700 transition-colors">
                                  Dapatkan fitur organizer & buat campaign
                              </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-yellow-400" />
                    </Link>
                )}

               {/* Organizer Section */}
               {isOrganizer && (
                   <>
                       <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                           Organizer Area
                       </div>
                       
                       <Link
                          href="/dashboard"
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <span className="flex-1 font-medium text-gray-700">Galang Dana Saya</span>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        
                        <Link
                          href="/withdrawals"
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <span className="flex-1 font-medium text-gray-700">Pencairan Dana</span>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                   </>
               )}
               
                {/* New Menu Sections */}
                {menuSections.map((section, sIdx) => (
                  <div key={section.title}>
                    <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {section.title}
                    </div>
                    {section.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-gray-100 transition-colors">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                    {item.badge && (
                                        <Badge className="bg-blue-100 text-blue-600 border-none text-[10px] py-0 px-1.5 h-4">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>
                                {item.subLabel && (
                                    <p className="text-xs text-muted-foreground">{item.subLabel}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {item.value && (
                                    <span className={cn("font-bold text-sm", item.valueColor || "text-gray-900")}>
                                        {item.value}
                                    </span>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                          </Link>
                          {iIdx < section.items.length - 1 && <Separator className="mx-4 w-auto" />}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Legacy Menu Section (Optional, keeping for features like Lapor) */}
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Lainnya
                </div>
                {legacyMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="flex-1 font-medium text-gray-700">{item.label}</span>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </Link>
                            {index < legacyMenuItems.length - 1 && <Separator className="mx-4 w-auto" />}
                        </div>
                    );
                })}
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button 
            variant="ghost" 
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-12 gap-2"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Akun
          </Button>
          
          <div className="text-center pt-8 pb-4">
            <p className="text-xs text-muted-foreground">
                BerbagiPath v1.0.0
            </p>
          </div>
        </motion.div>
      </div>

      {/* Crop Modal */}
      {isCropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Sesuaikan Foto</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsCropOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                
                <div className="relative w-full h-80 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        showGrid={false}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm font-medium mb-2">Zoom</p>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => setIsCropOpen(false)}
                            disabled={isUploading}
                        >
                            Batal
                        </Button>
                        <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleSaveCrop}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Foto'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}

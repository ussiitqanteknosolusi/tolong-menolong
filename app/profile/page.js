'use client';

import { motion } from 'framer-motion';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  Bell,
  Shield,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { myDonations, formatCurrency } from '@/lib/mock-data';

const menuItems = [
  { icon: Heart, label: 'Donasi Saya', href: '/donations' },
  { icon: Bell, label: 'Notifikasi', href: '/inbox' },
  { icon: Settings, label: 'Pengaturan', href: '#' },
  { icon: Shield, label: 'Keamanan', href: '#' },
  { icon: FileText, label: 'Syarat & Ketentuan', href: '#' },
  { icon: HelpCircle, label: 'Bantuan', href: '#' },
];

export default function ProfilePage() {
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src="" />
            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl">
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">Pengguna</h1>
          <p className="text-sm text-muted-foreground">pengguna@email.com</p>
          <Button variant="outline" size="sm" className="mt-3">
            Edit Profil
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {myDonations.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Donasi</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalDonated)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Nominal</p>
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
        >
          <Card>
            <CardContent className="p-0">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 p-4 hover:bg-muted transition-colors"
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </a>
                    {index < menuItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          BerbagiPath v1.0.0
        </p>
      </div>
    </main>
  );
}

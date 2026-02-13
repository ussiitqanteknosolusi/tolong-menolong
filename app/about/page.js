'use client';

// ✅ This page has no dynamic data — generated at build time
// export const dynamic = 'force-static'; // Cannot use with 'use client' but Next.js auto-detects static

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Heart, Users, Shield, Globe, Target,
  Mail, Phone, MapPin
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Heart,
    title: 'Donasi Transparan',
    desc: 'Setiap donasi tercatat dan bisa dilacak secara real-time.',
  },
  {
    icon: Shield,
    title: 'Verifikasi Organizer',
    desc: 'Seluruh organizer melewati proses verifikasi identitas.',
  },
  {
    icon: Users,
    title: 'Komunitas Peduli',
    desc: 'Bergabung dengan ribuan orang baik yang peduli sesama.',
  },
  {
    icon: Globe,
    title: 'Jangkauan Luas',
    desc: 'Mendukung campaign dari berbagai daerah di Indonesia.',
  },
];

const stats = [
  { value: '10,000+', label: 'Donatur Terdaftar' },
  { value: '500+', label: 'Campaign Terverifikasi' },
  { value: 'Rp 5M+', label: 'Dana Tersalurkan' },
  { value: '100+', label: 'Kota Terjangkau' },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Tentang BerbagiPath</h1>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">BerbagiPath</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Platform donasi online terpercaya yang menghubungkan kebaikan antara 
                donatur dan mereka yang membutuhkan. Bersama kita bisa membuat perubahan.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-y">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 text-center">
                    <p className="text-xl font-bold text-emerald-600">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Misi Kami
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Menjadi platform donasi terdepan di Indonesia yang transparan, aman, dan mudah 
                  diakses. Kami berkomitmen untuk memfasilitasi setiap kebaikan dan memastikan 
                  setiap rupiah sampai kepada yang membutuhkan. Kami percaya bahwa kebaikan kecil 
                  yang konsisten bisa menciptakan perubahan besar.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Kenapa BerbagiPath?
          </h2>
          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Hubungi Kami
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="p-4 flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700">support@berbagipath.id</span>
              </div>
              <div className="p-4 flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700">+62 812 3456 7890</span>
              </div>
              <div className="p-4 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700">Indonesia</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-muted-foreground">
            BerbagiPath v1.0.0 &mdash; Dibuat dengan ❤️ di Indonesia
          </p>
        </div>
      </div>
    </main>
  );
}

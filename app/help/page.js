'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronUp, HelpCircle,
  MessageCircle, Search, Mail, BookOpen
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    q: 'Bagaimana cara berdonasi?',
    a: 'Pilih campaign yang ingin Anda dukung, klik tombol "Donasi Sekarang", masukkan jumlah donasi, dan lakukan pembayaran melalui metode yang tersedia.',
  },
  {
    q: 'Apakah donasi saya aman?',
    a: 'Ya! Seluruh transaksi di BerbagiPath diproses melalui payment gateway resmi dan terenkripsi. Data Anda dijaga kerahasiaannya sesuai kebijakan privasi kami.',
  },
  {
    q: 'Bagaimana cara membuat campaign penggalangan dana?',
    a: 'Pertama, pastikan akun Anda terverifikasi sebagai Organizer. Kemudian buka halaman "Galang Dana" dan isi informasi campaign Anda.',
  },
  {
    q: 'Kapan saya bisa mencairkan dana yang terkumpul?',
    a: 'Anda dapat mengajukan pencairan dana kapan saja melalui menu "Pencairan Dana" di profil Anda. Proses pencairan memakan waktu 1-3 hari kerja.',
  },
  {
    q: 'Bagaimana cara verifikasi akun?',
    a: 'Buka menu "Verifikasi Akun" di halaman profil, unggah foto KTP, selfie, dan informasi rekening bank Anda. Tim kami akan meninjau dalam 1-2 hari kerja.',
  },
  {
    q: 'Bisakah saya berdonasi secara anonim?',
    a: 'Ya! Saat melakukan donasi, Anda dapat mencentang opsi "Sembunyikan nama saya (Anonim)" agar nama Anda tidak ditampilkan di halaman campaign.',
  },
  {
    q: 'Apa itu Donasi Otomatis?',
    a: 'Donasi Otomatis memungkinkan Anda mendukung campaign pilihan secara berkala (mingguan/bulanan) tanpa perlu mengingat-ingat. Anda akan mendapat pengingat pembayaran sesuai jadwal.',
  },
  {
    q: 'Bagaimana cara melaporkan campaign yang mencurigakan?',
    a: 'Buka halaman campaign tersebut, klik tombol "Laporkan", pilih alasan pelaporan, dan berikan deskripsi. Tim kami akan menindaklanjuti laporan Anda.',
  },
  {
    q: 'Apakah ada batas minimal donasi?',
    a: 'Ya, batas minimal donasi adalah Rp 10.000 untuk memastikan efisiensi penyaluran dana.',
  },
  {
    q: 'Bagaimana cara menghubungi dukungan?',
    a: 'Anda bisa menghubungi kami melalui email di support@berbagipath.id atau melalui form kontak di halaman ini.',
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredFaqs = faqs.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
         f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Bantuan</h1>
        </div>

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-6 text-center">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <h2 className="text-lg font-bold mb-1">Ada yang bisa kami bantu?</h2>
              <p className="text-sm opacity-80">
                Cari jawaban dari pertanyaan umum atau hubungi tim kami
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari bantuan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Pertanyaan Umum
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>Tidak ada hasil untuk "{searchQuery}"</p>
                </div>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    >
                      <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {faq.q}
                        </p>
                        {expandedIndex === i && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-muted-foreground mt-2 leading-relaxed"
                          >
                            {faq.a}
                          </motion.p>
                        )}
                      </div>
                      {expandedIndex === i ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Masih Butuh Bantuan?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Mail className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Email Kami</p>
                <p className="text-xs text-muted-foreground mt-1">support@berbagipath.id</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Live Chat</p>
                <p className="text-xs text-muted-foreground mt-1">Respon cepat</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

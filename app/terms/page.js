'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: '1. Definisi',
    content: `
      Dalam Syarat dan Ketentuan ini, istilah-istilah berikut memiliki arti sebagai berikut:
      
      • "Platform" mengacu pada situs web dan aplikasi BerbagiPath.
      • "Pengguna" adalah setiap orang yang mengakses atau menggunakan Platform.
      • "Donatur" adalah Pengguna yang memberikan donasi melalui Platform.
      • "Organizer" adalah Pengguna yang membuat dan mengelola campaign penggalangan dana.
      • "Campaign" adalah halaman penggalangan dana yang dibuat oleh Organizer.
    `,
  },
  {
    title: '2. Ketentuan Umum',
    content: `
      Dengan menggunakan Platform BerbagiPath, Anda menyetujui untuk:
      
      • Memberikan informasi yang benar, akurat, dan lengkap saat mendaftar.
      • Menjaga kerahasiaan akun dan password Anda.
      • Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda.
      • Tidak menggunakan Platform untuk tujuan ilegal atau penipuan.
      • Mematuhi semua hukum dan peraturan yang berlaku di Indonesia.
    `,
  },
  {
    title: '3. Donasi',
    content: `
      Ketentuan terkait donasi:
      
      • Setiap donasi bersifat sukarela dan tidak dapat dikembalikan kecuali dalam keadaan khusus.
      • Donatur dapat memilih untuk berdonasi secara anonim.
      • BerbagiPath tidak memotong biaya administrasi dari donasi.
      • Donasi akan disalurkan kepada Organizer setelah campaign berakhir atau sesuai ketentuan pencairan.
      • Donatur bertanggung jawab atas keputusan donasi mereka sendiri.
    `,
  },
  {
    title: '4. Penggalangan Dana (Campaign)',
    content: `
      Ketentuan bagi Organizer:
      
      • Organizer wajib melewati proses verifikasi identitas sebelum membuat campaign.
      • Informasi campaign harus benar, jujur, dan tidak menyesatkan.
      • Dana yang terkumpul wajib digunakan sesuai tujuan campaign yang tercantum.
      • Organizer wajib memberikan laporan penggunaan dana secara berkala.
      • BerbagiPath berhak menghentikan campaign yang dianggap melanggar ketentuan.
    `,
  },
  {
    title: '5. Pencairan Dana',
    content: `
      Ketentuan pencairan dana:
      
      • Pencairan dana hanya dapat dilakukan oleh Organizer terverifikasi.
      • Permintaan pencairan akan ditinjau oleh tim BerbagiPath dalam 1-3 hari kerja.
      • Dana akan ditransfer ke rekening bank yang telah diverifikasi.
      • BerbagiPath berhak menahan pencairan jika ada indikasi penyalahgunaan.
    `,
  },
  {
    title: '6. Privasi dan Keamanan',
    content: `
      BerbagiPath berkomitmen melindungi data pribadi Pengguna:
      
      • Data pribadi Anda akan dijaga kerahasiaannya sesuai kebijakan privasi kami.
      • Kami menggunakan enkripsi untuk melindungi data sensitif.
      • Data Anda tidak akan dijual atau dibagikan kepada pihak ketiga tanpa izin.
      • Anda berhak meminta penghapusan data pribadi Anda dari Platform.
    `,
  },
  {
    title: '7. Pelanggaran dan Sanksi',
    content: `
      BerbagiPath berhak untuk:
      
      • Menangguhkan atau menghapus akun yang melanggar ketentuan.
      • Menghentikan campaign yang mengandung konten menyesatkan atau penipuan.
      • Menahan dana yang dicurigai terkait dengan aktivitas ilegal.
      • Melaporkan pelanggaran hukum kepada pihak berwenang.
    `,
  },
  {
    title: '8. Batasan Tanggung Jawab',
    content: `
      • BerbagiPath bertindak sebagai perantara antara Donatur dan Organizer.
      • Kami tidak bertanggung jawab atas keakuratan informasi yang diberikan oleh Organizer.
      • Kami tidak menjamin bahwa Platform akan selalu tersedia tanpa gangguan.
      • Pengguna bertanggung jawab atas risiko yang timbul dari penggunaan Platform.
    `,
  },
  {
    title: '9. Perubahan Ketentuan',
    content: `
      BerbagiPath berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. 
      Perubahan akan diberitahukan melalui Platform. Dengan terus menggunakan Platform 
      setelah perubahan, Anda dianggap menyetujui perubahan tersebut.
    `,
  },
  {
    title: '10. Kontak',
    content: `
      Untuk pertanyaan atau masukan terkait Syarat dan Ketentuan ini, 
      silakan hubungi kami melalui:
      
      • Email: support@berbagipath.id
      • Telepon: +62 812 3456 7890
    `,
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Syarat & Ketentuan</h1>
        </div>

        {/* Title Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-sm bg-gradient-to-br from-gray-50 to-slate-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">
                    Syarat dan Ketentuan Penggunaan BerbagiPath
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Terakhir diperbarui: 1 Februari 2026
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Selamat datang di BerbagiPath. Dengan mengakses dan menggunakan platform kami, 
                Anda menyetujui Syarat dan Ketentuan berikut. Harap baca dengan seksama 
                sebelum menggunakan layanan kami.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 2) }}
            >
              <Card className="border-none shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-emerald-700 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content.trim()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-muted-foreground">
            © 2026 BerbagiPath. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </main>
  );
}

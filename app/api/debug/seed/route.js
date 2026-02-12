import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const categories = [
  { id: 'medical', name: 'Kesehatan', icon: 'Heart', color: 'bg-red-100 text-red-600' },
  { id: 'education', name: 'Pendidikan', icon: 'GraduationCap', color: 'bg-blue-100 text-blue-600' },
  { id: 'zakat', name: 'Zakat', icon: 'HandHeart', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'disaster', name: 'Bencana Alam', icon: 'Home', color: 'bg-orange-100 text-orange-600' },
  { id: 'social', name: 'Sosial', icon: 'Users', color: 'bg-purple-100 text-purple-600' },
  { id: 'environment', name: 'Lingkungan', icon: 'TreePine', color: 'bg-green-100 text-green-600' },
  { id: 'animal', name: 'Hewan', icon: 'PawPrint', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'infrastructure', name: 'Infrastruktur', icon: 'Building2', color: 'bg-gray-100 text-gray-600' },
];

const campaigns = [
  {
    id: '1',
    title: 'Bantu Anak Yatim Mendapat Pendidikan Layak',
    slug: 'bantu-anak-yatim-pendidikan',
    description: 'Mari bersama-sama membantu anak-anak yatim untuk mendapatkan pendidikan yang layak. Dana yang terkumpul akan digunakan untuk biaya sekolah, buku, dan perlengkapan belajar.',
    story: `<p>Assalamualaikum warahmatullahi wabarakatuh,</p>
<p>Perkenalkan, saya Ahmad dari Yayasan Cahaya Harapan. Kami mengelola panti asuhan yang saat ini menampung 45 anak yatim piatu dari berbagai latar belakang.</p>
<p>Anak-anak ini memiliki semangat belajar yang tinggi, namun keterbatasan biaya membuat mereka kesulitan untuk melanjutkan pendidikan. Banyak dari mereka yang harus berbagi buku dengan teman-temannya.</p>
<p><strong>Dana yang terkumpul akan digunakan untuk:</strong></p>
<ul>
<li>Biaya pendidikan selama 1 tahun</li>
<li>Buku pelajaran dan alat tulis</li>
<li>Seragam sekolah</li>
<li>Les tambahan untuk anak-anak yang membutuhkan</li>
</ul>
<p>Semoga Allah SWT membalas kebaikan para donatur dengan pahala yang berlipat ganda. Aamiin.</p>`,
    category: 'education',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop',
    targetAmount: 150000000,
    currentAmount: 87500000,
    daysLeft: 23,
    donorCount: 342,
    isVerified: true,
    isUrgent: true,
    organizer: {
      name: 'Yayasan Cahaya Harapan',
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop',
      isVerified: true,
    },
    createdAt: '2025-05-15',
  },
  {
    id: '2',
    title: 'Operasi Jantung untuk Bayi Raffa',
    slug: 'operasi-jantung-bayi-raffa',
    description: 'Bayi Raffa membutuhkan operasi jantung segera. Mari bantu keluarga ini untuk mendapatkan pengobatan yang layak.',
    story: `<p>Halo para dermawan,</p>
<p>Bayi Raffa (8 bulan) didiagnosis mengalami kelainan jantung bawaan sejak lahir. Dokter menyarankan untuk segera dilakukan operasi.</p>
<p>Keluarga Raffa adalah keluarga sederhana. Ayahnya bekerja sebagai buruh harian dengan penghasilan tidak menentu.</p>
<p>Biaya operasi yang dibutuhkan sangat besar dan tidak mampu ditanggung sendiri oleh keluarga.</p>`,
    category: 'medical',
    image: 'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=800&auto=format&fit=crop',
    targetAmount: 250000000,
    currentAmount: 198750000,
    daysLeft: 7,
    donorCount: 1203,
    isVerified: true,
    isUrgent: true,
    organizer: {
      name: 'Keluarga Raffa',
      avatar: 'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=100&auto=format&fit=crop',
      isVerified: true,
    },
    createdAt: '2025-06-01',
  },
  {
    id: '3',
    title: 'Bantuan Korban Banjir Kalimantan',
    slug: 'bantuan-korban-banjir-kalimantan',
    description: 'Ribuan warga terdampak banjir di Kalimantan Selatan membutuhkan bantuan mendesak berupa makanan, pakaian, dan obat-obatan.',
    story: `<p>Banjir besar melanda wilayah Kalimantan Selatan sejak minggu lalu. Ribuan rumah terendam dan warga harus mengungsi.</p>
<p>Bantuan yang dibutuhkan:</p>
<ul>
<li>Makanan siap saji dan air bersih</li>
<li>Pakaian dan selimut</li>
<li>Obat-obatan</li>
<li>Perlengkapan bayi</li>
</ul>`,
    category: 'disaster',
    image: 'https://images.unsplash.com/photo-1728320771441-17a19df0fe4c?w=800&auto=format&fit=crop',
    targetAmount: 500000000,
    currentAmount: 325000000,
    daysLeft: 14,
    donorCount: 2891,
    isVerified: true,
    isUrgent: true,
    organizer: {
      name: 'Tim Relawan Peduli',
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop',
      isVerified: true,
    },
    createdAt: '2025-06-05',
  },
  {
    id: '4',
    title: 'Pembangunan Masjid Desa Terpencil',
    slug: 'pembangunan-masjid-desa',
    description: 'Warga desa terpencil di Sulawesi membutuhkan masjid sebagai pusat ibadah dan kegiatan sosial.',
    story: `<p>Desa Suka Maju di pedalaman Sulawesi belum memiliki masjid yang layak. Warga selama ini beribadah di mushola kecil yang sudah tidak mampu menampung jamaah.</p>`,
    category: 'zakat',
    image: 'https://images.unsplash.com/photo-1591197172062-c718f82aba20?w=800&auto=format&fit=crop',
    targetAmount: 300000000,
    currentAmount: 156000000,
    daysLeft: 45,
    donorCount: 567,
    isVerified: true,
    isUrgent: false,
    organizer: {
      name: 'DKM Desa Suka Maju',
      avatar: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=100&auto=format&fit=crop',
      isVerified: true,
    },
    createdAt: '2025-04-20',
  },
  {
    id: '5',
    title: 'Beasiswa untuk Mahasiswa Kurang Mampu',
    slug: 'beasiswa-mahasiswa-kurang-mampu',
    description: 'Program beasiswa untuk membantu mahasiswa berprestasi dari keluarga kurang mampu menyelesaikan pendidikan.',
    story: `<p>Banyak mahasiswa berprestasi yang terpaksa putus kuliah karena keterbatasan biaya. Program ini bertujuan membantu mereka melanjutkan pendidikan.</p>`,
    category: 'education',
    image: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&auto=format&fit=crop',
    targetAmount: 200000000,
    currentAmount: 45000000,
    daysLeft: 60,
    donorCount: 189,
    isVerified: true,
    isUrgent: false,
    organizer: {
      name: 'Yayasan Beasiswa Indonesia',
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop',
      isVerified: true,
    },
    createdAt: '2025-05-01',
  },
  {
    id: '6',
    title: 'Pengobatan Kanker Ibu Siti',
    slug: 'pengobatan-kanker-ibu-siti',
    description: 'Ibu Siti (52 tahun) didiagnosis kanker payudara stadium 3 dan membutuhkan biaya kemoterapi.',
    story: `<p>Ibu Siti adalah seorang janda dengan 3 anak yang masih bersekolah. Beliau didiagnosis kanker payudara dan membutuhkan kemoterapi segera.</p>`,
    category: 'medical',
    image: 'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=800&auto=format&fit=crop',
    targetAmount: 180000000,
    currentAmount: 92000000,
    daysLeft: 30,
    donorCount: 456,
    isVerified: true,
    isUrgent: true,
    organizer: {
      name: 'Keluarga Ibu Siti',
      avatar: 'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=100&auto=format&fit=crop',
      isVerified: false,
    },
    createdAt: '2025-05-20',
  },
];

export async function GET() {
  try {
     const status = [];
     
     // 1. Seed Categories
     for (const cat of categories) {
        const existing = await db.findOne('categories', { id: cat.id });
        if (!existing) {
            await db.insert('categories', {
                id: cat.id,
                name: cat.name,
                slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
                icon: cat.icon,
                color: cat.color
            });
            status.push(`Inserted Category: ${cat.name}`);
        } else {
            status.push(`Category exists: ${cat.name}`);
        }
     }

     // 2. Seed Campaigns
     for (const c of campaigns) {
        const existing = await db.findOne('campaigns', { id: c.id });
        if (!existing) {
             // Check/Create organizer user
             let organizerId = 'org-' + c.id;
             const orgUser = await db.findOne('users', { id: organizerId });
             if (!orgUser) {
                 await db.insert('users', {
                     id: organizerId,
                     name: c.organizer.name,
                     email: `org${c.id}@example.com`,
                     role: 'organizer',
                     is_verified: c.organizer.isVerified,
                     created_at: new Date()
                 });
             }

             await db.insert('campaigns', {
                 id: c.id,
                 slug: c.slug,
                 title: c.title,
                 description: c.description,
                 story: c.story,
                 category_id: c.category,
                 organizer_id: organizerId,
                 image_url: c.image,
                 target_amount: c.targetAmount,
                 current_amount: c.currentAmount,
                 donor_count: c.donorCount,
                 start_date: new Date(c.createdAt),
                 end_date: new Date(new Date(c.createdAt).getTime() + c.daysLeft * 24 * 60 * 60 * 1000),
                 is_verified: c.isVerified,
                 is_urgent: c.isUrgent,
                 status: 'active'
             });
             status.push(`Inserted Campaign: ${c.title}`);
        } else {
             status.push(`Campaign exists: ${c.title}`);
        }
     }
     
     return NextResponse.json({ success: true, message: 'Seeding completed', status });

  } catch (error) {
     return NextResponse.json({ success: false, error: error.message });
  }
}

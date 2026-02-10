// Mock data for crowdfunding campaigns

export const categories = [
  { id: 'medical', name: 'Kesehatan', icon: 'Heart', color: 'bg-red-100 text-red-600' },
  { id: 'education', name: 'Pendidikan', icon: 'GraduationCap', color: 'bg-blue-100 text-blue-600' },
  { id: 'zakat', name: 'Zakat', icon: 'HandHeart', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'disaster', name: 'Bencana Alam', icon: 'Home', color: 'bg-orange-100 text-orange-600' },
  { id: 'social', name: 'Sosial', icon: 'Users', color: 'bg-purple-100 text-purple-600' },
  { id: 'environment', name: 'Lingkungan', icon: 'TreePine', color: 'bg-green-100 text-green-600' },
  { id: 'animal', name: 'Hewan', icon: 'PawPrint', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'infrastructure', name: 'Infrastruktur', icon: 'Building2', color: 'bg-gray-100 text-gray-600' },
];

export const campaigns = [
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

export const recentDonors = [
  { id: '1', name: 'Ahmad Hidayat', amount: 500000, message: 'Semoga lekas sembuh, dek Raffa!', time: '5 menit lalu', isAnonymous: false },
  { id: '2', name: 'Hamba Allah', amount: 1000000, message: 'Semoga Allah memudahkan segala urusan.', time: '15 menit lalu', isAnonymous: true },
  { id: '3', name: 'Dewi Lestari', amount: 250000, message: 'Bismillah, semoga berkah.', time: '30 menit lalu', isAnonymous: false },
  { id: '4', name: 'Budi Santoso', amount: 2000000, message: 'Turut mendoakan kesembuhan.', time: '1 jam lalu', isAnonymous: false },
  { id: '5', name: 'Hamba Allah', amount: 100000, message: '', time: '2 jam lalu', isAnonymous: true },
  { id: '6', name: 'Rina Wati', amount: 750000, message: 'Semoga cepat terkumpul dananya.', time: '3 jam lalu', isAnonymous: false },
];

export const myDonations = [
  { id: '1', campaignId: '2', campaignTitle: 'Operasi Jantung untuk Bayi Raffa', amount: 500000, date: '2025-06-10', status: 'success' },
  { id: '2', campaignId: '1', campaignTitle: 'Bantu Anak Yatim Mendapat Pendidikan', amount: 250000, date: '2025-06-08', status: 'success' },
  { id: '3', campaignId: '3', campaignTitle: 'Bantuan Korban Banjir Kalimantan', amount: 1000000, date: '2025-06-05', status: 'success' },
];

export const notifications = [
  { id: '1', type: 'update', title: 'Update Campaign', message: 'Bayi Raffa telah berhasil menjalani operasi!', time: '2 jam lalu', isRead: false },
  { id: '2', type: 'thankyou', title: 'Terima Kasih', message: 'Donasi Anda telah diterima oleh Yayasan Cahaya Harapan.', time: '1 hari lalu', isRead: true },
  { id: '3', type: 'promo', title: 'Promo Ramadhan', message: 'Dapatkan pahala berlipat dengan donasi di bulan Ramadhan!', time: '3 hari lalu', isRead: true },
];

export const paymentMethods = [
  { id: 'qris', name: 'QRIS', icon: 'QrCode', description: 'Scan QR untuk pembayaran' },
  { id: 'va_bca', name: 'BCA Virtual Account', icon: 'Building2', description: 'Transfer via ATM/Mobile Banking' },
  { id: 'va_mandiri', name: 'Mandiri Virtual Account', icon: 'Building2', description: 'Transfer via ATM/Mobile Banking' },
  { id: 'va_bri', name: 'BRI Virtual Account', icon: 'Building2', description: 'Transfer via ATM/Mobile Banking' },
  { id: 'gopay', name: 'GoPay', icon: 'Wallet', description: 'Bayar dengan GoPay' },
  { id: 'ovo', name: 'OVO', icon: 'Wallet', description: 'Bayar dengan OVO' },
  { id: 'dana', name: 'DANA', icon: 'Wallet', description: 'Bayar dengan DANA' },
];

// Helper functions
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProgressPercentage(current, target) {
  return Math.min(Math.round((current / target) * 100), 100);
}

export function getCampaignById(id) {
  return campaigns.find(c => c.id === id);
}

export function getCampaignBySlug(slug) {
  return campaigns.find(c => c.slug === slug);
}

export function getCampaignsByCategory(categoryId) {
  return campaigns.filter(c => c.category === categoryId);
}

export function getUrgentCampaigns() {
  return campaigns.filter(c => c.isUrgent);
}

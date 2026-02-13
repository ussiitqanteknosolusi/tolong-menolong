import { query } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import HeroSection from '@/components/hero-section';
import HomeClient from './home-client';

// ✅ ISR — Revalidate homepage every 2 minutes
// The homepage is the most visited page. Caching it saves huge CPU/DB load.
export const revalidate = 120;

// ✅ Cached data fetchers — DB queries are deduplicated and cached
const getCampaigns = unstable_cache(
  async () => {
    try {
      const campaigns = await query(`
        SELECT c.id, c.slug, c.title, c.image_url, c.current_amount, c.target_amount,
               GREATEST(0, DATEDIFF(c.end_date, NOW())) as days_left,
               COALESCE(c.donor_count, 0) as donor_count,
               c.is_urgent, c.is_verified, c.is_berbagipath,
               c.created_at, u.name as organizer_name, u.is_verified as organizer_is_verified
        FROM campaigns c
        LEFT JOIN users u ON c.organizer_id = u.id
        WHERE c.status = 'active'
        ORDER BY c.created_at DESC
        LIMIT 6
      `);

      // ✅ Payload Pruning — only send what CampaignCard needs
      return campaigns.map(c => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        image: c.image_url,
        currentAmount: Number(c.current_amount || 0),
        targetAmount: Number(c.target_amount || 0),
        daysLeft: c.days_left || 0,
        donorCount: c.donor_count || 0,
        isUrgent: !!c.is_urgent,
        isVerified: !!c.is_verified,
        organizer: {
          name: c.is_berbagipath ? 'BerbagiPath' : (c.organizer_name || 'Organizer'),
          isVerified: !!c.organizer_is_verified || !!c.is_berbagipath,
        }
      }));
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      return [];
    }
  },
  ['home-campaigns'],
  { revalidate: 120, tags: ['campaigns'] }
);

const getStats = unstable_cache(
  async () => {
    try {
      const [totalDon, activeCamp, totalUsers] = await Promise.all([
        query("SELECT SUM(amount) as total FROM donations WHERE status = 'paid'"),
        query("SELECT COUNT(*) as total FROM campaigns WHERE status = 'active'"),
        query("SELECT COUNT(*) as total FROM users"),
      ]);

      const totalDonations = Number(totalDon[0]?.total || 0);
      const formatCompact = (num) => {
        if (num >= 1_000_000_000) return 'Rp ' + (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' M+';
        if (num >= 1_000_000) return 'Rp ' + (num / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' Jt+';
        return 'Rp ' + num.toLocaleString('id-ID');
      };

      return [
        { label: 'Total Donasi', value: formatCompact(totalDonations), icon: 'TrendingUp' },
        { label: 'Campaign Aktif', value: (activeCamp[0]?.total || 0) + '+', icon: 'Shield' },
        { label: 'Donatur Terdaftar', value: (totalUsers[0]?.total || 0) + '+', icon: 'Clock' },
      ];
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      return [
        { label: 'Total Donasi', value: 'Rp 0', icon: 'TrendingUp' },
        { label: 'Campaign Aktif', value: '0', icon: 'Shield' },
        { label: 'Donatur Terdaftar', value: '0', icon: 'Clock' },
      ];
    }
  },
  ['home-stats'],
  { revalidate: 300, tags: ['stats'] } // Stats change less frequently — 5 min cache
);

const getArticles = unstable_cache(
  async () => {
    try {
      const articles = await query(
        "SELECT id, slug, title, excerpt, content, image_url, created_at FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 3"
      );
      // ✅ Prune heavy 'content' field — only send excerpt
      return articles.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || (a.content ? a.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : ''),
        image_url: a.image_url,
        created_at: a.created_at,
      }));
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      return [];
    }
  },
  ['home-articles'],
  { revalidate: 300, tags: ['articles'] }
);

// ✅ Server Component — fetches data on server, passes pruned payload to client
export default async function HomePage() {
  const [campaigns, stats, articles] = await Promise.all([
    getCampaigns(),
    getStats(),
    getArticles(),
  ]);

  return (
    <main className="pb-20 md:pb-8">
      {/* HeroSection is a Client Component (carousel needs interactivity) */}
      <HeroSection />

      {/* HomeClient is a Leaf Client Component — receives only what it needs */}
      <HomeClient campaigns={campaigns} articles={articles} stats={stats} />
    </main>
  );
}

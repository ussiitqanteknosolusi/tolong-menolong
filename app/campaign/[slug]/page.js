import { query } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';

// ✅ ISR: Revalidate every 60 seconds instead of force-dynamic
// This means the page is cached for 60s, reducing DB hits dramatically
export const revalidate = 60;

// ✅ Cached DB query — deduplicated across concurrent requests
const getCampaign = unstable_cache(
  async (slug) => {
    try {
      const rows = await query(`
        SELECT c.*, cat.name as category_name, u.name as organizer_name, 
               u.is_verified as organizer_is_verified, u.avatar_url as organizer_avatar
        FROM campaigns c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.organizer_id = u.id
        WHERE c.slug = ? LIMIT 1
      `, [slug]);
      
      if (!rows || rows.length === 0) return null;
      const c = rows[0];
      
      let daysLeft = c.days_left;
      if (daysLeft === undefined && c.end_date) {
        const end = new Date(c.end_date);
        const now = new Date();
        const diffTime = end - now;
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) daysLeft = 0;
      }
      
      // ✅ Payload Pruning — only send what the client needs
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description || '',
        image: c.image_url || '/placeholder.jpg',
        currentAmount: Number(c.current_amount || 0),
        targetAmount: Number(c.target_amount || 0),
        daysLeft: daysLeft || 0,
        donorCount: c.donor_count || 0,
        story: c.story,
        isUrgent: !!c.is_urgent,
        isVerified: !!c.is_verified,
        organizer: {
          name: c.is_berbagipath ? 'BerbagiPath' : (c.organizer_name || 'Organizer'),
          avatar: c.is_berbagipath ? null : c.organizer_avatar,
          isVerified: !!c.organizer_is_verified || !!c.is_berbagipath,
        }
      };
    } catch (err) {
      console.error('Error fetching campaign:', err);
      return null;
    }
  },
  ['campaign-detail'],  // cache key prefix
  { revalidate: 60, tags: ['campaigns'] }
);

const getDonors = unstable_cache(
  async (campaignId) => {
    try {
      const rows = await query(`
        SELECT d.id, d.donor_name, d.amount, d.message, d.created_at, d.is_anonymous, u.avatar_url, u.name as user_name
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.campaign_id = ? AND d.status = 'paid'
        ORDER BY d.created_at DESC
        LIMIT 20
      `, [campaignId]);
      
      // ✅ Payload Pruning — minimal donor data to client
      return rows.map(d => ({
        id: d.id,
        name: d.is_anonymous ? 'Orang Baik' : (d.donor_name || d.user_name || 'Hamba Allah'),
        amount: Number(d.amount),
        message: d.message,
        avatar: d.is_anonymous ? null : (d.avatar_url || null),
        createdAt: new Date(d.created_at).toISOString(),
      }));
    } catch (err) {
      console.error('Error fetching donors:', err);
      return [];
    }
  },
  ['campaign-donors'],
  { revalidate: 30, tags: ['donations'] }
);

// ✅ Dynamic Metadata for SEO (OpenGraph / Twitter Cards)
export async function generateMetadata({ params }) {
  const campaign = await getCampaign(params.slug);
  if (!campaign) {
    return {
      title: 'Campaign Tidak Ditemukan',
      description: 'Halaman yang Anda cari tidak ditemukan.'
    };
  }
  
  const desc = campaign.description?.substring(0, 160) || `Bantu ${campaign.title} di BerbagiPath`;
  
  return {
    title: campaign.title,
    description: desc,
    openGraph: {
      title: campaign.title,
      description: desc,
      images: [campaign.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: desc,
      images: [campaign.image],
    },
  };
}

export default async function Page({ params }) {
  const campaign = await getCampaign(params.slug);
  
  if (!campaign) return notFound();
  
  const donors = await getDonors(campaign.id);
  
  // ✅ Server Component passes pruned data → Client Component (leaf)
  return <ClientPage campaign={campaign} donors={donors} />;
}

import { query } from '@/lib/db';
import ClientPage from './client-page';
import { notFound } from 'next/navigation';

// Server Component
export const dynamic = 'force-dynamic';

async function getCampaign(slug) {
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
      
      // Calculate days left if not in DB
      let daysLeft = c.days_left;
      if (daysLeft === undefined && c.end_date) {
          const end = new Date(c.end_date);
          const now = new Date();
          const diffTime = end - now;
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) daysLeft = 0;
      }
      
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description || '',
        image: c.image_url || '/placeholder.jpg', // Map image_url
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
}

async function getDonors(campaignId) {
    try {
        const rows = await query(`
            SELECT d.id, d.donor_name, d.amount, d.message, d.created_at, d.is_anonymous, u.avatar_url, u.name as user_name
            FROM donations d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.campaign_id = ? AND d.status = 'paid'
            ORDER BY d.created_at DESC
            LIMIT 50
        `, [campaignId]);
        
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
}

export async function generateMetadata({ params }) {
  const campaign = await getCampaign(params.slug);
  if (!campaign) {
      return {
          title: 'Campaign Tidak Ditemukan - BerbagiPath',
          description: 'Halaman yang Anda cari tidak ditemukan.'
      };
  }
  
  return {
    title: `${campaign.title} - BerbagiPath`,
    description: campaign.description?.substring(0, 160) || `Bantu ${campaign.title} di BerbagiPath`,
    openGraph: {
        title: campaign.title,
        description: campaign.description?.substring(0, 160),
        images: [campaign.image],
    },
    twitter: {
        card: "summary_large_image",
        title: campaign.title,
        description: campaign.description?.substring(0, 160),
        images: [campaign.image],
    }
  };
}

export default async function Page({ params }) {
  const campaign = await getCampaign(params.slug);
  
  if (!campaign) {
      return notFound();
  }
  
  const donors = await getDonors(campaign.id);
  
  return <ClientPage campaign={campaign} donors={donors} />;
}

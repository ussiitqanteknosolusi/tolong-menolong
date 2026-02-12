
import DesktopNav from '@/components/desktop-nav';
import MobileNav from '@/components/mobile-nav';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

async function getArticle(slug) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/articles/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
    } catch (e) {
        return null;
    }
}

export default async function ArticleDetailPage({ params }) {
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white pb-24 md:pb-0">

            
            <article className="max-w-4xl mx-auto py-8">
                <div className="px-4 md:px-0 mb-6">
                    <Link href="/articles" className="inline-flex items-center text-muted-foreground hover:text-emerald-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Artikel
                    </Link>
                </div>

                <div className="px-4 md:px-0">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b pb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-900">Admin BerbagiPath</span>
                        </div>
                        <span className="hidden md:inline">•</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(article.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {article.image_url && (
                    <div className="relative w-full aspect-video md:rounded-2xl overflow-hidden mb-10 bg-gray-100 shadow-sm mx-auto md:max-w-4xl">
                        <Image 
                            src={article.image_url} 
                            alt={article.title} 
                            fill 
                            priority
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="px-4 md:px-0">
                    <div 
                        className="prose prose-lg prose-emerald max-w-none text-gray-800 leading-relaxed space-y-6 [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>img]:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </article>


        </main>
    );
}

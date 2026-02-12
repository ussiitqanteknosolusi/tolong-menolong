'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import DesktopNav from '@/components/desktop-nav';
import MobileNav from '@/components/mobile-nav';

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/articles?limit=20');
                const data = await res.json();
                if (data.success) setArticles(data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    return (
        <main className="min-h-screen pb-20 md:pb-0 bg-gray-50">

            <div className="container py-8 max-w-5xl mx-auto">
                <div className="text-center mb-12 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Artikel & Berita Terbaru</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Dapatkan wawasan, cerita inspiratif, dan kabar terbaru seputar aksi kebaikan dari komunitas BerbagiPath.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-[400px] bg-white rounded-xl shadow-sm border p-4 space-y-4 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-lg w-full"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                     <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 mx-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Belum Ada Artikel</h3>
                        <p className="text-muted-foreground mt-2">Nantikan artikel menarik dari kami segera.</p>
                     </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
                        {articles.map(article => (
                            <Link href={`/articles/${article.slug}`} key={article.id} className="group h-full block">
                                <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
                                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                                        {article.image_url ? (
                                            <Image 
                                                src={article.image_url} 
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-200">
                                                <span className="text-5xl font-bold opacity-20">BP</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mb-3 uppercase tracking-wider">
                                            <span>Berita</span>
                                            <span className="text-gray-300">•</span>
                                            <div className="flex items-center gap-1 text-gray-500 normal-case tracking-normal">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(article.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                                            {article.title}
                                        </h3>
                                        
                                        <div className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                            {article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm font-medium">
                                            <span className="text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                Baca Selengkapnya 
                                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </main>
    );
}

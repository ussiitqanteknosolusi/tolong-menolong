'use client';
import { useState, useEffect } from 'react';
import ArticleForm from '@/components/article-form';
import { toast } from 'sonner';

export default function EditArticlePage({ params }) {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/articles/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setArticle(data.data);
                } else {
                    toast.error('Artikel tidak ditemukan');
                }
            } catch (e) {
                toast.error('Gagal memuat artikel');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [params.id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );
    
    if (!article) return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
            Artikel tidak ditemukan
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-2xl font-bold mb-6">Edit Artikel</h1>
            <ArticleForm initialData={article} articleId={params.id} />
        </div>
    );
}

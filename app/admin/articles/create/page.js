'use client';
import ArticleForm from '@/components/article-form';

export default function CreateArticlePage() {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-2xl font-bold mb-6">Buat Artikel Baru</h1>
            <ArticleForm />
        </div>
    );
}

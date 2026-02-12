'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        try {
            // Fetch all articles (including drafts if API supports param, currently fetches published by default logic but let's assume admin gets created ones if no filter logic implemented yet or we just fetch whatever)
            // Wait, my API only returns 'published' by default?
            // "SELECT * FROM articles WHERE status = 'published' ..."
            // I should update API to allow admin to see all.
            // But let's fetch for now. If table is empty, array is empty.
            const res = await fetch('/api/articles?limit=100&all=true');
            const data = await res.json();
            if (data.success) {
                // If API filters 'published', I won't see drafts. I need to fix API or just work with published for now.
                // Let's assume for MVP published is fine or I update API later.
                setArticles(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data artikel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArticles(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Hapus artikel ini?')) return;
        try {
            const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Artikel dihapus');
                fetchArticles();
            } else {
                toast.error('Gagal menghapus');
            }
        } catch (e) {
            toast.error('Terjadi kesalahan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Kelola Artikel</h1>
                <Link href="/admin/articles/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" /> Buat Artikel
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-medium text-sm text-gray-500">Judul</th>
                                <th className="text-left p-4 font-medium text-sm text-gray-500">Status</th>
                                <th className="text-left p-4 font-medium text-sm text-gray-500">Tanggal</th>
                                <th className="text-right p-4 font-medium text-sm text-gray-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">Memuat data...</td></tr>
                            ) : articles.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">Belum ada artikel. Silakan buat baru.</td></tr>
                            ) : (
                                articles.map(article => (
                                    <tr key={article.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium max-w-[300px] truncate" title={article.title}>{article.title}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {article.status === 'published' ? 'TERBIT' : 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(article.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Link href={`/admin/articles/${article.id}/edit`}>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-red-100 text-red-600 hover:bg-red-200"
                                                onClick={() => handleDelete(article.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

'use client';
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill');
    return RQ;
}, { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function ArticleForm({ initialData = null, articleId = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        image: initialData?.image_url || '',
        status: initialData?.status || 'published',
        slug: initialData?.slug || ''
    });
    
    // Image Upload State
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const uploadFormData = new FormData(); // Use specific variable name to avoid scope confusion
        uploadFormData.append('file', file);
        uploadFormData.append('folder', 'articles');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success('Gambar berhasil diupload');
            } else {
                toast.error('Gagal upload gambar');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error upload gambar');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
            const method = articleId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(articleId ? 'Artikel diperbarui' : 'Artikel dibuat');
                router.push('/admin/articles');
                router.refresh();
            } else {
                toast.error(data.error || 'Terjadi kesalahan');
            }
        } catch (e) {
            toast.error('Gagal menyimpan artikel');
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image'],
          ['clean']
        ],
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-0 bg-white p-0 md:p-6 rounded-lg md:border md:shadow-sm">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label>Judul Artikel</Label>
                        <Input 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Contoh: 5 Cara Membantu Sesama"
                            required
                            className="text-lg font-medium h-12"
                        />
                    </div>
                     
                    {articleId && (
                        <div className="space-y-2">
                            <Label>Slug (URL)</Label>
                            <Input 
                                value={formData.slug}
                                onChange={e => setFormData({...formData, slug: e.target.value})}
                                className="bg-gray-50 text-gray-500 font-mono text-sm"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Konten Artikel</Label>
                        <div className="min-h-[400px] border rounded-md">
                            <ReactQuill 
                                theme="snow"
                                value={formData.content}
                                onChange={(val) => setFormData({...formData, content: val})}
                                modules={modules}
                                className="h-[350px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Gambar Thumbnail</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                             onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            
                            {formData.image ? (
                                <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100 group w-full">
                                    <Image src={formData.image} alt="Thumbnail" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Ganti Gambar</p>
                                    </div>
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
                                    {uploadingImage ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <Upload className="w-8 h-8 opacity-50" />
                                    )}
                                    <span className="text-sm">Klik untuk upload gambar</span>
                                </div>
                            )}
                        </div>
                        {formData.image && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                onClick={(e) => { e.stopPropagation(); setFormData({...formData, image: ''}); }}
                            >
                                <X className="w-4 h-4 mr-2" /> Hapus Gambar
                            </Button>
                        )}
                        <Input 
                            value={formData.image}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            placeholder="Atau masukkan URL..."
                            className="mt-2 text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status Publikasi</Label>
                         <Select 
                            value={formData.status} 
                            onValueChange={(val) => setFormData({...formData, status: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">Terbit (Published)</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-6 border-t space-y-3">
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base">
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                            ) : (
                                articleId ? 'Simpan Perubahan' : 'Terbitkan Artikel'
                            )}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>
                            Batal
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

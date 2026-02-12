'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Heart,
  GraduationCap,
  HandHeart,
  Home,
  Users,
  TreePine,
  PawPrint,
  Building2,
  Upload,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const iconOptions = [
  { value: 'Heart', icon: Heart, label: 'Heart' },
  { value: 'GraduationCap', icon: GraduationCap, label: 'Graduation' },
  { value: 'HandHeart', icon: HandHeart, label: 'Hand Heart' },
  { value: 'Home', icon: Home, label: 'Home' },
  { value: 'Users', icon: Users, label: 'Users' },
  { value: 'TreePine', icon: TreePine, label: 'Tree' },
  { value: 'PawPrint', icon: PawPrint, label: 'Paw' },
  { value: 'Building2', icon: Building2, label: 'Building' },
];

const colorOptions = [
  { value: 'bg-red-100 text-red-600', label: 'Merah' },
  { value: 'bg-blue-100 text-blue-600', label: 'Biru' },
  { value: 'bg-emerald-100 text-emerald-600', label: 'Hijau' },
  { value: 'bg-orange-100 text-orange-600', label: 'Orange' },
  { value: 'bg-purple-100 text-purple-600', label: 'Ungu' },
  { value: 'bg-green-100 text-green-600', label: 'Hijau Tua' },
  { value: 'bg-yellow-100 text-yellow-600', label: 'Kuning' },
  { value: 'bg-gray-100 text-gray-600', label: 'Abu-abu' },
];

const iconMap = {
  Heart,
  GraduationCap,
  HandHeart,
  Home,
  Users,
  TreePine,
  PawPrint,
  Building2,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Heart',
    color: 'bg-red-100 text-red-600',
    isActive: true, // Not persisted yet
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // toast.error('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        icon: 'Heart',
        color: 'bg-red-100 text-red-600',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await fetch('/api/upload/icon', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      
      if (result.success) {
        setFormData({ ...formData, icon: result.url });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengupload file icon');
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return;

    try {
        let response;
        if (editingCategory) {
            response = await fetch(`/api/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
        } else {
            response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            setIsDialogOpen(false);
            fetchCategories();
            // toast.success(editingCategory ? 'Kategori diperbarui' : 'Kategori dibuat');
        } else {
            // toast.error(data.error);
            alert(data.error);
        }
    } catch (error) {
        console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            setCategories(categories.filter((c) => c.id !== id));
        } else {
             alert(data.error || 'Gagal menghapus');
        }
      } catch (error) {
          console.error(error);
      }
    }
  };

  const handleToggleActive = (id) => {
    // Not implemented in DB yet
    alert("Fitur non-aktif kategori belum tersedia di database");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori campaign</p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Heart;
          return (
            <Card
              key={category.id}
              className={`relative ${!category.isActive ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color} overflow-hidden`}
                  >
                    {category.icon.startsWith('/') ? (
                        <div className="relative w-8 h-8">
                             <Image 
                                src={category.icon} 
                                alt={category.name} 
                                fill 
                                className="object-contain"
                             />
                        </div>
                    ) : (
                        <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.campaignCount} campaigns
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {category.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={() => handleToggleActive(category.id)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                placeholder="Contoh: Kesehatan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Tabs defaultValue={formData.icon.startsWith('/') ? 'upload' : 'select'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Pilih Standar</TabsTrigger>
                  <TabsTrigger value="upload">Upload Gambar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="select" className="mt-4">
                    <Select
                        value={!formData.icon.startsWith('/') ? formData.icon : 'Heart'}
                        onValueChange={(value) =>
                        setFormData({ ...formData, icon: value })
                        }
                    >
                        <SelectTrigger>
                        <SelectValue placeholder="Pilih icon" />
                        </SelectTrigger>
                        <SelectContent>
                        {iconOptions.map((opt) => {
                            const OptIcon = opt.icon;
                            return (
                            <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                <OptIcon className="w-4 h-4" />
                                {opt.label}
                                </div>
                            </SelectItem>
                            );
                        })}
                        </SelectContent>
                    </Select>
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                    <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg bg-muted/50">
                        {formData.icon.startsWith('/') && (
                            <div className="relative w-16 h-16 bg-white rounded-lg p-2 border">
                                <Image 
                                    src={formData.icon} 
                                    alt="Icon preview" 
                                    fill 
                                    className="object-contain p-1"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="w-full max-w-[250px]"
                                disabled={uploading}
                            />
                        </div>
                        {uploading && (
                             <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengupload...
                             </div>
                        )}
                        <p className="text-xs text-muted-foreground">Max 2MB. PNG, JPG, WEBP</p>
                    </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih warna" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${opt.value}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.color}`}
                >
                  {(() => {
                    if (formData.icon.startsWith('/')) {
                        return (
                            <div className="relative w-6 h-6">
                                <Image src={formData.icon} alt="Preview" fill className="object-contain" />
                            </div>
                        );
                    }
                    const PreviewIcon = iconMap[formData.icon] || Heart;
                    return <PreviewIcon className="w-5 h-5" />;
                  })()}
                </div>
                <span className="font-medium">
                  {formData.name || 'Nama Kategori'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleSave}
              >
                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

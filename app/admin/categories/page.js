'use client';

import { useState } from 'react';
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
} from 'lucide-react';
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
import { categories as initialCategories } from '@/lib/mock-data';

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
  const [categories, setCategories] = useState(
    initialCategories.map((c) => ({ ...c, isActive: true, campaignCount: Math.floor(Math.random() * 50) + 5 }))
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Heart',
    color: 'bg-red-100 text-red-600',
    isActive: true,
  });

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

  const handleSave = () => {
    if (!formData.name) return;

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, ...formData } : c
        )
      );
    } else {
      const newCategory = {
        id: `cat-${Date.now()}`,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        ...formData,
        campaignCount: 0,
      };
      setCategories([...categories, newCategory]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}
                  >
                    <Icon className="w-6 h-6" />
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
              <Select
                value={formData.icon}
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

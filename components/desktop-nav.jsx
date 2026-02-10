'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Heart, ChevronDown, User, Bell, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function DesktopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl text-emerald-600 hidden sm:inline">BerbagiPath</span>
        </Link>

        {/* Desktop Search & Nav */}
        <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari campaign atau penggalang dana..."
              className="pl-10 bg-muted/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                Kategori
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categories.slice(0, 6).map((cat) => (
                <DropdownMenuItem key={cat.id} asChild>
                  <Link href={`/category/${cat.id}`}>{cat.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Link href="/donations">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <LogIn className="w-4 h-4" />
            Masuk
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Galang Dana
          </Button>
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          isSearchOpen ? 'max-h-20 py-3 px-4 border-t' : 'max-h-0'
        )}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari campaign..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>
    </header>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  GraduationCap,
  HandHeart,
  Home,
  Users,
  TreePine,
  PawPrint,
  Building2,
} from 'lucide-react';
import { categories } from '@/lib/mock-data';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export default function CategoryGrid() {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-xl font-bold mb-4">Kategori</h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-4 md:grid-cols-8 gap-3"
        >
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Heart;
            return (
              <motion.div key={category.id} variants={item}>
                <Link
                  href={`/category/${category.id}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${category.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-1">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

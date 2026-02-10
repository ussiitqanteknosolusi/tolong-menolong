'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLoading } from '@/lib/loading-context';

export default function LoadingLink({ href, children, className, onClick, ...props }) {
  const { startLoading } = useLoading();

  const handleClick = (e) => {
    // Don't show loading for same page or anchor links
    if (href === window.location.pathname || href.startsWith('#')) {
      return;
    }
    startLoading();
    if (onClick) onClick(e);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SlideUpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxHeight?: string;
  className?: string;
}

export default function SlideUpDrawer({
  isOpen,
  onClose,
  children,
  title = "Mission Control",
  maxHeight = "80vh",
  className
}: SlideUpDrawerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle touch start for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  // Handle touch move for dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.touches[0].clientY - startY;
    setCurrentY(e.touches[0].clientY);
    
    if (drawerRef.current) {
      const rect = drawerRef.current.getBoundingClientRect();
      const newHeight = Math.max(0, rect.height - deltaY);
      setDrawerHeight(newHeight);
    }
  };

  // Handle touch end for dragging
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged down more than 100px, close the drawer
    if (currentY - startY > 100) {
      onClose();
    } else {
      // Snap back to full height
      setDrawerHeight(0);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Reset height when drawer opens
  useEffect(() => {
    if (isOpen) {
      setDrawerHeight(0);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Calculate drawer style
  const getDrawerStyle = () => {
    if (!isOpen) return { transform: 'translateY(100%)' };
    
    const baseHeight = contentRef.current?.scrollHeight || 400;
    const actualHeight = drawerHeight > 0 ? drawerHeight : baseHeight;
    
    return {
      height: `${Math.min(actualHeight, parseInt(maxHeight))}px`,
      transform: drawerHeight > 0 ? 'translateY(0)' : 'translateY(0)'
    };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
          style={{ backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-purple-900/95 to-space-950/95",
          "rounded-t-3xl shadow-2xl border-t border-purple-500/20",
          "transition-all duration-300 ease-out",
          className
        )}
        style={getDrawerStyle()}
      >
        {/* Drag Handle */}
        <div
          className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-purple-400/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="overflow-y-auto"
          style={{ maxHeight: `calc(${maxHeight} - 120px)` }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

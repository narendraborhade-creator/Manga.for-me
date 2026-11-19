"use client";

import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Play, Menu, X, Sparkles } from 'lucide-react';

export interface NavLink {
  label: string;
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
  isActive?: boolean;
}

export interface Partner {
  logoUrl?: string;
  name?: string;
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
}

export interface ResponsiveHeroBannerProps {
  logoUrl?: string;
  logoText?: string;
  onLogoClick?: () => void;
  backgroundImageUrl?: string;
  navLinks?: NavLink[];
  ctaButtonText?: string;
  ctaButtonHref?: string;
  onCtaClick?: () => void;
  badgeText?: string;
  badgeLabel?: string;
  title?: string;
  titleLine2?: string;
  onTitleClick?: () => void;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  onSecondaryClick?: () => void;
  partnersTitle?: string;
  partners?: Partner[];
  className?: string;
}

export const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  logoUrl,
  logoText = "KuroNeko",
  onLogoClick,
  backgroundImageUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=2000&auto=format&fit=crop",
  navLinks = [
    { label: "Home", href: "#", isActive: true },
    { label: "Manga Catalog", href: "#" },
    { label: "Trending Webtoons", href: "#" },
    { label: "Latest Chapters", href: "#" },
    { label: "Library", href: "#" }
  ],
  ctaButtonText = "Start Reading",
  ctaButtonHref: _ctaButtonHref = "#",
  onCtaClick,
  badgeLabel = "Featured",
  badgeText = "Next-Gen Manga & Webtoon Reader 2026",
  title = "Infinite Stories Await",
  titleLine2 = "Beyond the Horizon",
  onTitleClick,
  description = "Immerse yourself in thousands of official webtoons and mangas with ultra-crisp reader rendering, zero-lag chapter caching, and seamless cross-platform syncing.",
  primaryButtonText = "Explore Catalog",
  primaryButtonHref: _primaryButtonHref = "#",
  onPrimaryClick,
  secondaryButtonText = "Watch Spotlight",
  secondaryButtonHref: _secondaryButtonHref = "#",
  onSecondaryClick,
  partnersTitle = "Supported by top manga & webtoon archives worldwide",
  partners = [
    { name: "WeebCentral", href: "#" },
    { name: "MangaKatana", href: "#" },
    { name: "MangaDex", href: "#" },
    { name: "Asura Scans", href: "#" },
    { name: "Flame Comics", href: "#" }
  ],
  className = ""
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className={`w-full isolate min-h-[85vh] lg:min-h-screen overflow-hidden relative flex flex-col justify-between ${className}`}>
      {/* Background Image with Unsplash Stock & Gradient Overlays */}
      <img
        src={backgroundImageUrl}
        alt="Hero Background"
        loading="eager"
        fetchPriority="high"
        className="w-full h-full object-cover object-center absolute inset-0 filter brightness-[0.38] contrast-[1.08] scale-102 transition-transform duration-1000"
      />
      
      {/* Subtle vignette + gradient protection for text contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a11] via-[#080a11]/60 to-[#080a11]/40" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />

      {/* Header Navigation */}
      <header className="z-20 xl:top-4 relative w-full">
        <div className="max-w-7xl mx-auto px-6 pt-5">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <button
              type="button"
              onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
              className="inline-flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              {logoUrl ? (
                <div
                  className="w-[100px] h-[40px] bg-center bg-cover rounded transition-transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${logoUrl})` }}
                  role="img"
                  aria-label={logoText}
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
                  <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span className="text-lg font-bold tracking-tight text-white font-sans">
                    {logoText}
                  </span>
                </div>
              )}
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-xl shadow-lg shadow-black/20">
                {navLinks.map((link, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={(e) => {
                      if (link.onClick) {
                        e.preventDefault();
                        link.onClick(e);
                      }
                    }}
                    className={`px-3.5 py-1.5 text-sm font-medium hover:text-white font-sans transition-all rounded-full cursor-pointer focus:outline-none ${
                      link.isActive 
                        ? 'text-white bg-white/15 shadow-sm font-semibold' 
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    if (onCtaClick) {
                      e.preventDefault();
                      onCtaClick();
                    }
                  }}
                  className="ml-1.5 inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 text-sm font-semibold font-sans transition-all hover:shadow-lg hover:shadow-rose-500/25 active:scale-95 cursor-pointer focus:outline-none"
                >
                  {ctaButtonText}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </nav>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#0e1220]/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-2 animate-fade-slide-in-1">
              {navLinks.map((link, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (link.onClick) {
                      e.preventDefault();
                      link.onClick(e);
                    }
                  }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    link.isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (onCtaClick) {
                    e.preventDefault();
                    onCtaClick();
                  }
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-sm font-semibold transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {ctaButtonText}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="z-10 relative flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 sm:pt-24 lg:pt-28 text-center">
          <div className="mx-auto max-w-3xl">
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/20 backdrop-blur-md shadow-inner animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-900 bg-white rounded-full py-0.5 px-2.5 font-sans shadow-sm">
                {badgeLabel}
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/95 font-sans">
                {badgeText}
              </span>
            </div>

            {/* Hero Heading */}
            <h1 
              onClick={onTitleClick}
              className={`text-4xl sm:text-6xl md:text-7xl font-normal leading-tight text-white tracking-tight font-instrument-serif animate-fade-slide-in-2 drop-shadow-md ${onTitleClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            >
              {title}
              <br className="hidden sm:block" />
              {" "}
              <span className="italic bg-gradient-to-r from-white via-rose-100 to-rose-300 bg-clip-text text-transparent">
                {titleLine2}
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed font-sans animate-fade-slide-in-3">
              {description}
            </p>

            {/* Interactive Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:gap-4 mt-8 gap-3 items-center justify-center animate-fade-slide-in-4">
              <button
                type="button"
                onClick={(e) => {
                  if (onPrimaryClick) {
                    e.preventDefault();
                    onPrimaryClick();
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/30 ring-1 ring-rose-400/30 rounded-full py-3.5 px-7 font-sans transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
              >
                {primaryButtonText}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  if (onSecondaryClick) {
                    e.preventDefault();
                    onSecondaryClick();
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white font-sans transition-all duration-200 hover:scale-102 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                {secondaryButtonText}
              </button>
            </div>
          </div>

          {/* Social Proof / Partner Providers Bar */}
          <div className="mx-auto mt-16 max-w-5xl">
            <p className="animate-fade-slide-in-1 text-xs uppercase tracking-widest text-white/60 font-semibold text-center">
              {partnersTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 animate-fade-slide-in-2">
              {partners.map((partner, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={(e) => {
                    if (partner.onClick) {
                      e.preventDefault();
                      partner.onClick(e);
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={partner.logoUrl ? { backgroundImage: `url(${partner.logoUrl})`, backgroundSize: 'cover', minWidth: '100px', height: '32px' } : undefined}
                >
                  {partner.name || `Partner ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;

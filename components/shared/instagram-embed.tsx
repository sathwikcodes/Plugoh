"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { Instagram, ExternalLink } from "lucide-react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface InstagramEmbedProps {
  permalink: string;
  className?: string;
}

let scriptLoaded = false;

export function InstagramEmbed({ permalink, className }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!permalink) return;

    // Process embed once script is available
    const process = () => {
      try {
        window.instgrm?.Embeds.process();
      } catch {
        // Embed processing failed — the blockquote fallback link remains visible
      }
    };

    if (window.instgrm) {
      const timer = setTimeout(process, 100);
      return () => clearTimeout(timer);
    }

    // If script not loaded yet, wait for it
    const checkInterval = setInterval(() => {
      if (window.instgrm) {
        clearInterval(checkInterval);
        process();
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 8000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [permalink]);

  // Normalize permalink — ensure it ends with /
  const normalizedPermalink = permalink.endsWith("/")
    ? permalink
    : `${permalink}/`;

  if (!permalink) {
    return (
      <div className={className}>
        <a
          href="#"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center"
        >
          <Instagram className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            Post unavailable
          </p>
        </a>
      </div>
    );
  }

  return (
    <>
      {!scriptLoaded && (
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
          onLoad={() => {
            scriptLoaded = true;
            setTimeout(() => window.instgrm?.Embeds.process(), 100);
          }}
        />
      )}
      <div ref={containerRef} className={className}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={normalizedPermalink}
          data-instgrm-version="14"
          data-instgrm-captioned=""
          style={{
            background: "#FFF",
            border: 0,
            borderRadius: "16px",
            boxShadow:
              "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
            margin: "0 auto",
            maxWidth: "540px",
            minWidth: "280px",
            width: "100%",
          }}
        >
          <a
            href={normalizedPermalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500"
          >
            <Instagram className="h-5 w-5 text-slate-400" />
            Loading post...
            <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
          </a>
        </blockquote>
      </div>
    </>
  );
}


import React, { useState, useEffect } from 'react';
import { getEmbedUrl, resolveVideoUrl, getVideoId } from '../utils/videoHelpers';

interface VideoEmbedProps {
  url: string;
  autoplay?: boolean;
  muted?: boolean;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, autoplay = false, muted = false }) => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveUrl = async () => {
      let finalUrl = url;
      if (!finalUrl) {
        setIsLoading(false);
        return;
      }

      // Strip potential [Label] from the URL
      const match = finalUrl.match(/\[(.*?)\]\s*(.*)/);
      if (match) {
        finalUrl = match[2].trim();
      }

      // Check if it's a vanity URL that needs resolution
      const { type, id } = getVideoId(finalUrl);
      const isVimeoVanity = type === 'vimeo' && id && !/^\d+$/.test(id);

      if (isVimeoVanity) {
        // Resolve vanity URL first
        try {
          const resolved = await resolveVideoUrl(finalUrl);
          const embed = getEmbedUrl(resolved, autoplay, muted);
          setEmbedUrl(embed);
        } catch (error) {
          console.error('Failed to resolve vanity URL:', error);
          setEmbedUrl(null);
        }
      } else {
        // Direct URL works
        const embed = getEmbedUrl(finalUrl, autoplay, muted);
        setEmbedUrl(embed);
      }

      setIsLoading(false);
    };

    resolveUrl();
  }, [url, autoplay, muted]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white/50">Loading video...</div>
      </div>
    );
  }

  if (!embedUrl) return null;

  return (
    <div className="w-full h-full bg-black absolute inset-0">
      <iframe
        src={embedUrl}
        className="w-full h-full absolute inset-0"
        frameBorder="0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

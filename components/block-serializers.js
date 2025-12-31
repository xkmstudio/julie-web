import React from "react";

import { PortableText } from "@portabletext/react";
import CustomLink from "@components/link";
import Photo from "@components/photo";

const createMarks = (onFrameLinkClick = null) => ({
  strong: ({ children }) => <strong className="font-700">{children}</strong>,
  em: ({ children }) => <em className="">{children}</em>,
  center: ({ children }) => (
    <span className="text-center block">{children}</span>
  ),
  link: ({ value, children }) => {
    // Prefer explicit linkType if present
    if (value.linkType === "external" && value.url) {
      return (
        <CustomLink
          className="link-inline"
          link={{
            _type: "navLink",
            url: value.url,
            title: children,
          }}
          onFrameLinkClick={onFrameLinkClick}
        />
      );
    }
    if (value.page) {
      return (
        <CustomLink
          className="link-inline"
          link={{
            _type: "navPage",
            page: {
              type: value.page.type,
              slug: { current: value.page.slug },
              isHome: value.page.isHome,
            },
            title: children,
          }}
          onFrameLinkClick={onFrameLinkClick}
        />
      );
    }
    if (value.url) {
      // fallback for url-only links
      return (
        <CustomLink
          className="link-inline"
          link={{
            _type: "navLink",
            url: value.url,
            title: children,
          }}
          onFrameLinkClick={onFrameLinkClick}
        />
      );
    }
    return null;
  },
});

const Marks = createMarks();

export const portableTextInline = {
  block: {
    h4: ({ children }) => <h4 className="">{children}</h4>,
    mono: ({ children }) => <p className="font-mono">{children}</p>,
    normal: ({ children }) => <p className="">{children}</p>,
  },
  marks: Marks,
};

export const portableRichText = {
  block: {
    h1: ({ children }) => <h1 className="title-2xl">{children}</h1>,
    h2: ({ children }) => <h2 className="title-md">{children}</h2>,
    h3: ({ children }) => <h3 className="title-md">{children}</h3>,
    h4: ({ children }) => <h4 className="title-sm">{children}</h4>,
    h5: ({ children }) => <h5 className="">{children}</h5>,
    h6: ({ children }) => <h6 className="">{children}</h6>,
    normal: ({ children }) => <p className="">{children}</p>,
    large: ({ children }) => <p className="body-large">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="">{children}</ul>,
    number: ({ children }) => <ol className="">{children}</ol>,
  },
  listItem: ({ children }) => <li className="">{children}</li>,
  types: {
    photo: ({ value }) => {
      return <Photo photo={value} />;
    },
    // Image component for Sanity image type
    image: ({ value }) => {
      if (!value?.asset) {
        console.warn('Image missing asset data:', value);
        return null;
      }
      
      return (
        <div className="content-image my-40">
          <Photo 
            photo={value} 
            width={800}
            height={800}
            srcSizes={[400, 600, 800]}
            sizes="(max-width: 768px) 100vw, 800px"
            className="rounded-[1.5rem] overflow-hidden"
          />
          {value.caption && (
            <div className="caption w-full text-center mt-15">
              {value.caption}
            </div>
          )}
        </div>
      );
    },
    // YouTube video component
    youtubeVideo: ({ value }) => {
      if (!value?.url) {
        console.warn('YouTube video missing URL:', value);
        return null;
      }
      
      // Extract video ID from various YouTube URL formats
      const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYouTubeId(value.url);
      
      if (!videoId) {
        console.warn('Could not extract video ID from URL:', value.url);
        return (
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-600">Invalid YouTube URL</p>
          </div>
        );
      }
      
      return (
        <div className="relative w-full aspect-video mb-6">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
          />
        </div>
      );
    },
    // Block quote component
    blockQuote: ({ value }) => {
      return (
        <blockquote className="blockquote">
          <div className="mb-4">
            {value.quote && <PortableText value={value.quote} components={portableRichText} />}
          </div>
          {(value.credit || value.role) && (
            <footer>
              {value.credit && <span className="font-semibold">{value.credit}</span>}
              {value.credit && value.role && <span> • </span>}
              {value.role && <span>{value.role}</span>}
            </footer>
          )}
        </blockquote>
      );
    },
    // Carousel component
    carousel: ({ value }) => {
      if (!value.slides || value.slides.length === 0) return null;
      
      return (
        <div className="content-carousel">
          <div className="carousel-slides">
            {value.slides.map((slide, index) => {
              if (!slide?.asset) {
                console.warn('Carousel slide missing asset data:', slide);
                return null;
              }
              
              return (
                <div key={index} className="carousel-slide">
                  <Photo 
                    photo={slide} 
                    width={320}
                    height={240}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
  marks: Marks,
};

// Factory function to create serializers with frame link handler
export const createPortableTextSerializers = (onFrameLinkClick = null) => {
  const marksWithFrameHandler = createMarks(onFrameLinkClick);
  
  return {
    ...portableRichText,
    marks: marksWithFrameHandler,
  };
};

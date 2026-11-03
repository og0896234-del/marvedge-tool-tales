import type { ReactNode } from "react";
import { FaviconGenerator, FormatConverter, ImageCompressor, ImageResizer, PdfTool, QrGenerator } from "./ImageTools";
import { AspectRatio, GifCompressor, Mp4ToGif, VideoCompressor } from "./VideoTools";
import { LinkShortener } from "./LinkShortener";
import { AiTextTool, ScreenshotGuide, SubtitleGenerator, VoiceoverGenerator } from "./AiTools";

export function ToolWorkspace({ slug }: { slug: string }): ReactNode {
  switch (slug) {
    case "mp4-to-gif": return <Mp4ToGif />;
    case "image-compressor": return <ImageCompressor />;
    case "qr-code-generator": return <QrGenerator />;
    case "video-compressor": return <VideoCompressor />;
    case "gif-compressor": return <GifCompressor />;
    case "image-resizer": return <ImageResizer />;
    case "image-format-converter": return <FormatConverter />;
    case "pdf-merger": return <PdfTool />;
    case "favicon-generator": return <FaviconGenerator />;
    case "link-shortener": return <LinkShortener />;
    case "video-aspect-ratio": return <AspectRatio />;
    case "screenshot-to-guide": return <ScreenshotGuide />;
    case "subtitle-generator": return <SubtitleGenerator />;
    case "voiceover-generator": return <VoiceoverGenerator />;
    default: return <AiTextTool slug={slug} />;
  }
}

export const MARVEDGE_URL = "https://marvedge.com/";

export type Tool = {
  slug: string;
  path: string;
  name: string;
  category: "Free utility" | "AI tool";
  tagline: string;
  headline: [string, string];
  sub: string;
  story: [string, string, string];
  features: string[];
  audience: string;
  related: string[];
};

const t = (x: Omit<Tool, "path">): Tool => ({ ...x, path: `/${x.slug}` });

export const tools: Tool[] = [
  t({ slug: "mp4-to-gif", name: "MP4 to GIF", category: "Free utility", tagline: "Turn any clip into a looping GIF.",
    headline: ["Your best 3 seconds,", "looping forever."], sub: "Trim, resize and set frame rate — then drop a crisp GIF into docs, tickets and tweets.",
    story: ["You recorded a perfect product moment, but nobody clicks a 40MB video link.", "Trim the exact beat, pick width and FPS, and preview it live — right in your browser.", "Your GIF plays inline everywhere. Now imagine the whole demo doing that."],
    features: ["Trim start & end", "Width and FPS controls", "Live preview", "Quality vs size slider"], audience: "Creators, marketers, support teams", related: ["gif-compressor", "video-compressor"] }),
  t({ slug: "image-compressor", name: "Image Compressor", category: "Free utility", tagline: "Same image. A fraction of the weight.",
    headline: ["Heavy images,", "made weightless."], sub: "Compress JPG, PNG and WebP in batches with a before/after preview. Files never leave your device.",
    story: ["Your page loads like it's 2009 because one hero image weighs 4MB.", "Slide the quality bar and watch kilobytes melt while the pixels stay sharp.", "Faster pages, happier visitors, better rankings — in seconds."],
    features: ["JPG / PNG / WebP", "Batch processing", "Before/after preview", "Size-saved report"], audience: "Website owners, bloggers, ecommerce", related: ["image-format-converter", "image-resizer"] }),
  t({ slug: "qr-code-generator", name: "QR Code Generator & Printer", category: "Free utility", tagline: "One scan from offline to online.",
    headline: ["Print it once.", "Connect forever."], sub: "Create QR codes for URLs, text or Wi-Fi, style them in your colors, export PNG or SVG — then print them at any millimetre size on A4, A5, A6 or Letter.",
    story: ["Customers see your flyer, then forget your URL by the next street.", "Generate a branded QR in your colors for a link, a note, or your Wi-Fi — then lay it out on paper with borders, captions and as many copies as you need.", "Every poster, card, table and package becomes a doorway to your product."],
    features: ["URL, text & Wi-Fi", "Custom colors, frames & logo", "PNG & SVG export", "Print sheets: exact mm, A4–Letter, copies"], audience: "Small businesses, marketers, founders, restaurants, events", related: ["favicon-generator", "link-shortener"] }),
  t({ slug: "video-compressor", name: "Video Compressor", category: "Free utility", tagline: "Share video without the size wall.",
    headline: ["Shrink the file,", "keep the story."], sub: "Lower resolution and bitrate with target-size guidance and an output preview before you download.",
    story: ["Email says no. Slack says no. Your 600MB screen recording is stuck.", "Pick a target size and quality — preview the result before committing.", "It sends on the first try. Your message lands while it still matters."],
    features: ["MP4 upload", "Resolution & quality", "Target-size guidance", "Output preview"], audience: "Creators, teams sharing video", related: ["mp4-to-gif", "video-aspect-ratio"] }),
  t({ slug: "gif-compressor", name: "GIF Compressor", category: "Free utility", tagline: "Lighter loops, same charm.",
    headline: ["Keep the loop.", "Lose the weight."], sub: "Resize, drop frames and optimize the palette — with a clear before/after size comparison.",
    story: ["Your GIF is great. It's also 18MB and refuses to upload.", "Trim frames, shrink the palette, resize — and watch the size counter fall.", "Same vibe, a fraction of the file. Ready for every community."],
    features: ["Resize", "Frame reduction", "Palette optimization", "Size comparison"], audience: "Creators, community managers", related: ["mp4-to-gif", "image-compressor"] }),
  t({ slug: "image-resizer", name: "Image Resizer & Cropper", category: "Free utility", tagline: "Every size, every platform.",
    headline: ["Perfect fit,", "every platform."], sub: "Custom dimensions, aspect lock, document-upload presets and a target file size you can actually hit.",
    story: ["Instagram wants square, LinkedIn wants wide, the portal wants 20KB.", "Choose a preset or custom size, set the portal's KB limit, and the file is tuned until it lands under it.", "One upload, every format you need — no rejections, no guesswork."],
    features: ["Aspect-ratio lock", "Document-upload presets", "Target file size (KB)", "Live size report"], audience: "Creators, ecommerce, applicants", related: ["image-compressor", "favicon-generator"] }),
  t({ slug: "image-format-converter", name: "Image Format Converter", category: "Free utility", tagline: "JPG, PNG, WebP — fluently.",
    headline: ["Any format", "you need, instantly."], sub: "Convert between JPG, PNG and WebP in batches with transparency handling and ZIP download.",
    story: ["The CMS wants WebP. The designer sent PNG. The client has JPG.", "Drop them all in, pick the target format, keep transparency intact.", "One ZIP, every file converted. Back to the work that matters."],
    features: ["JPG / PNG / WebP", "Batch conversion", "Transparency safe", "ZIP download"], audience: "Designers, developers, site owners", related: ["image-compressor", "image-resizer"] }),
  t({ slug: "pdf-merger", name: "PDF Merger & Splitter", category: "Free utility", tagline: "Pages in exactly the right order.",
    headline: ["Many PDFs.", "One clean story."], sub: "Merge files, reorder pages, extract ranges and preview — all privately in your browser.",
    story: ["Five attachments, three versions, and nobody knows which page is final.", "Drag pages into order, merge files, or split out exactly what you need.", "One tidy document that tells the whole story, start to finish."],
    features: ["Merge files", "Reorder pages", "Extract ranges", "Private preview"], audience: "Students, office workers, small businesses", related: ["image-format-converter", "screenshot-to-guide"] }),
  t({ slug: "favicon-generator", name: "Favicon Generator", category: "Free utility", tagline: "Your brand, in 16 pixels.",
    headline: ["Tiny icon.", "Big first impression."], sub: "Upload a logo, crop it and generate every icon size with a live browser-tab preview.",
    story: ["Your launch is tomorrow and the browser tab still shows a blank globe.", "Upload your logo, crop it, and preview it in a real tab instantly.", "Download the full icon pack. Your brand shows up everywhere it should."],
    features: ["Upload & crop", "All common sizes", "Tab preview", "Icon package"], audience: "Developers, indie hackers, startups", related: ["qr-code-generator", "image-resizer"] }),
  t({ slug: "video-aspect-ratio", name: "Video Aspect Ratio Changer", category: "Free utility", tagline: "One video. Every screen.",
    headline: ["Landscape, portrait,", "square. Done."], sub: "Reframe video to 16:9, 9:16 or 1:1 with padding or crop — ready for every feed.",
    story: ["You filmed widescreen. Reels, Shorts and TikTok all want vertical.", "Pick 16:9, 9:16 or 1:1 and choose blur-fill, padding or smart crop.", "The same story, framed perfectly for every feed it lands in."],
    features: ["16:9, 9:16, 1:1", "Crop or pad", "Background fill", "Quick export"], audience: "Video creators, social teams", related: ["video-compressor", "subtitle-generator"] }),
  t({ slug: "link-shortener", name: "Link Shortener", category: "Free utility", tagline: "Long links, made tiny.",
    headline: ["Long link in,", "short link out."], sub: "Create short links with a custom name, an expiry date and optional password protection.",
    story: ["Your link is 240 characters of tracking codes and nobody trusts it.", "Pick a custom name, set when it expires, and lock it with a password if it's private.", "A clean link people actually click — and it disappears exactly when you want."],
    features: ["Custom links", "Expiration", "Password protection", "Instant copy"], audience: "Marketers, creators, teams", related: ["qr-code-generator", "content-repurposer"] }),
  t({ slug: "video-summarizer", name: "AI Video Summarizer", category: "AI tool", tagline: "An hour of video, in a minute.",
    headline: ["Watch less.", "Know more."], sub: "Summarize transcripts or supported video into key points and chapters, when the source supports timestamps.",
    story: ["The webinar is 74 minutes. You have the time it takes coffee to cool.", "AI distills it into key points and chapters you can actually skim.", "You walk into the meeting knowing everything that mattered."],
    features: ["Key points", "Chapters & timestamps", "Transcript input", "Copy-ready output"], audience: "Students, professionals, creators", related: ["content-repurposer", "subtitle-generator"] }),
  t({ slug: "subtitle-generator", name: "AI Subtitle & Caption Generator", category: "AI tool", tagline: "Every word, on screen, on time.",
    headline: ["85% watch muted.", "Speak to them anyway."], sub: "Transcribe speech, edit subtitles, fix timing and export SRT or VTT.",
    story: ["Most social video plays on silent — your message plays to no one.", "AI transcribes every word; you tweak lines and timing in a simple editor.", "Captions that hook scrollers and make every video accessible."],
    features: ["Speech transcription", "Subtitle editor", "SRT / VTT export", "Timing correction"], audience: "Creators, marketers, agencies", related: ["voiceover-generator", "video-aspect-ratio"] }),
  t({ slug: "youtube-title-generator", name: "AI YouTube Title & Description", category: "AI tool", tagline: "Titles people can't scroll past.",
    headline: ["Great video.", "Now make them click."], sub: "Generate titles, descriptions, hooks and calls-to-action from a topic or transcript.",
    story: ["You spent ten hours editing — and thirty seconds on the title.", "Feed in your topic or transcript and get hooks, titles and descriptions.", "The thumbnail gets the glance; your title gets the click."],
    features: ["Title options", "SEO descriptions", "Hooks", "Calls to action"], audience: "YouTubers, creators", related: ["content-repurposer", "video-summarizer"] }),
  t({ slug: "content-repurposer", name: "AI Content Repurposer", category: "AI tool", tagline: "Write once. Publish everywhere.",
    headline: ["One idea.", "Ten channels."], sub: "Turn a blog or transcript into LinkedIn posts, short social posts, captions and a newsletter draft.",
    story: ["You wrote a brilliant post. It lived for one afternoon.", "AI reshapes it into posts, captions and a newsletter in your voice.", "One idea now works all week across every channel you own."],
    features: ["LinkedIn posts", "Short social posts", "Captions", "Newsletter draft"], audience: "Founders, creators, agencies", related: ["youtube-title-generator", "product-description-generator"] }),
  t({ slug: "product-description-generator", name: "AI Product Description", category: "AI tool", tagline: "Copy that sells while you sleep.",
    headline: ["Features tell.", "Stories sell."], sub: "Create product descriptions, feature bullets and tone variants from your product details.",
    story: ["Your product is great. Its listing says “high quality, good price.”", "Add the details; AI writes benefit-led copy and bullets in any tone.", "Shoppers finally see what you see — and hit add to cart."],
    features: ["Descriptions", "Feature bullets", "Tone variants", "Brand voice"], audience: "Ecommerce sellers, small businesses", related: ["content-repurposer", "demo-script-generator"] }),
  t({ slug: "screenshot-to-guide", name: "AI Screenshot-to-Guide", category: "AI tool", tagline: "Screenshots in. Step-by-step guide out.",
    headline: ["Stop explaining.", "Start showing."], sub: "Combine screenshots and short notes into ordered steps, tutorial text and an SOP draft you review.",
    story: ["You've explained the same workflow eight times this week.", "Drop in screenshots with quick notes — AI orders the steps and writes the guide.", "Review, share, done. Next time, just send the link."],
    features: ["Ordered steps", "Tutorial text", "SOP drafts", "Human review"], audience: "SaaS teams, support, operations", related: ["demo-script-generator", "pdf-merger"] }),
  t({ slug: "voiceover-generator", name: "AI Voiceover Generator", category: "AI tool", tagline: "A studio voice, no studio.",
    headline: ["Type it.", "Hear it come alive."], sub: "Turn text into natural speech, pick a voice, preview and download audio where permitted.",
    story: ["Your script is ready. Your mic, your room and your nerves are not.", "Paste the script, choose a voice and preview it instantly.", "Professional narration for demos, lessons and ads in minutes."],
    features: ["Text to speech", "Voice selection", "Instant preview", "Audio download"], audience: "Creators, educators, marketers", related: ["subtitle-generator", "demo-script-generator"] }),
  t({ slug: "demo-script-generator", name: "AI Product Demo Script", category: "AI tool", tagline: "The demo that closes the deal.",
    headline: ["Every great demo", "starts with a script."], sub: "Turn a product description or feature list into a demo outline, scenes, narration and CTA.",
    story: ["Your demo rambles. Prospects nod politely, then go quiet.", "Describe your product; AI builds the outline, scenes, narration and CTA.", "A tight story that shows value fast — then let Marvedge turn it into a demo."],
    features: ["Demo outline", "Scene sequence", "Narration", "Closing CTA"], audience: "SaaS founders, sales, marketing", related: ["screenshot-to-guide", "voiceover-generator"] }),
];

export const getTool = (slug: string): Tool => {
  const tool = tools.find((x) => x.slug === slug);
  if (!tool) throw new Error(`Unknown tool ${slug}`);
  return tool;
};

export type InsightArt = "loop" | "palette" | "resize" | "scan" | "film" | "file" | "spark" | "voice" | "text" | "steps" | "shop" | "frame";
export type ToolInsight = { kind: "fact" | "quote"; title: string; text: string; art: InsightArt };
type Entry = [title: string, text: string, art: InsightArt];
const collection = (facts: [Entry, Entry, Entry], quotes: [Entry, Entry]): ToolInsight[] => [
  ...facts.map(([title, text, art]) => ({ kind: "fact" as const, title, text, art })),
  ...quotes.map(([title, text, art]) => ({ kind: "quote" as const, title, text, art })),
];

// Evergreen format facts and original Marvedge one-liners, not celebrity quotations.
export const toolInsights: Record<string, ToolInsight[]> = {
  "mp4-to-gif": collection([
    ["The silent movie star", "GIFs don't carry audio. Your brilliant soundtrack gets the day off.", "voice"],
    ["A flipbook in disguise", "An animated GIF plays a sequence of images, like a tiny digital flipbook.", "film"],
    ["More frames, more baggage", "Extra frames add image data. A shorter loop can be both punchier and lighter.", "loop"],
  ], [
    ["The encore", "If it was funny once, let it audition for forever.", "loop"],
    ["Tiny cinema", "Three seconds. Zero dialogue. Surprisingly strong main-character energy.", "film"],
  ]),
  "image-compressor": collection([
    ["Pixels aren't kilograms", "Two images with the same dimensions can have very different file sizes. Format and detail matter.", "resize"],
    ["A one-way suitcase", "Lossy compression discards some image information. Saving it again won't bring that detail back.", "file"],
    ["The tidy-room effect", "Flat colors often compress more easily than noisy, highly detailed images.", "palette"],
  ], [
    ["Travel light", "Your photo needs a carry-on, not a moving truck.", "file"],
    ["Less baggage", "Big personality. Small attachment.", "spark"],
  ]),
  "qr-code-generator": collection([
    ["Corners with a job", "Those three large corner squares help scanners locate and orient a QR code.", "scan"],
    ["Built-in backup", "QR error correction can recover some damaged data. It's not permission to cover half the code.", "file"],
    ["Personal space, please", "A clear border around a QR code helps scanners tell it apart from its surroundings.", "frame"],
  ], [
    ["Shortcut to somewhere", "A tiny square with a surprisingly busy social life.", "scan"],
    ["No spelling bee", "Why type a long URL when your camera can do the introductions?", "text"],
  ]),
  "video-compressor": collection([
    ["Time has weight", "At the same bitrate, a longer video needs more data. Even files pay rent by the minute.", "film"],
    ["Bitrate is the budget", "Bitrate describes data used per second. Lowering it can reduce size, but may also reduce detail.", "resize"],
    ["Resolution isn't everything", "Codec, motion and bitrate also affect file size. Two 1080p videos needn't weigh the same.", "frame"],
  ], [
    ["Inbox peace treaty", "Keep the plot twist. Lose the attachment drama.", "file"],
    ["Lightweight champion", "Your video can be impressive without bench-pressing the upload limit.", "film"],
  ]),
  "gif-compressor": collection([
    ["A small paint box", "Each GIF color table holds up to 256 colors. Gradients can make that limit noticeable.", "palette"],
    ["Loops aren't extra copies", "A looping instruction repeats playback; it doesn't store a fresh copy for every replay.", "loop"],
    ["The frame trade-off", "Dropping frames reduces image data, but too many missing frames can make motion look jumpy.", "film"],
  ], [
    ["Loop responsibly", "Same joke. Fewer megabytes. Excellent comedic timing.", "loop"],
    ["GIF gym", "My GIF's fitness plan? Fewer frames, more charm.", "resize"],
  ]),
  "image-resizer": collection([
    ["Pixels versus paperwork", "Pixel dimensions and KB are different measurements. A portal can check both independently.", "resize"],
    ["No magic zoom", "Making an image larger adds pixels, not missing original detail. Tiny photos aren't secret billboards.", "frame"],
    ["Crop isn't squash", "Cropping removes edges; stretching changes proportions. Your face usually prefers the first option.", "frame"],
  ], [
    ["Portal diplomacy", "My photo and the upload limit are finally on speaking terms.", "file"],
    ["A perfect fit", "Dress for the dimensions you want, not the dimensions you have.", "resize"],
  ]),
  "image-format-converter": collection([
    ["The invisible background", "PNG and WebP support transparency. Standard JPEG doesn't, so transparent areas need a background.", "palette"],
    ["A name isn't a makeover", "Renaming .png to .jpg doesn't convert the image data. Files aren't fooled by a new name tag.", "file"],
    ["Two WebP personalities", "WebP supports both lossy and lossless compression. The format isn't a single quality setting.", "spark"],
  ], [
    ["Format translator", "Same picture, different passport.", "file"],
    ["Group chat peace", "The designer speaks PNG. The website speaks WebP. I speak both.", "palette"],
  ]),
  "pdf-merger": collection([
    ["Portable by name", "PDF stands for Portable Document Format. Its whole thing is keeping a document's layout together.", "file"],
    ["Scans aren't always text", "A scanned PDF may contain page images rather than searchable words. OCR is a separate step.", "text"],
    ["Order matters", "Merging combines pages in the chosen order; it doesn't decide which invoice belongs before the report.", "steps"],
  ], [
    ["Attachment reunion", "Five PDFs walk into an inbox. One organized document walks out.", "file"],
    ["Page management", "Not every page needs to attend this meeting.", "steps"],
  ]),
  "favicon-generator": collection([
    ["Small stage, big role", "Favicons help identify a site in browser tabs and bookmarks. Tiny doesn't mean unemployed.", "frame"],
    ["The detail diet", "Fine text and intricate shapes can disappear at small icon sizes. Simple silhouettes hold up better.", "spark"],
    ["One size isn't all", "Browsers and device shortcuts can use different icon sizes, so an icon pack provides multiple versions.", "resize"],
  ], [
    ["Tab celebrity", "Sixteen pixels of pure main-character energy.", "spark"],
    ["Find me", "In a browser full of tabs, be the one wearing a recognizable hat.", "frame"],
  ]),
  "video-aspect-ratio": collection([
    ["Same ratio, different size", "16:9 describes a proportion, not a resolution. Many different pixel dimensions can share that shape.", "resize"],
    ["Crop versus cushion", "Cropping fills a new frame by removing edges. Padding keeps the picture and adds space around it.", "frame"],
    ["Rotation isn't reframing", "Rotating a landscape video turns its subjects sideways. Reframing changes the canvas without that acrobatics.", "film"],
  ], [
    ["Screen wardrobe", "One video. Three outfits. No reshoot.", "frame"],
    ["Stay in the picture", "Vertical ambition. Horizontal origins.", "resize"],
  ]),
  "video-summarizer": collection([
    ["Words aren't the whole show", "A transcript-based summary can't see a chart or a silent demonstration unless the text describes it.", "film"],
    ["Timestamps need a clock", "Reliable chapter times need timing information from the source. Plain text doesn't secretly contain a stopwatch.", "steps"],
    ["Shorter isn't infallible", "AI summaries can miss nuance or make mistakes. Important claims deserve a look at the original.", "text"],
  ], [
    ["Coffee-length edition", "All the key points, before the coffee becomes iced coffee.", "spark"],
    ["The highlight reel", "I came for the insight, not the twenty-minute introduction.", "film"],
  ]),
  "subtitle-generator": collection([
    ["Two jobs, one screen", "Subtitles often represent dialogue; accessibility captions can also describe sounds and speaker changes.", "voice"],
    ["Timing is part of the text", "SRT and VTT store timed text cues. The right words at the wrong moment still need fixing.", "steps"],
    ["Names need a second look", "Speech recognition can stumble on names, accents and background noise. A quick review goes a long way.", "text"],
  ], [
    ["Silent-mode solidarity", "For everyone watching beside a sleeping baby: you're welcome.", "voice"],
    ["Words with stage presence", "Let the dialogue show up, even when the speakers don't.", "text"],
  ]),
  "youtube-title-generator": collection([
    ["A title makes a promise", "A title sets expectations. If the video doesn't deliver, a clever headline won't fix the mismatch.", "text"],
    ["Descriptions do extra work", "Descriptions can add context, links and chapters instead of simply repeating the title.", "steps"],
    ["No guaranteed viral button", "AI can propose hooks, but it can't guarantee clicks or rankings. Your audience gets the final vote.", "spark"],
  ], [
    ["The first impression", "My video spent ten hours getting dressed. Its title deserves five minutes.", "film"],
    ["Curiosity, not confusion", "Make them curious, not concerned about your caps-lock key.", "text"],
  ]),
  "content-repurposer": collection([
    ["Adapt, don't photocopy", "Different channels have different contexts and formats. Repurposing reshapes an idea, not just its line breaks.", "frame"],
    ["A source is a safety net", "Working from supplied text helps keep drafts grounded, but generated details still need checking.", "file"],
    ["Your voice needs examples", "Specific tone instructions and sample writing give AI more direction than 'make it engaging'.", "voice"],
  ], [
    ["An idea with plans", "One good idea shouldn't retire after a single post.", "loop"],
    ["Content outfit change", "Same brainwave. Different dress code.", "spark"],
  ]),
  "product-description-generator": collection([
    ["Feature meets benefit", "A feature says what a product has; a benefit explains why that matters to the buyer.", "shop"],
    ["Specifics beat mystery", "Materials, dimensions and use cases give a description substance. 'Amazing quality' doesn't specify much.", "resize"],
    ["Don't invent the warranty", "AI copy can invent details. Check specifications, guarantees and claims against the actual product.", "file"],
  ], [
    ["The listing glow-up", "Your product deserves more than 'nice item, buy now'.", "shop"],
    ["Useful enthusiasm", "Less adjective confetti. More reasons to care.", "spark"],
  ]),
  "screenshot-to-guide": collection([
    ["A picture misses the click", "A screenshot shows a state, not every action that led to it. Short notes help fill the gaps.", "frame"],
    ["Sequence tells the story", "Putting screenshots in order makes a workflow easier to follow. Step three rarely makes a great step one.", "steps"],
    ["Privacy before publishing", "Screenshots can expose names, emails or keys. Remove sensitive information before sharing a guide.", "file"],
  ], [
    ["Explain once", "Future me would like to thank present me for documenting this.", "steps"],
    ["Support déjà vu", "If I've explained it three times, it deserves its own guide.", "text"],
  ]),
  "voiceover-generator": collection([
    ["Punctuation has a voice", "Commas and full stops help shape synthetic speech rhythm. Your script has a built-in conductor.", "text"],
    ["Read it out loud", "Copy that looks polished on a page can sound awkward spoken. Shorter sentences often feel more natural.", "voice"],
    ["Names aren't always obvious", "Unusual names and abbreviations may need phonetic spelling or a rewritten phrase for clear pronunciation.", "spark"],
  ], [
    ["Studio optional", "My recording booth is a text box, and the neighbors approve.", "voice"],
    ["Mic check", "Great narration. Zero arguments with the ceiling fan.", "film"],
  ]),
  "demo-script-generator": collection([
    ["Show the outcome", "A demo script can connect a problem to an action and a result, rather than touring every menu.", "steps"],
    ["Spoken words take time", "Narration length affects scene timing. Reading the script aloud helps catch scenes that are too crowded.", "voice"],
    ["A draft isn't a fact-check", "AI doesn't know your product's exact behavior unless you describe it. Verify every feature it mentions.", "file"],
  ], [
    ["Plot over button tour", "The hero of your demo is the customer's win, not the settings menu.", "film"],
    ["A better ending", "Less 'and here's another feature'. More 'here's what you can do now'.", "spark"],
  ]),
};
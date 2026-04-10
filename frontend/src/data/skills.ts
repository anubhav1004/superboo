import type { Skill } from "../types";

export const SKILLS: Skill[] = [
  {
    id: "ugc-street-interview",
    name: "UGC Street Interview",
    category: "Video Generation",
    description: "Generate raw Hindi street interview ads in Kota. Vlogger interviews school kids post-exam with 6 scene types.",
    tags: ["hindi", "india", "kota", "street", "veo3"],
    model: "veo-3.0-generate-001",
    inputs: ["product name", "scene type", "run-id"],
    outputs: ["merged video 9:16"],
    markdown: `# UGC Street Interview Skill

Generate Hindi street interview ads for any edtech product.

## Usage
\`\`\`bash
python3 ~/ugc-ai-ads-engine/ugc-street-interview/scripts/run.py \\
  --product "Professor Curious" \\
  --scene kota-coaching \\
  --run-id kota_v1
\`\`\`

## Scenes
- kota-coaching
- ek-raat
- bag-pack
- rank-wala
- pehla-din
- mock-result

## Output
\`~/.openclaw/workspace/output/ugc-street-interview/<run-id>/<run-id>_merged.mp4\`
`,
  },
  {
    id: "ugc-us-college-interview",
    name: "UGC US College Interview",
    category: "Video Generation",
    description: "Generate UGC college interview ads at elite US campuses (Harvard, MIT, Stanford, Yale, Princeton) in English.",
    tags: ["us", "college", "english", "harvard", "mit", "sora"],
    model: "sora-2",
    inputs: ["product", "scene (harvard/mit/stanford)", "run-id"],
    outputs: ["merged 9:16 video"],
    markdown: `# UGC US College Interview Skill

## Usage
\`\`\`bash
python3 ~/ugc-ai-ads-engine/ugc-us-college-interview/scripts/run.py \\
  --product "Professor Curious" --scene harvard --run-id harvard_v1
\`\`\`
`,
  },
  {
    id: "angry-object-ads",
    name: "Angry Object Ads",
    category: "Video Generation",
    description: "Generate angry talking object Hindi ads (money, pen, brain, heart) ranting at parents in desi re-re style.",
    tags: ["hindi", "pixar", "veo3", "angry", "objects"],
    model: "veo-3.1-generate-preview",
    markdown: `# Angry Object Ads\n\nHindi Pixar-style talking objects ranting at parents about education.\n\n## Objects\n- Money\n- Pen\n- Brain\n- Heart\n- Calculator\n- Books`,
  },
  {
    id: "angry-multichar-ads",
    name: "Angry Multi-Character Ads",
    category: "Video Generation",
    description: "Multi-character Hindi ads with 3 characters in same frame. 4 styles: normal, bodybuilder, chibi, 2D cartoon.",
    tags: ["hindi", "multichar", "pixar", "veo3"],
    markdown: `# Angry Multi-Character Ads\n\n## Styles\n- normal\n- bodybuilder\n- rounded chibi\n- 2D cartoon`,
  },
  {
    id: "angry-father-deity",
    name: "Angry Father + Deity",
    category: "Video Generation",
    description: "Angry father + Hindu deity Hindi ads with 4 visual styles: sora-realistic, veo-realistic, veo-animated, veo-round.",
    tags: ["hindi", "father", "deity", "cultural"],
    markdown: "# Angry Father Deity Skill",
  },
  {
    id: "podcast-ads",
    name: "Podcast Ads",
    category: "Video Generation",
    description: "Hindi podcast-style ads with two professors in dark suits. 3 lighting variants, 5 hooks.",
    tags: ["hindi", "podcast", "professors", "sora"],
    markdown: "# Podcast Ads Skill",
  },
  {
    id: "news-reporter-ads",
    name: "News Reporter Ads",
    category: "Video Generation",
    description: "Aaj Tak style breaking news Hindi ads with red BREAKING NEWS banners. 10 built-in hooks targeted at parents.",
    tags: ["hindi", "news", "breaking", "parents"],
    markdown: "# News Reporter Ads Skill",
  },
  {
    id: "ugc-lipstick-mask",
    name: "Lipstick Mask UGC",
    category: "Video Generation",
    description: "Generate UGC TikTok videos of a girl applying lipstick with mint green face mask — aesthetic ASMR content.",
    tags: ["us", "tiktok", "aesthetic", "asmr", "sora"],
    markdown: "# Lipstick Mask UGC Skill",
  },
  {
    id: "video-editor",
    name: "Video Editor",
    category: "Post-Processing",
    description: "Post-process AI-generated ads: color grading, vignette, hook text, CTA overlay, logo bug, xfade transitions, audio normalization.",
    tags: ["ffmpeg", "xfade", "grading", "cta"],
    markdown: `# Video Editor Skill\n\n## Features\n- Color grading (warm/cinematic/cool/neutral)\n- Vignette\n- Hook text overlay\n- CTA text\n- Logo bug\n- Xfade transitions\n- Audio loudnorm (-16 LUFS)\n- End card\n\n## Usage\n\`\`\`bash\npython3 ~/ugc-ai-ads-engine/video-editor/scripts/edit.py \\\n  --run-dir <dir> --hook-text "text" --style warm --end-card\n\`\`\``,
  },
  {
    id: "social-caption-engine",
    name: "Social Caption Engine",
    category: "Social Media",
    description: "Generate viral Hinglish captions and hashtags for Professor Curious ads. Auto-publish to Instagram/TikTok via Postiz.",
    tags: ["captions", "hindi", "hashtags", "postiz"],
    markdown: "# Social Caption Engine Skill",
  },
  {
    id: "growth-engine",
    name: "Growth Engine",
    category: "Social Media",
    description: "Self-learning Instagram growth engine — measure, learn, decide, create, post. 24/7 daemon.",
    tags: ["growth", "automation", "instagram"],
    markdown: "# Growth Engine Skill",
  },
  {
    id: "analytics-tracker",
    name: "Analytics Tracker",
    category: "Analytics",
    description: "Check Instagram analytics for @professorcurious.ai — views, engagement, AI insights.",
    tags: ["analytics", "instagram"],
    markdown: "# Analytics Tracker Skill",
  },
  {
    id: "trend-research",
    name: "Trend Research",
    category: "Research",
    description: "Research Instagram trends — scrape viral Indian parenting/education accounts, analyze with Gemini.",
    tags: ["trends", "research", "scraping"],
    markdown: "# Trend Research Skill",
  },
  {
    id: "create-character",
    name: "Create Character",
    category: "Character",
    description: "Create a new character with hero image and metadata.",
    tags: ["character", "image"],
    markdown: "# Create Character Skill",
  },
  {
    id: "character-gallery",
    name: "Character Gallery",
    category: "Character",
    description: "Launch the character gallery web UI to browse all characters and images.",
    tags: ["gallery", "browse"],
    markdown: "# Character Gallery Skill",
  },
  {
    id: "generate-video",
    name: "Generate Video (InfiniteTalk)",
    category: "Video Generation",
    description: "Generate a talking head video using InfiniteTalk for a character.",
    tags: ["talking-head", "infinitetalk"],
    markdown: "# Generate Video Skill",
  },
  {
    id: "generate-slideshow",
    name: "Generate Slideshow",
    category: "Image Generation",
    description: "Generate slideshow images for a character using JSON prompts.",
    tags: ["slideshow", "images"],
    markdown: "# Generate Slideshow Skill",
  },
  {
    id: "professor-curious-street-interview",
    name: "Professor Curious Street Interview",
    category: "Video Generation",
    description: "Generate raw Hindi street interview ads — vlogger interviews school kids post-exam. 3 time-of-day modes.",
    tags: ["hindi", "school", "professor-curious"],
    markdown: "# Professor Curious Street Interview",
  },
];

export const SKILL_CATEGORIES = Array.from(new Set(SKILLS.map((s) => s.category)));

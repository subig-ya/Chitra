import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Artwork } from "../models/Artwork.js";
import { Collection } from "../models/Collection.js";
import { Story } from "../models/Story.js";

const img = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const ARTWORKS = [
  {
    title: "Lavender Bloom",
    description:
      "A study of lavender in full bloom — soft petals caught in golden light. Painted with layered acrylic washes on deep violet ground.",
    imageUrl: img(4242688),
    medium: "Painting",
    subject: "Botanical",
    style: "Impressionist",
    widthCm: 60,
    heightCm: 80,
    yearCreated: 2025,
    price: 18500,
  },
  {
    title: "Purple Horizon",
    description:
      "An energetic abstract landscape of brushstrokes in violet and magenta, evoking a sun setting over distant ridges.",
    imageUrl: img(7057418),
    medium: "Painting",
    subject: "Abstract",
    style: "Expressionist",
    widthCm: 90,
    heightCm: 120,
    yearCreated: 2025,
    price: 27500,
  },
  {
    title: "Violet Harmony",
    description:
      "Fluid acrylic pour on wood panel — swirling purples and blues in cosmic motion. Each pour is one of a kind.",
    imageUrl: img(5476224),
    medium: "Mixed Media",
    subject: "Abstract",
    style: "Fluid",
    widthCm: 70,
    heightCm: 70,
    depthCm: 4,
    yearCreated: 2025,
    price: 32000,
  },
  {
    title: "Amethyst Dreams",
    description:
      "A hand-selected amethyst cluster mounted on a lacquered base. Each crystal's color is naturally unique.",
    imageUrl: img(1121123),
    medium: "Sculpture",
    subject: "Spiritual",
    style: "Minimal",
    widthCm: 25,
    heightCm: 35,
    depthCm: 18,
    yearCreated: 2025,
    price: 41000,
  },
  {
    title: "Still Life in Violet",
    description:
      "A serene composition — white vessel, amethyst, and draped silk — shot in soft window light.",
    imageUrl: img(6920412),
    medium: "Photography",
    subject: "Still Life",
    style: "Editorial",
    widthCm: 50,
    heightCm: 60,
    yearCreated: 2024,
    price: 22000,
  },
  {
    title: "Silk & Stone",
    description:
      "Fine-art photograph of a handmade amethyst pendant against a blurred morning garden.",
    imageUrl: img(965984),
    medium: "Photography",
    subject: "Still Life",
    style: "Fine Art",
    widthCm: 40,
    heightCm: 50,
    yearCreated: 2024,
    price: 12500,
  },
  {
    title: "Gallery Light",
    description:
      "A quiet architectural study of a gallery interior — framed works caught in a shaft of daylight.",
    imageUrl: img(9221307),
    medium: "Photography",
    subject: "Cityscape",
    style: "Minimal",
    widthCm: 80,
    heightCm: 55,
    yearCreated: 2023,
    price: 9500,
  },
  {
    title: "Vessels",
    description:
      "Ceramic vessels against an abstract painterly backdrop — a meditation on form and surface.",
    imageUrl: img(7674557),
    medium: "Mixed Media",
    subject: "Still Life",
    style: "Contemporary",
    widthCm: 65,
    heightCm: 65,
    yearCreated: 2025,
    price: 16000,
  },
  {
    title: "Waterlily Study",
    description:
      "Watercolor study of petals in violet and yellow — loose washes, honest edges, one sitting.",
    imageUrl: img(8749146),
    medium: "Painting",
    subject: "Botanical",
    style: "Watercolor",
    widthCm: 42,
    heightCm: 42,
    yearCreated: 2024,
    price: 11000,
  },
];

const COLLECTIONS = [
  {
    title: "Violet Hour",
    slug: "violet-hour",
    subtitle: "Moody abstracts for quiet spaces.",
    curatorNote:
      "Abstracts that glow after dark. These pieces hold the room's attention without shouting.",
    coverImageUrl: img(5476224),
    artworkTitles: ["Purple Horizon", "Violet Harmony", "Waterlily Study", "Still Life in Violet"],
    isFeatured: true,
  },
  {
    title: "Botanical Reverie",
    slug: "botanical-reverie",
    subtitle: "Flora, light, and the natural world.",
    curatorNote:
      "A love letter to gardens. Petals, stems, and stone arranged by light.",
    coverImageUrl: img(4242688),
    artworkTitles: ["Lavender Bloom", "Waterlily Study", "Silk & Stone"],
    isFeatured: true,
  },
  {
    title: "Under Rs 20,000",
    slug: "under-20000",
    subtitle: "Fresh works, gentle prices.",
    curatorNote:
      "Original art for first-time collectors — every piece hand-finished by its artist.",
    coverImageUrl: img(6611418),
    artworkTitles: ["Lavender Bloom", "Gallery Light", "Waterlily Study", "Silk & Stone", "Vessels"],
    isFeatured: true,
  },
  {
    title: "Sculpted",
    slug: "sculpted",
    subtitle: "Objects that earn their space.",
    curatorNote:
      "Sculpture and objects that sit beautifully on shelves, mantles, and floors.",
    coverImageUrl: img(1121123),
    artworkTitles: ["Amethyst Dreams", "Vessels"],
    isFeatured: false,
  },
];

const STORIES = [
  {
    title: "How to Buy Art You Love",
    slug: "how-to-buy-art-you-love",
    excerpt:
      "A short guide to choosing original art with confidence — from budget to first viewing.",
    category: "Guides",
    coverImageUrl: img(9221307, 1600),
    content:
      "Buying your first original artwork should feel exciting, not intimidating.\n\nStart with your space: measure the wall, note the light, and decide on a mood. Original art doesn't need to match your sofa — it needs to speak to the way you want the room to feel.\n\nSet a range, not a number. There is a world of beautiful original work under Rs 20,000, and most artists are happy to discuss commissions within your budget.\n\nTrust your gut. You'll know a piece is right when you keep looking at it. The escrow-protected checkout on Chitra means your payment only reaches the artist once you approve the work.\n\nFinally, hang it where you'll see it every day. The best collection is the one you live with.",
  },
  {
    title: "Inside a Kathmandu Studio",
    slug: "inside-a-kathmandu-studio",
    excerpt:
      "A morning with an emerging artist — pigment, patience, and the making of a single canvas.",
    category: "Artist Stories",
    coverImageUrl: img(7057418, 1600),
    content:
      "The studio smells of linseed oil and rain. On the easel, a canvas in violet — weeks in progress — waits for a single final stroke.\n\n'I never plan the last layer,' the artist tells us. 'The work tells you when it's done. My job is to listen.'\n\nIt's a philosophy that runs through every Chitra listing: works that begin in private, finished by hand, shipped across the city in cardboard and hope.\n\nBehind every piece you see on this site is a person, a table, and hundreds of quiet hours. Buying original art is supporting that patience.",
  },
  {
    title: "Seven Ways to Style a Statement Piece",
    slug: "seven-ways-to-style-a-statement-piece",
    excerpt:
      "Practical ideas for making one bold artwork anchor an entire room.",
    category: "Decor",
    coverImageUrl: img(7674557, 1600),
    content:
      "A single strong piece can change a room completely. Here's how to let it lead:\n\n1. Center it. One artwork, one focal point.\n2. Let it breathe — nothing else within arm's reach.\n3. Match one accent color from the piece to a cushion or throw.\n4. Hang at eye level; larger pieces sit slightly higher.\n5. Use warm light. Art reads differently under daylight and bulbs.\n6. Rotate your collection seasonally.\n7. Trust the piece. The right one never needs apology.\n\nStart with the Chitra collection — every work comes from a living artist, ready to make your wall its home.",
  },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log(`[seed] connected to ${env.mongoUri}`);

  let artist = await User.findOne({ role: "artist", "artistProfile.isVerified": true });
  if (!artist) {
    artist = await User.findOne({ role: "artist" });
  }
  if (!artist) {
    console.error("[seed] No artist found. Register an artist first.");
    process.exit(1);
  }
  console.log(`[seed] using artist: ${artist.name} (${artist._id})`);

  const artworkIds = {};
  for (const a of ARTWORKS) {
    const existing = await Artwork.findOne({ title: a.title });
    if (existing) {
      artworkIds[a.title] = existing._id;
      continue;
    }
    const created = await Artwork.create({
      ...a,
      artistId: artist._id,
      isVerified: true,
    });
    artworkIds[a.title] = created._id;
    console.log(`[seed] artwork: ${a.title}`);
  }

  for (const c of COLLECTIONS) {
    const existing = await Collection.findOne({ slug: c.slug });
    if (existing) continue;
    await Collection.create({
      title: c.title,
      slug: c.slug,
      subtitle: c.subtitle,
      curatorNote: c.curatorNote,
      coverImageUrl: c.coverImageUrl,
      artworkIds: c.artworkTitles
        .map((t) => artworkIds[t])
        .filter(Boolean),
      isFeatured: c.isFeatured,
    });
    console.log(`[seed] collection: ${c.title}`);
  }

  for (const s of STORIES) {
    const existing = await Story.findOne({ slug: s.slug });
    if (existing) continue;
    await Story.create(s);
    console.log(`[seed] story: ${s.title}`);
  }

  console.log("[seed] done");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  sold: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  freeShipping: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "all", name: "All", icon: "grid", color: "#1F8C6B" },
  { id: "Wax Prints", name: "Wax Prints", icon: "layers", color: "#e91e63" },
  { id: "Kente", name: "Kente", icon: "award", color: "#f59e0b" },
  { id: "Lace", name: "Lace", icon: "feather", color: "#9c27b0" },
  { id: "Satin", name: "Satin", icon: "star", color: "#2196f3" },
  { id: "Linen", name: "Linen", icon: "wind", color: "#4caf50" },
  { id: "Velvet", name: "Velvet", icon: "droplet", color: "#795548" },
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=400&fit=crop",
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Earbuds Pro Max",
    price: 12.99,
    originalPrice: 45.99,
    discount: 72,
    rating: 4.8,
    reviews: 15423,
    sold: 50000,
    image: PLACEHOLDER_IMAGES[0]!,
    images: [PLACEHOLDER_IMAGES[0]!, PLACEHOLDER_IMAGES[1]!, PLACEHOLDER_IMAGES[2]!],
    category: "electronics",
    description: "Experience crystal-clear audio with our premium wireless earbuds. 40hr battery life, active noise cancellation, and IPX5 water resistance.",
    freeShipping: true,
    tags: ["wireless", "earbuds", "bluetooth"],
  },
  {
    id: "2",
    name: "Women Casual Summer Dress Floral",
    price: 8.49,
    originalPrice: 29.99,
    discount: 72,
    rating: 4.6,
    reviews: 8920,
    sold: 32000,
    image: PLACEHOLDER_IMAGES[1]!,
    images: [PLACEHOLDER_IMAGES[1]!, PLACEHOLDER_IMAGES[3]!, PLACEHOLDER_IMAGES[5]!],
    category: "fashion",
    description: "Elegant floral summer dress made from breathable cotton blend. Perfect for beach, casual outings, and summer parties.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Pink", "White", "Yellow"],
    freeShipping: true,
    tags: ["dress", "summer", "floral"],
  },
  {
    id: "3",
    name: "Smart Running Shoes Lightweight",
    price: 19.99,
    originalPrice: 79.99,
    discount: 75,
    rating: 4.7,
    reviews: 12000,
    sold: 45000,
    image: PLACEHOLDER_IMAGES[2]!,
    images: [PLACEHOLDER_IMAGES[2]!, PLACEHOLDER_IMAGES[4]!, PLACEHOLDER_IMAGES[6]!],
    category: "sports",
    description: "Ultra-lightweight running shoes with advanced cushioning technology. Designed for marathon runners and casual joggers alike.",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["Black", "White", "Red", "Blue"],
    freeShipping: true,
    tags: ["shoes", "running", "sports"],
  },
  {
    id: "4",
    name: "Luxury Face Serum Anti-Aging",
    price: 6.99,
    originalPrice: 39.99,
    discount: 83,
    rating: 4.9,
    reviews: 22100,
    sold: 80000,
    image: PLACEHOLDER_IMAGES[3]!,
    images: [PLACEHOLDER_IMAGES[3]!, PLACEHOLDER_IMAGES[7]!, PLACEHOLDER_IMAGES[8]!],
    category: "beauty",
    description: "Advanced anti-aging serum with hyaluronic acid, retinol, and vitamin C. Clinically proven to reduce wrinkles by 40% in 4 weeks.",
    freeShipping: false,
    tags: ["serum", "antiaging", "skincare"],
  },
  {
    id: "5",
    name: "Smart Watch Fitness Tracker HD",
    price: 24.99,
    originalPrice: 129.99,
    discount: 81,
    rating: 4.5,
    reviews: 9800,
    sold: 28000,
    image: PLACEHOLDER_IMAGES[4]!,
    images: [PLACEHOLDER_IMAGES[4]!, PLACEHOLDER_IMAGES[0]!, PLACEHOLDER_IMAGES[1]!],
    category: "electronics",
    description: "Feature-packed smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.",
    colors: ["Black", "Silver", "Gold", "Rose Gold"],
    freeShipping: true,
    tags: ["smartwatch", "fitness", "tracker"],
  },
  {
    id: "6",
    name: "Minimalist Leather Wallet Men",
    price: 4.99,
    originalPrice: 24.99,
    discount: 80,
    rating: 4.7,
    reviews: 6500,
    sold: 20000,
    image: PLACEHOLDER_IMAGES[5]!,
    images: [PLACEHOLDER_IMAGES[5]!, PLACEHOLDER_IMAGES[9]!, PLACEHOLDER_IMAGES[10]!],
    category: "fashion",
    description: "Slim, RFID-blocking genuine leather wallet. Holds up to 8 cards and cash. Perfect slim profile that fits any pocket.",
    colors: ["Brown", "Black", "Tan"],
    freeShipping: false,
    tags: ["wallet", "leather", "minimalist"],
  },
  {
    id: "7",
    name: "Portable Bluetooth Speaker Loud",
    price: 15.99,
    originalPrice: 59.99,
    discount: 73,
    rating: 4.6,
    reviews: 11200,
    sold: 38000,
    image: PLACEHOLDER_IMAGES[6]!,
    images: [PLACEHOLDER_IMAGES[6]!, PLACEHOLDER_IMAGES[7]!, PLACEHOLDER_IMAGES[8]!],
    category: "electronics",
    description: "360-degree surround sound with deep bass. 24-hour battery, waterproof IPX7 rating, and built-in microphone for hands-free calls.",
    colors: ["Black", "Blue", "Red", "Green"],
    freeShipping: true,
    tags: ["speaker", "bluetooth", "portable"],
  },
  {
    id: "8",
    name: "Cozy Knit Sweater Women Oversized",
    price: 11.49,
    originalPrice: 44.99,
    discount: 74,
    rating: 4.8,
    reviews: 7300,
    sold: 25000,
    image: PLACEHOLDER_IMAGES[7]!,
    images: [PLACEHOLDER_IMAGES[7]!, PLACEHOLDER_IMAGES[1]!, PLACEHOLDER_IMAGES[3]!],
    category: "fashion",
    description: "Ultra-soft oversized knit sweater perfect for cozy days. Made from premium blended materials for maximum comfort.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "White", "Gray", "Black", "Pink"],
    freeShipping: true,
    tags: ["sweater", "knit", "cozy"],
  },
  {
    id: "9",
    name: "LED Desk Lamp with USB Charging",
    price: 18.99,
    originalPrice: 59.99,
    discount: 68,
    rating: 4.7,
    reviews: 5600,
    sold: 15000,
    image: PLACEHOLDER_IMAGES[8]!,
    images: [PLACEHOLDER_IMAGES[8]!, PLACEHOLDER_IMAGES[9]!, PLACEHOLDER_IMAGES[10]!],
    category: "home",
    description: "Eye-caring LED desk lamp with 3 color modes, 10 brightness levels, and USB-C charging port. Perfect for studying and working.",
    colors: ["White", "Black"],
    freeShipping: true,
    tags: ["lamp", "led", "desk"],
  },
  {
    id: "10",
    name: "Yoga Mat Non-Slip Extra Thick",
    price: 14.99,
    originalPrice: 49.99,
    discount: 70,
    rating: 4.9,
    reviews: 18400,
    sold: 62000,
    image: PLACEHOLDER_IMAGES[9]!,
    images: [PLACEHOLDER_IMAGES[9]!, PLACEHOLDER_IMAGES[2]!, PLACEHOLDER_IMAGES[4]!],
    category: "sports",
    description: "Premium 6mm thick yoga mat with superior grip and alignment lines. Eco-friendly TPE material, odorless and sweat-resistant.",
    colors: ["Purple", "Blue", "Pink", "Black", "Green"],
    freeShipping: true,
    tags: ["yoga", "mat", "fitness"],
  },
  {
    id: "11",
    name: "Stainless Steel Water Bottle 32oz",
    price: 9.99,
    originalPrice: 34.99,
    discount: 71,
    rating: 4.8,
    reviews: 24600,
    sold: 90000,
    image: PLACEHOLDER_IMAGES[10]!,
    images: [PLACEHOLDER_IMAGES[10]!, PLACEHOLDER_IMAGES[11]!, PLACEHOLDER_IMAGES[0]!],
    category: "sports",
    description: "Double-wall vacuum insulated bottle keeps drinks cold 24h and hot 12h. BPA-free, leak-proof lid, and wide mouth for easy cleaning.",
    colors: ["Silver", "Black", "Blue", "Pink", "Green"],
    freeShipping: true,
    tags: ["bottle", "water", "insulated"],
  },
  {
    id: "12",
    name: "Sunglasses Polarized UV400 Retro",
    price: 5.99,
    originalPrice: 24.99,
    discount: 76,
    rating: 4.5,
    reviews: 9100,
    sold: 35000,
    image: PLACEHOLDER_IMAGES[11]!,
    images: [PLACEHOLDER_IMAGES[11]!, PLACEHOLDER_IMAGES[0]!, PLACEHOLDER_IMAGES[5]!],
    category: "fashion",
    description: "Classic retro-style polarized sunglasses with UV400 protection. Lightweight frame with spring hinges for all-day comfort.",
    colors: ["Black", "Brown", "Gold", "Silver"],
    freeShipping: false,
    tags: ["sunglasses", "polarized", "uv400"],
  },
];

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.includes(q)
  );
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

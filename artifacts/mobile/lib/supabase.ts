import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oihjhddwjyvbujzbhgag.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paGpoZGR3anl2YnVqemJoZ2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTE2NzUsImV4cCI6MjA5MDU2NzY3NX0.FCDRs4w4yxw8SJdgn5j4-mb_Mn_umkfSlXqgD1FXkQA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images`;

export function getProductImageUrl(productId: string, fallback?: string): string {
  if (fallback) return fallback;
  return `${STORAGE_URL}/${productId}.jpg`;
}

export type DbProduct = {
  id: string;
  name: string;
  price: number;
  original_price: number;
  image?: string;
  category?: string;
  description?: string;
};

export type DbOrder = {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_region: string;
  delivery_city: string;
  delivery_address: string;
  delivery_landmark?: string;
  payment_method: string;
  created_at: string;
  order_items?: DbOrderItem[];
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
};

export type DbWishlist = {
  id: string;
  user_id: string;
  product_id: string;
};

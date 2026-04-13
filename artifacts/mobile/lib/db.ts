import { supabase, DbOrder, DbOrderItem, DbWishlist } from "./supabase";
import { PAYSTACK_PUBLIC_KEY, toPesewas } from "./paystack";

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyOrders(userId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbOrder[];
}

export async function createOrder(
  order: Omit<DbOrder, "id" | "created_at" | "order_items">,
  items: Omit<DbOrderItem, "id" | "order_id">[]
): Promise<DbOrder> {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({ ...item, order_id: orderData.id }));
  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  return orderData as DbOrder;
}

export async function updateOrderStatus(
  orderId: string,
  status: DbOrder["status"],
  paystackRef?: string
) {
  const update: Record<string, unknown> = { status };
  if (paystackRef) update.paystack_reference = paystackRef;
  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw error;
}

export async function fetchWishlist(userId: string): Promise<DbWishlist[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as DbWishlist[];
}

export async function addToWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlists")
    .upsert({ user_id: userId, product_id: productId });
  if (error) throw error;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
}

export async function initializePaystackPayment(
  orderId: string,
  email: string,
  amountGhc: number
) {
  const { data, error } = await supabase.functions.invoke("paystack-initialize", {
    body: {
      order_id: orderId,
      email,
      amount: toPesewas(amountGhc),
      public_key: PAYSTACK_PUBLIC_KEY,
      currency: "GHS",
    },
  });
  if (error) throw error;
  return data as { authorization_url: string; reference: string; access_code: string };
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function verifyPaystackPayment(reference: string) {
  const { data, error } = await supabase.functions.invoke("paystack-verify", {
    body: { reference },
  });
  if (error) throw error;
  return data as { status: string; paid: boolean };
}

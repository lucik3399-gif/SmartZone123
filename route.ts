import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode");
  const phone = searchParams.get("phone");

  if (!orderCode || !phone) {
    return NextResponse.json({ error: "Потрібні номер замовлення і телефон" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: order, error } = await supabase
    .from("orders")
    .select("order_code,status,customer_name,customer_phone,customer_city,total,created_at")
    .eq("order_code", orderCode)
    .eq("customer_phone", normalizePhone(phone))
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

-- ═══════════════════════════════════════════════════════════
--  NOVIARA BEAUTY — Supabase Schema
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── TABLA: PEDIDOS ───────────────────────────────────────────
CREATE TABLE orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Estado del pedido
  status          TEXT DEFAULT 'pendiente'
                  CHECK (status IN ('pendiente','pagado','en_preparacion','enviado','entregado','cancelado')),
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','approved','rejected','cancelled')),
  
  -- Datos del cliente
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  
  -- Dirección de envío
  street          TEXT NOT NULL,
  colonia         TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  zip_code        TEXT NOT NULL,
  
  -- Totales
  subtotal        DECIMAL(10,2) NOT NULL,
  shipping_cost   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  
  -- MercadoPago
  mp_preference_id TEXT,
  mp_payment_id    TEXT,
  
  -- Envío
  tracking_number  TEXT,
  tracking_company TEXT,
  
  -- Notas internas
  notes           TEXT
);

-- ── TABLA: ARTÍCULOS DEL PEDIDO ──────────────────────────────
CREATE TABLE order_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  product_title TEXT NOT NULL,
  brand         TEXT,
  category      TEXT,
  color         TEXT,
  sku           TEXT,
  price         DECIMAL(10,2) NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  image_url     TEXT
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cualquier persona puede CREAR pedidos (anon)
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_insert_order_items"
  ON order_items FOR INSERT TO anon
  WITH CHECK (true);

-- Solo authenticated (service_role) puede VER y MODIFICAR
CREATE POLICY "admin_select_orders"
  ON orders FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_update_orders"
  ON orders FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "admin_select_items"
  ON order_items FOR SELECT TO authenticated
  USING (true);

-- ── FUNCIÓN: resumen del día ─────────────────────────────────
CREATE OR REPLACE FUNCTION get_daily_shopping_list(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  product_title TEXT,
  brand         TEXT,
  color         TEXT,
  sku           TEXT,
  total_qty     BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    oi.product_title,
    oi.brand,
    oi.color,
    oi.sku,
    SUM(oi.quantity) AS total_qty
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE
    o.status IN ('pagado', 'en_preparacion')
    AND DATE(o.created_at) = target_date
  GROUP BY oi.product_title, oi.brand, oi.color, oi.sku
  ORDER BY oi.brand, oi.product_title;
$$;

-- ── DATOS DE PRUEBA (opcional, borrar en producción) ─────────
-- INSERT INTO orders (customer_name, customer_email, customer_phone, street, colonia, city, state, zip_code, subtotal, shipping_cost, total, status, payment_status)
-- VALUES ('Ana García', 'ana@test.com', '5512345678', 'Insurgentes 123', 'Roma Norte', 'Ciudad de México', 'Ciudad de México', '06700', 450.00, 80.00, 530.00, 'pagado', 'approved');

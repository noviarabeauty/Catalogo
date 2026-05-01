# Noviara Beauty — Requisitos Funcionales
**Versión:** 1.0 | **Fecha:** 2026

---

## 1. Contexto del Negocio
Noviara Beauty es una tienda de maquillaje que opera como intermediaria entre Dubellay (proveedor) y clientes finales. La dueña recibe pedidos, los compra a Dubellay y los envía directamente al cliente (modelo dropshipping local).

---

## 2. Módulos del Sistema

### RF-01 · Catálogo de Productos
| ID | Requisito |
|----|-----------|
| RF-01.1 | Mostrar catálogo organizado en secciones: Novedades, Maquillaje, Cuidado De La Piel, Cuidado Del Cabello, Marcas |
| RF-01.2 | Cada sección tiene sub-categorías accesibles desde mega-menú (desktop) y menú accordion (móvil) |
| RF-01.3 | Cada producto muestra: imagen principal, marca, nombre y precio (+40% sobre costo Dubellay) |
| RF-01.4 | Al abrir un producto se muestran todas las variantes de color con imagen individual clicable |
| RF-01.5 | Buscador en tiempo real por nombre, marca o color |
| RF-01.6 | NO se muestra precio original de Dubellay ni información de stock |
| RF-01.7 | La sección "Lo Mas Nuevo En Dubellay" se muestra como "Lo Más Nuevo de Noviara Beauty" |
| RF-01.8 | Categorías de Dubellay no aparecen visibles para el cliente (solo las secciones de Noviara) |

### RF-02 · Carrito de Compras
| ID | Requisito |
|----|-----------|
| RF-02.1 | El cliente puede agregar productos al carrito desde el modal de detalle del producto |
| RF-02.2 | Si el producto tiene variantes, debe seleccionar color antes de agregar |
| RF-02.3 | El carrito persiste aunque se recargue la página (localStorage) |
| RF-02.4 | El cliente puede cambiar cantidad (+/-) o eliminar ítems del carrito |
| RF-02.5 | El carrito muestra: imagen, nombre, color, precio unitario, cantidad, subtotal por ítem |
| RF-02.6 | El header muestra un contador con el número de artículos en carrito |

### RF-03 · Cálculo de Envío
| ID | Requisito |
|----|-----------|
| RF-03.1 | CDMX y Estado de México → **$80 MXN** |
| RF-03.2 | Resto de la República → **$120 MXN** |
| RF-03.3 | Compras con subtotal **≥ $1,000 MXN** → **ENVÍO GRATIS** (cualquier estado) |
| RF-03.4 | El costo de envío se calcula automáticamente al seleccionar el estado en el checkout |
| RF-03.5 | Se muestra el desglose: subtotal + envío = total antes de pagar |

### RF-04 · Proceso de Checkout
| ID | Requisito |
|----|-----------|
| RF-04.1 | El cliente llena: nombre completo, email, teléfono |
| RF-04.2 | Dirección: calle y número, colonia, ciudad, estado (lista de 32 estados MX), código postal |
| RF-04.3 | Se validan campos requeridos antes de proceder al pago |
| RF-04.4 | Se muestra resumen del pedido con todos los ítems, subtotal, costo de envío y total |
| RF-04.5 | Al confirmar, el pedido se guarda en la base de datos con estado "pendiente" |
| RF-04.6 | El cliente es redirigido a MercadoPago para completar el pago |

### RF-05 · Pagos (MercadoPago)
| ID | Requisito |
|----|-----------|
| RF-05.1 | Plataforma de pago: **MercadoPago Checkout Pro** |
| RF-05.2 | Métodos aceptados: tarjeta crédito/débito, OXXO, transferencia bancaria |
| RF-05.3 | Al completar el pago, MercadoPago notifica vía webhook y el pedido cambia a "pagado" |
| RF-05.4 | El cliente recibe confirmación visual de pago exitoso |
| RF-05.5 | Si el pago falla, el pedido se mantiene como "pendiente" y el cliente puede reintentar |

### RF-06 · Panel de Administración (Solo para Dueña)
| ID | Requisito |
|----|-----------|
| RF-06.1 | Acceso protegido por contraseña |
| RF-06.2 | Vista del día: lista de pedidos nuevos pagados del día actual |
| RF-06.3 | Cada pedido muestra: nombre cliente, dirección completa, productos a comprar en Dubellay, total |
| RF-06.4 | La dueña puede marcar pedidos como: Pagado → En preparación → Enviado → Entregado |
| RF-06.5 | Al marcar como "Enviado" se puede registrar número de guía |
| RF-06.6 | Filtros: por fecha, por estado del pedido |
| RF-06.7 | La vista de "qué comprar hoy" agrupa productos iguales (ej: si 3 clientes piden el mismo labial, aparece x3) |

---

## 3. Arquitectura Técnica (100% Gratuita)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│              noviara_beauty.html (estático)              │
│         Catálogo + Carrito + Checkout (HTML/JS)          │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌─────────────────────┐    ┌──────────────────────────────┐
│   NETLIFY (free)    │    │      SUPABASE (free)         │
│                     │    │   PostgreSQL Database         │
│  /functions/        │    │   - tabla: orders            │
│    crear-pago.js    │◄───│   - tabla: order_items       │
│    mp-webhook.js    │    │   REST API gratuita          │
│                     │    │   500 MB storage             │
└──────────┬──────────┘    └──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   MERCADOPAGO       │
│  Checkout Pro       │
│  (sin costo fijo,   │
│   ~3.49% por venta) │
└─────────────────────┘
```

### Servicios y costos
| Servicio | Uso | Costo |
|----------|-----|-------|
| **Netlify** | Hosting + Functions | **Gratis** (125k req/mes) |
| **Supabase** | Base de datos | **Gratis** (500MB, 2 proyectos) |
| **MercadoPago** | Procesador de pagos | **Gratis** (cobra ~3.49% por transacción exitosa) |
| **GitHub** | Repositorio del código | **Gratis** |

---

## 4. Modelo de Base de Datos

```sql
orders
  id, created_at, status, payment_status
  customer_name, customer_email, customer_phone
  street, colonia, city, state, zip_code
  subtotal, shipping_cost, total
  payment_id, tracking_number, notes

order_items
  id, order_id
  product_title, brand, category, color, sku
  price, quantity, image_url
```

---

## 5. Estados de un Pedido
```
pendiente → pagado → en_preparacion → enviado → entregado
               ↓
           cancelado
```

---

## 6. Lo que la dueña hace cada día
1. Abre `admin.html` → ve los pedidos **pagados de hoy**
2. Ve el resumen de **qué productos comprar** en Dubellay (ya agrupados)
3. Hace el pedido a Dubellay
4. Marca pedidos como **En preparación**
5. Cuando llegan los productos, los empaqueta y envía
6. Registra número de guía y marca como **Enviado**

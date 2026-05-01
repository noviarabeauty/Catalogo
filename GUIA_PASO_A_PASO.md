# 🌸 Guía para publicar Noviara Beauty en internet
### Sin pagar nada · Paso a paso · Sin conocimientos técnicos

---

## Lo que vas a hacer en orden:
1. Crear cuenta en GitHub (guarda tu código)
2. Crear base de datos en Supabase (guarda los pedidos)
3. Crear cuenta de pagos en MercadoPago
4. Publicar la página en Netlify (la sube a internet)
5. Conectar todo

⏱ Tiempo total: ~2 horas la primera vez

---

# PASO 1 — GitHub
### (Es donde guardas los archivos de tu página)

1. Ve a **github.com** → clic en **Sign up**
2. Pon tu email, crea contraseña, elige usuario (ej: `noviarabeauty`)
3. Verifica tu email
4. Una vez dentro, clic en el botón verde **New** (arriba a la izquierda)
5. En "Repository name" escribe: `noviara-beauty`
6. Selecciona **Private** (para que nadie vea tu código)
7. Clic en **Create repository**
8. Clic en **uploading an existing file**
9. Arrastra estos archivos desde tu computadora:
   - `noviara_beauty.html`
   - `netlify.toml`
   - La carpeta `netlify/` (con las dos funciones adentro)
10. Abajo escribe "primera versión" y clic en **Commit changes**

✅ Tu código ya está guardado en internet

---

# PASO 2 — Supabase (Base de datos GRATIS)
### (Aquí se guardan todos los pedidos de tus clientas)

1. Ve a **supabase.com** → clic en **Start your project**
2. Regístrate con tu cuenta de Google o con email
3. Clic en **New project**
4. Llena:
   - Name: `noviara-beauty`
   - Database Password: (inventa una contraseña segura, **guárdala**)
   - Region: `South America (São Paulo)` ← la más cercana a México
5. Clic en **Create new project** → espera ~2 minutos
6. Una vez listo, en el menú izquierdo clic en **SQL Editor**
7. Clic en **New query**
8. Copia y pega TODO el contenido del archivo `supabase_schema.sql`
9. Clic en **Run** (botón verde)
   - Debe decir "Success. No rows returned"
10. Ahora ve a **Settings** (engrane, menú izquierdo) → **API**
11. **GUARDA** estos dos datos (los necesitas después):
    ```
    Project URL:  https://xxxxxxxxxx.supabase.co
    anon public:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

✅ Tu base de datos está lista

---

# PASO 3 — MercadoPago
### (Para que tus clientas puedan pagar con tarjeta u OXXO)

1. Ve a **mercadopago.com.mx** → crea una cuenta si no tienes
2. Una vez dentro ve a:
   **mercadopago.com.mx/developers/panel**
3. Clic en **Crear aplicación**
4. Nombre: `Noviara Beauty`
5. Selecciona **Pagos online** → **CheckoutPro**
6. Acepta y crea
7. Dentro de tu aplicación ve a **Credenciales de producción**
8. **GUARDA** estos datos:
   ```
   Access Token: APP_USR-0000000000000000-000000-...
   ```
   ⚠️ También hay credenciales de **prueba** (TEST-...) úsalas primero para probar sin dinero real

✅ MercadoPago listo

---

# PASO 4 — Netlify (Publica tu página GRATIS)
### (Aquí vive tu página web)

1. Ve a **netlify.com** → clic en **Sign up**
2. Selecciona **Sign up with GitHub** → autoriza
3. Clic en **Add new site** → **Import an existing project**
4. Clic en **GitHub**
5. Busca y selecciona tu repositorio `noviara-beauty`
6. Configuración:
   - Branch to deploy: `main`
   - Build command: (déjalo vacío)
   - Publish directory: `.`
7. Clic en **Deploy site**
8. Espera ~1 minuto → Netlify te da una URL como:
   `https://random-name-123.netlify.app`
   - Puedes cambiarla: **Site settings** → **Change site name** → pon `noviara-beauty`
   - Quedará: `https://noviara-beauty.netlify.app`

✅ Tu página ya está en internet (aunque aún falta conectar los pagos)

---

# PASO 5 — Conectar todo (Variables de entorno)
### (Le dices a Netlify tus claves secretas)

1. En Netlify, ve a **Site settings** → **Environment variables**
2. Clic en **Add a variable** y agrega estas una por una:

| Key (nombre) | Value (valor) |
|---|---|
| `MP_ACCESS_TOKEN` | Tu Access Token de MercadoPago |
| `APP_URL` | `https://noviara-beauty.netlify.app` |
| `SUPABASE_URL` | Tu Project URL de Supabase |
| `SUPABASE_SERVICE_KEY` | Tu service_role key de Supabase |

3. Clic en **Save**

---

# PASO 6 — Actualizar el HTML con tus claves
### (Para que el carrito se conecte a tu base de datos)

1. Abre el archivo `noviara_beauty.html` en tu computadora con el Bloc de notas
2. Busca esta sección (está cerca del final del archivo):
```javascript
const CONFIG = {
  SUPABASE_URL: 'https://TU_PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'TU_ANON_KEY',
  ...
```
3. Reemplaza:
   - `https://TU_PROYECTO.supabase.co` → con tu Project URL
   - `TU_ANON_KEY` → con tu anon public key
4. Guarda el archivo

---

# PASO 7 — Incrustar el CSV y subir
### (Para que el catálogo esté dentro del HTML)

1. Pon en la misma carpeta:
   - `noviara_beauty.html`
   - `catalogo_dubellay_completo.csv`
2. Abre el Símbolo del sistema (busca "cmd" en Windows) o Terminal (Mac)
3. Navega a esa carpeta:
   ```
   cd C:\Users\TuNombre\Desktop\noviara
   ```
4. Ejecuta:
   ```
   python incrustar_csv.py
   ```
   - Genera `noviara_beauty_FINAL.html` con el CSV adentro

5. Sube a GitHub:
   - Ve a tu repositorio en github.com
   - Clic en **Add file** → **Upload files**
   - Sube `noviara_beauty_FINAL.html`
   - Renómbralo a `noviara_beauty.html` (reemplaza el anterior)
   - Clic en **Commit changes**

6. Netlify se actualiza solo en ~30 segundos ✨

---

# PASO 8 — Probar que todo funciona

### Prueba el catálogo:
- Abre `https://noviara-beauty.netlify.app`
- ¿Se ven los productos? ✅
- ¿Funciona el buscador? ✅
- ¿Se abren los colores al hacer clic? ✅

### Prueba el carrito y pago:
1. Agrega un producto al carrito
2. Ve al checkout, llena tus datos
3. **Usa las credenciales de PRUEBA de MercadoPago** (TEST-...)
4. En MercadoPago de prueba usa esta tarjeta:
   - Número: `4509 9535 6623 3704`
   - Vencimiento: cualquier fecha futura
   - CVV: `123`
   - Nombre: `APRO` (para que el pago sea aprobado)
5. ¿Llegaste a la página de gracias? ✅
6. ¿Aparece el pedido en Supabase? → Ve a **Table Editor** → tabla `orders` ✅

### Cuando todo funcione en pruebas:
- Cambia `MP_ACCESS_TOKEN` en Netlify por el token de **PRODUCCIÓN**
- ¡Listo para recibir pagos reales!

---

# Cómo ver tus pedidos del día

1. Ve a **supabase.com** → tu proyecto → **Table Editor**
2. Clic en la tabla **orders**
3. Filtra por `status = pagado` y por fecha de hoy
4. La tabla **order_items** te muestra exactamente qué productos comprar

### Para ver el resumen de qué comprar:
1. Ve a **SQL Editor** en Supabase
2. Ejecuta:
```sql
SELECT * FROM get_daily_shopping_list();
```
Te muestra una lista como:
```
Labial Ruby Woo | MAC | Rojo | SKU123 | x3 unidades
Delineador...   | NYX | Negro | ...   | x1 unidad
```
Esa es tu lista de compras del día en Dubellay 🛍

---

# Resumen de costos

| Servicio | Costo mensual |
|---|---|
| GitHub | **GRATIS** |
| Supabase | **GRATIS** (hasta 500MB) |
| Netlify | **GRATIS** (hasta 100GB tráfico) |
| MercadoPago | **GRATIS** (cobra ~3.49% solo cuando vendes) |
| **TOTAL FIJO** | **$0 MXN** 🎉 |

Solo pagas cuando vendes (la comisión de MercadoPago).

---

# ¿Necesitas ayuda?

Si algo sale mal, los errores más comunes son:
- **"CSV no encontrado"** → Vuelve a ejecutar `incrustar_csv.py`
- **"Error guardando pedido"** → Revisa que el SUPABASE_ANON_KEY esté correcto en el HTML
- **"Error creando pago"** → Revisa que MP_ACCESS_TOKEN esté en las variables de Netlify

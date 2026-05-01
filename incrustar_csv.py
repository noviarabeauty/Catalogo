"""
incrustar_csv.py
────────────────────────────────────────────────
Mete el CSV dentro del HTML para que la página
funcione sin necesitar el archivo CSV aparte.

USO:
  python incrustar_csv.py

Genera: noviara_beauty_FINAL.html
"""

import re, os, sys

HTML_IN  = "noviara_beauty.html"
CSV_IN   = "catalogo_dubellay_completo.csv"
HTML_OUT = "noviara_beauty_FINAL.html"

def main():
    # Verificar archivos
    for f in [HTML_IN, CSV_IN]:
        if not os.path.exists(f):
            print(f"❌  No encontré el archivo: {f}")
            print(f"    Asegúrate de que esté en la misma carpeta que este script.")
            sys.exit(1)

    print(f"📄  Leyendo {HTML_IN}...")
    with open(HTML_IN, "r", encoding="utf-8") as f:
        html = f.read()

    print(f"📊  Leyendo {CSV_IN}...")
    with open(CSV_IN, "r", encoding="utf-8") as f:
        csv_data = f.read()

    # Escapar para JS template literal
    csv_escaped = (csv_data
        .replace("\\", "\\\\")
        .replace("`", "\\`")
        .replace("${", "\\${"))

    # Insertar justo antes de </body>
    script_tag = f"""<script>
// CSV incrustado automáticamente por incrustar_csv.py
const CSV_DATA = `{csv_escaped}`;
</script>"""

    if "<!-- CSV embebido aquí por incrustar_csv.py -->" in html:
        html = html.replace(
            "<!-- CSV embebido aquí por incrustar_csv.py -->",
            script_tag
        )
    elif "</body>" in html:
        html = html.replace("</body>", script_tag + "\n</body>")
    else:
        html += "\n" + script_tag

    print(f"💾  Escribiendo {HTML_OUT}...")
    with open(HTML_OUT, "w", encoding="utf-8") as f:
        f.write(html)

    size_mb = os.path.getsize(HTML_OUT) / 1024 / 1024
    print(f"✅  Listo → {HTML_OUT}  ({size_mb:.1f} MB)")
    print(f"\nSube este archivo a GitHub como 'noviara_beauty.html'")

if __name__ == "__main__":
    main()

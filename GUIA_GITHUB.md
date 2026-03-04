# Echofy - Guía de Publicación en GitHub

Esta aplicación está configurada para desplegarse automáticamente en GitHub Pages usando GitHub Actions.

## Pasos para publicar

1.  **Crear Repositorio en GitHub:**
    *   Ve a [github.com/new](https://github.com/new).
    *   Nombre del repositorio: `echofy` (o el que prefieras).
    *   Público (recomendado para Pages gratis) o Privado.
    *   **NO** inicialices con README, .gitignore o licencia.

2.  **Subir el código:**
    Si has descargado el código como ZIP:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/echofy.git
    git push -u origin main
    ```

3.  **Configurar GitHub Pages:**
    *   Ve a la pestaña **Settings** de tu repositorio.
    *   Ve a **Pages** (menú izquierdo).
    *   En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
    *   ¡Listo! La acción se ejecutará automáticamente.

## Instalación en Móvil (PWA)

1.  Espera a que la acción termine (pestaña **Actions** en GitHub).
2.  Visita la URL generada (aparecerá en **Settings > Pages**).
3.  **Android (Chrome):** Menú (3 puntos) > "Instalar aplicación" o "Agregar a la pantalla principal".
4.  **iOS (Safari):** Botón Compartir > "Agregar al inicio".

## Desarrollo Local

*   Instalar dependencias: `npm install`
*   Iniciar servidor: `npm run dev`
*   Construir para producción: `npm run build`

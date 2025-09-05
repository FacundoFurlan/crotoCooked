# Phaser Vite Template

This is a Phaser 3 project template that uses Vite for bundling. It supports hot-reloading for quick development workflow and includes scripts to generate production-ready builds.

**[This Template is also available as a TypeScript version.](https://github.com/phaserjs/template-vite-ts)**

### Versions

This template has been updated for:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Vite 6.3.1](https://github.com/vitejs/vite)

## Contenido del repositorio

Este repositorio incluye ejemplos y explicaciones de los principales patrones de diseño aplicados al desarrollo de videojuegos. Los patrones están agrupados en las siguientes categorías:

### Patrones de arquitectura

Definen la estructura general del juego y cómo se organiza el flujo de ejecución y las entidades del mundo virtual.

- **Game Loop**: Ciclo continuo que procesa la entrada del jugador, actualiza la lógica y renderiza la escena. Sin este bucle no hay movimiento ni interacción.
- **ECS (Entity–Component–System)**: Organiza los objetos del juego en entidades (identificadores), componentes (datos) y sistemas (procesos). Favorece la composición flexible sobre la herencia rígida.  
  _Ejemplo: Módulo #4 - ECS_

### Patrones de comportamiento

Modelan cómo los objetos del juego definen, modifican o intercambian su comportamiento.

- **State Machine (Máquina de estados)**: Modelo basado en estados posibles y reglas de transición.  
  _Ejemplo: un enemigo que puede estar “patrullando”, “persiguiendo” o “atacando”._
- **Strategy (Estrategia)**: Encapsula diferentes formas de realizar una acción y permite intercambiarlas dinámicamente.  
  _Ejemplo: distintos algoritmos de movimiento o ataque._

### Patrones de creación

Regulan la forma en que se crean y gestionan los objetos del juego.

- **Factory (Fábrica)**: Centraliza la lógica de creación de objetos para evitar duplicación y garantizar coherencia.
- **Object Pool (Piscina de objetos)**: Reutiliza objetos ya existentes en lugar de crearlos y destruirlos constantemente, optimizando recursos.
- **Singleton (Única instancia)**: Garantiza una sola instancia global y un punto de acceso único (p. ej., gestor de audio, configuración, puntaje).

### Patrones de comunicación

Permiten la interacción entre los distintos módulos del juego sin acoplamiento rígido.

- **Observer (Observador)**: Permite que varios sistemas reaccionen automáticamente a un evento.  
  _Ejemplo: cuando el jugador pierde vida, la UI, el audio y los logros reaccionan a la vez._
- **Service Locator**: Centraliza el acceso a servicios globales como audio, input o configuración, evitando pasar referencias por todo el código.

---

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command               | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm install`         | Install project dependencies                                                                             |
| `npm run dev`         | Launch a development web server                                                                          |
| `npm run build`       | Create a production build in the `dist` folder                                                           |
| `npm run dev-nolog`   | Launch a development web server without sending anonymous data (see "About log.js" below)                |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

| Path               | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `index.html`       | A basic HTML page to contain the game.                |
| `public/assets`    | Game sprites, audio, etc. Served directly at runtime. |
| `public/style.css` | Global layout styles.                                 |
| `src/main.js`      | Application bootstrap.                                |
| `src/game`         | Folder containing the game code.                      |
| `src/game/main.js` | Game entry point: configures and starts the game.     |
| `src/game/scenes`  | Folder with all Phaser game scenes.                   |

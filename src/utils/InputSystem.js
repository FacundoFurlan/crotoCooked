/**
 * Constantes de acciones de entrada disponibles en el sistema
 * Estas constantes evitan hardcodear strings y proporcionan autocompletado
 */
export const INPUT_ACTIONS = {
  UP: "up", // Movimiento hacia arriba (eje Y negativo)
  DOWN: "down", // Movimiento hacia abajo (eje Y positivo)
  LEFT: "left", // Movimiento hacia la izquierda (eje X negativo)
  RIGHT: "right", // Movimiento hacia la derecha (eje X positivo)
  NORTH: "north", // Botón norte del gamepad (B3)
  EAST: "east", // Botón este del gamepad (B1)
  SOUTH: "south", // Botón sur del gamepad (B0)
  WEST: "west", // Botón oeste del gamepad (B2)
};

/**
 * Sistema de entrada unificado para teclado y gamepad arcade Unraf
 *
 * Características principales:
 * - Mapeo configurable de teclas de teclado
 * - Compatibilidad fija con gamepad arcade Unraf (USB GENERIC)
 * - Detección de entrada simultánea de teclado y gamepad
 * - Métodos para detectar pulsaciones continuas y momentáneas
 *
 * Especificaciones del gamepad Unraf:
 * - 4 Botones: Norte(B3), Este(B1), Sur(B0), Oeste(B2)
 * - 1 Joystick: Eje X(axis 0), Eje Y(axis 1)
 * - Valores del joystick: -1 a 1 en cada eje
 *
 * @example
 * // Inicialización básica
 * const inputSystem = new InputSystem(this.input);
 *
 * // Configurar teclas personalizadas
 * inputSystem.configureKeyboard({
 *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
 *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.X]
 * });
 *
 * // Verificar entrada en el loop de actualización
 * if (inputSystem.isPressed(INPUT_ACTIONS.NORTH)) {
 *   // El jugador está presionando el botón norte
 * }
 */
export default class InputSystem {
  // Constantes estáticas accesibles desde la clase
  static ACTIONS = INPUT_ACTIONS;

  /**
   * Constructor del sistema de entrada
   *
   * @param {Phaser.Input.InputPlugin} input - Plugin de entrada de Phaser de la escena
   */
  constructor(input) {
    /** @private {Phaser.Input.InputPlugin} Plugin de entrada de Phaser */
    this.input = input;

    /** @private {Object} Colección de teclas del teclado inicializadas */
    this.keys = {};

    /** @private {Phaser.Input.Gamepad.Gamepad|null} Referencia al gamepad del jugador 1 */
    this.gamepad1 = null;

    /** @private {Phaser.Input.Gamepad.Gamepad|null} Referencia al gamepad del jugador 2 */
    this.gamepad2 = null;

    /**
     * Mapeo de acciones a controles de entrada para 2 jugadores
     * Las configuraciones de gamepad son fijas para compatibilidad con Unraf
     * Las configuraciones de teclado pueden ser modificadas por el desarrollador
     *
     * @private {Object}
     */
    this.mapping = {
      player1: {
        // Movimientos direccionales del joystick
        [INPUT_ACTIONS.UP]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 1, dir: -1 }], // Eje Y hacia arriba
        },
        [INPUT_ACTIONS.DOWN]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 1, dir: 1 }], // Eje Y hacia abajo
        },
        [INPUT_ACTIONS.LEFT]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 0, dir: -1 }], // Eje X hacia la izquierda
        },
        [INPUT_ACTIONS.RIGHT]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 0, dir: 1 }], // Eje X hacia la derecha
        },

        // Botones del gamepad arcade
        [INPUT_ACTIONS.NORTH]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 3 }], // B3 - Botón superior
        },
        [INPUT_ACTIONS.EAST]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 1 }], // B1 - Botón derecho
        },
        [INPUT_ACTIONS.SOUTH]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 0 }], // B0 - Botón inferior
        },
        [INPUT_ACTIONS.WEST]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 2 }], // B2 - Botón izquierdo
        },
      },
      player2: {
        // Movimientos direccionales del joystick
        [INPUT_ACTIONS.UP]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 1, dir: -1 }], // Eje Y hacia arriba
        },
        [INPUT_ACTIONS.DOWN]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 1, dir: 1 }], // Eje Y hacia abajo
        },
        [INPUT_ACTIONS.LEFT]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 0, dir: -1 }], // Eje X hacia la izquierda
        },
        [INPUT_ACTIONS.RIGHT]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "axis", index: 0, dir: 1 }], // Eje X hacia la derecha
        },

        // Botones del gamepad arcade
        [INPUT_ACTIONS.NORTH]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 3 }], // B3 - Botón superior
        },
        [INPUT_ACTIONS.EAST]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 1 }], // B1 - Botón derecho
        },
        [INPUT_ACTIONS.SOUTH]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 0 }], // B0 - Botón inferior
        },
        [INPUT_ACTIONS.WEST]: {
          keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
          gamepad: [{ type: "button", index: 2 }], // B2 - Botón izquierdo
        },
      },
    };

    /** @private {Object} Estados previos de ejes por jugador */
    this.previousAxisStates = {
      player1: {},
      player2: {},
    };

    // Inicializar sistemas de entrada
    this.initializeKeyboard();
    this.initializeGamepad();
  }

  /**
   * Inicializa las teclas del teclado basándose en el mapeo actual
   * Crea objetos Key de Phaser para cada tecla configurada
   *
   * @private
   */
  initializeKeyboard() {
    // Crear teclas del teclado para todas las acciones mapeadas de ambos jugadores
    ["player1", "player2"].forEach((player) => {
      Object.keys(this.mapping[player]).forEach((action) => {
        const keyboardMappings = this.mapping[player][action].keyboard;
        keyboardMappings.forEach((key) => {
          if (typeof key === "string") { //----------------------------------------------------------------------------------------------------
            this.keys[key] = this.input.keyboard.addKey(key);
          } else {
            this.keys[key] = this.input.keyboard.addKey(key);
          }
        });
      });
    });
  }

  /**
   * Inicializa la detección de gamepad y configura eventos de conexión
   * Maneja automáticamente la conexión y desconexión de hasta 2 gamepads
   *
   * @private
   */
  initializeGamepad() {
    // Inicializar gamepad si está disponible
    if (this.input.gamepad) {
      this.input.gamepad.on("connected", (pad) => {
        // Asignar al primer slot disponible
        if (!this.gamepad1) {
          this.gamepad1 = pad;
          console.log("Gamepad 1 conectado:", pad.id, "- Index:", pad.index);
        } else if (!this.gamepad2) {
          this.gamepad2 = pad;
          console.log("Gamepad 2 conectado:", pad.id, "- Index:", pad.index);
        } else {
          console.warn(
            "Ya hay 2 gamepads conectados. Gamepad ignorado:",
            pad.id
          );
        }
      });

      this.input.gamepad.on("disconnected", (pad) => {
        // Desconectar el gamepad correspondiente
        if (this.gamepad1 && this.gamepad1.index === pad.index) {
          this.gamepad1 = null;
          console.log("Gamepad 1 desconectado");
        } else if (this.gamepad2 && this.gamepad2.index === pad.index) {
          this.gamepad2 = null;
          console.log("Gamepad 2 desconectado");
        }
      });

      // Verificar si ya hay gamepads conectados al inicializar
      this.checkExistingGamepads();
    }
  }

  /**
   * Verifica y reconecta gamepads que ya están conectados
   * Este método debe llamarse periódicamente para manejar reconexiones después de refresh
   *
   * @private
   */
  checkExistingGamepads() {
    if (!this.input.gamepad) return;

    const pads = this.input.gamepad.gamepads;
    pads.forEach((pad) => {
      if (!pad || !pad.connected) return;

      // Verificar si este gamepad ya está asignado
      const isAssigned =
        (this.gamepad1 && this.gamepad1.index === pad.index) ||
        (this.gamepad2 && this.gamepad2.index === pad.index);

      if (isAssigned) return;

      // Asignar al primer slot disponible
      if (!this.gamepad1) {
        this.gamepad1 = pad;
        console.log(
          "Gamepad 1 detectado:",
          pad.id,
          "- Index:",
          pad.index
        );
      } else if (!this.gamepad2) {
        this.gamepad2 = pad;
        console.log(
          "Gamepad 2 detectado:",
          pad.id,
          "- Index:",
          pad.index
        );
      }
    });
  }

  /**
   * Configura un mapeo personalizado para una acción específica de un jugador
   * Permite modificar tanto controles de teclado como de gamepad (no recomendado para gamepad)
   *
   * @param {string} action - Nombre de la acción (usar INPUT_ACTIONS constantes)
   * @param {Object} config - Objeto de configuración
   * @param {Array} [config.keyboard] - Array de códigos de tecla o strings
   * @param {Array} [config.gamepad] - Array de configuraciones de gamepad (no recomendado modificar)
   * @param {string} [player='player1'] - Jugador al que se aplica el mapeo ('player1' o 'player2')
   *
   * @example
   * // Configurar solo teclado para jugador 1 (recomendado)
   * inputSystem.setMapping(INPUT_ACTIONS.NORTH, {
   *   keyboard: [Phaser.Input.Keyboard.KeyCodes.SPACE, 'ENTER']
   * }, 'player1');
   */
  setMapping(action, config, player = "player1") {
    if (!this.mapping[player]) return;

    if (config.keyboard) {
      this.mapping[player][action].keyboard = config.keyboard;
      // Agregar nuevas teclas de teclado
      config.keyboard.forEach((key) => {
        if (!this.keys[key]) {
          this.keys[key] = this.input.keyboard.addKey(key);
        }
      });
    }

    if (config.gamepad) {
      this.mapping[player][action].gamepad = config.gamepad;
    }
  }

  /**
   * Configura múltiples mapeos a la vez para un jugador
   * Método conveniente para configurar varios controles simultáneamente
   *
   * @param {Object} mappings - Objeto con múltiples configuraciones de acciones
   * @param {string} [player='player1'] - Jugador al que se aplican los mapeos ('player1' o 'player2')
   *
   * @example
   * inputSystem.setMappings({
   *   [INPUT_ACTIONS.NORTH]: { keyboard: ['SPACE'] },
   *   [INPUT_ACTIONS.SOUTH]: { keyboard: ['X'] },
   * }, 'player1');
   */
  setMappings(mappings, player = "player1") {
    Object.keys(mappings).forEach((action) => {
      this.setMapping(action, mappings[action], player);
    });
  }

  /**
   * Verifica si una acción está siendo presionada actualmente por un jugador
   * Combina la entrada de teclado y gamepad (OR lógico)
   *
   * @param {string} action - La acción a verificar (usar INPUT_ACTIONS constantes)
   * @param {string} [player='player1'] - Jugador a verificar ('player1' o 'player2')
   * @returns {boolean} true si la acción está siendo presionada
   *
   * @example
   * // En el método update() de una escena
   * if (inputSystem.isPressed(INPUT_ACTIONS.NORTH, 'player1')) {
   *   // Acción continua mientras se mantiene presionado
   *   player.jump();
   * }
   */
  isPressed(action, player = "player1") {
    return (
      this.isKeyboardPressed(action, player) ||
      this.isGamepadPressed(action, player)
    );
  }

  /**
   * Verifica si una acción fue presionada en este frame específico por un jugador
   * Útil para acciones que deben ejecutarse una sola vez por pulsación
   *
   * @param {string} action - La acción a verificar (usar INPUT_ACTIONS constantes)
   * @param {string} [player='player1'] - Jugador a verificar ('player1' o 'player2')
   * @returns {boolean} true si la acción fue presionada en este frame
   *
   * @example
   * // En el método update() de una escena
   * if (inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, 'player1')) {
   *   // Acción única por pulsación
   *   openMenu();
   * }
   */
  isJustPressed(action, player = "player1") {
    return (
      this.isKeyboardJustPressed(action, player) ||
      this.isGamepadJustPressed(action, player)
    );
  }

  /**
   * Verifica entrada de teclado para una acción específica de un jugador
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @param {string} [player='player1'] - Jugador a verificar
   * @returns {boolean} true si está presionada via teclado
   */
  isKeyboardPressed(action, player = "player1") {
    if (
      !this.mapping[player] ||
      !this.mapping[player][action] ||
      !this.mapping[player][action].keyboard
    )
      return false;

    return this.mapping[player][action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && keyObj.isDown;
    });
  }

  /**
   * Verifica si una acción de teclado fue presionada en este frame por un jugador
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @param {string} [player='player1'] - Jugador a verificar
   * @returns {boolean} true si fue presionada via teclado en este frame
   */
  isKeyboardJustPressed(action, player = "player1") {
    if (
      !this.mapping[player] ||
      !this.mapping[player][action] ||
      !this.mapping[player][action].keyboard
    )
      return false;

    return this.mapping[player][action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && Phaser.Input.Keyboard.JustDown(keyObj);
    });
  }

  /**
   * Verifica entrada de gamepad para una acción específica de un jugador
   * Maneja tanto botones como ejes del joystick
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @param {string} [player='player1'] - Jugador a verificar ('player1' o 'player2')
   * @returns {boolean} true si está presionada via gamepad
   */
  isGamepadPressed(action, player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;

    if (
      !gamepad ||
      !this.mapping[player] ||
      !this.mapping[player][action] ||
      !this.mapping[player][action].gamepad
    )
      return false;

    return this.mapping[player][action].gamepad.some((input) => {
      if (input.type === "button") {
        return (
          gamepad.buttons[input.index] && (gamepad.buttons[input.index].pressed || gamepad.buttons[input.index].value > 0.5)
        );
      } else if (input.type === "axis") {
        const axisValue = gamepad.axes[input.index].getValue();
        return input.dir > 0 ? axisValue > 0.5 : axisValue < -0.5;
      }
      return false;
    });
  }

  /**
   * Verifica si una acción de gamepad fue presionada en este frame por un jugador
   * Implementa detección de "just pressed" para botones y ejes
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @param {string} [player='player1'] - Jugador a verificar ('player1' o 'player2')
   * @returns {boolean} true si fue presionada via gamepad en este frame
   */
isGamepadJustPressed(action, player = "player1") {
  const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;

  if (
    !gamepad ||
    !this.mapping[player] ||
    !this.mapping[player][action] ||
    !this.mapping[player][action].gamepad
  )
    return false;

  if (!this.previousButtonStates) this.previousButtonStates = {};
  if (!this.previousButtonStates[player]) this.previousButtonStates[player] = {};

  return this.mapping[player][action].gamepad.some((input) => {
    if (input.type === "button") {
      const button = gamepad.buttons[input.index];
      if (!button) return false;

      const pressedNow = button.pressed || button.value > 0.5;
      const prevPressed = this.previousButtonStates[player][input.index] || false;

      // Guardar estado actual para el próximo frame
      this.previousButtonStates[player][input.index] = pressedNow;

      // Solo retorna true cuando cambia de no presionado → presionado
      return pressedNow && !prevPressed;
    }

    if (input.type === "axis") {
      const axisValue = gamepad.axes[input.index].getValue();
      const threshold = 0.5;
      const isPressed = input.dir > 0 ? axisValue > threshold : axisValue < -threshold;
      const stateKey = `axis_${input.index}_${input.dir}`;

      this.previousAxisStates ??= {};
      this.previousAxisStates[player] ??= {};

      const wasPressed = this.previousAxisStates[player][stateKey];
      this.previousAxisStates[player][stateKey] = isPressed;

      return isPressed && !wasPressed;
    }

    return false;
  });
}

  /**
   * Obtiene la configuración actual de mapeo
   * Útil para debugging o para mostrar controles al usuario
   *
   * @returns {Object} Copia de la configuración actual de mapeo
   *
   * @example
   * const currentMapping = inputSystem.getMapping();
   * console.log('Teclas para saltar:', currentMapping[INPUT_ACTIONS.NORTH].keyboard);
   */
  getMapping() {
    return { ...this.mapping };
  }

  /**
   * Configura controles de teclado para acciones específicas de un jugador
   * Los controles de gamepad permanecen fijos para compatibilidad con Unraf
   * Método principal para personalización de controles
   *
   * @param {Object} keyboardMappings - Objeto con mapeo de acción -> teclas
   * @param {string} [player='player1'] - Jugador al que se aplican los mapeos ('player1' o 'player2')
   *
   * @example
   * // Configuración para jugador 1
   * inputSystem.configureKeyboard({
   *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.W],
   *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.S],
   *   [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
   *   [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D]
   * }, 'player1');
   *
   * // Configuración para jugador 2
   * inputSystem.configureKeyboard({
   *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.UP],
   *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
   *   [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
   *   [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT]
   * }, 'player2');
   */
  configureKeyboard(keyboardMappings, player = "player1") {
    if (!this.mapping[player]) return;

    Object.keys(keyboardMappings).forEach((action) => {
      if (this.mapping[player][action]) {
        // Mantener mapeo de gamepad sin cambios, solo actualizar teclado
        this.mapping[player][action].keyboard = keyboardMappings[action];

        // Agregar nuevas teclas de teclado a la colección de teclas
        keyboardMappings[action].forEach((key) => {
          if (!this.keys[key]) {
            this.keys[key] = this.input.keyboard.addKey(key);
          }
        });
      }
    });
  }

  /**
   * Configura controles de teclado usando strings en lugar de KeyCodes para un jugador
   * Método más conveniente para configuración rápida
   *
   * @param {Object} keyboardMappings - Objeto con mapeo de acción -> strings de teclas
   * @param {string} [player='player1'] - Jugador al que se aplican los mapeos ('player1' o 'player2')
   *
   * @example
   * // Configuración para jugador 1
   * inputSystem.configureKeyboardByString({
   *   [INPUT_ACTIONS.NORTH]: ['W'],
   *   [INPUT_ACTIONS.SOUTH]: ['S'],
   *   [INPUT_ACTIONS.EAST]: ['D'],
   *   [INPUT_ACTIONS.WEST]: ['A']
   * }, 'player1');
   *
   * // Configuración para jugador 2
   * inputSystem.configureKeyboardByString({
   *   [INPUT_ACTIONS.NORTH]: ['UP'],
   *   [INPUT_ACTIONS.SOUTH]: ['DOWN'],
   *   [INPUT_ACTIONS.EAST]: ['RIGHT'],
   *   [INPUT_ACTIONS.WEST]: ['LEFT']
   * }, 'player2');
   */
  configureKeyboardByString(keyboardMappings, player = "player1") {
    const convertedMappings = {};

    Object.keys(keyboardMappings).forEach((action) => {
      convertedMappings[action] = keyboardMappings[action].map((keyString) => {
        // Convertir string a KeyCode si existe, sino usar el string directamente
        const keyCode = Phaser.Input.Keyboard.KeyCodes[keyString.toUpperCase()];
        return keyCode !== undefined ? keyCode : keyString;
      });
    });

    this.configureKeyboard(convertedMappings, player);
  }

  /**
   * Obtiene la configuración actual de teclado para una acción de un jugador
   * Útil para mostrar controles actuales al usuario
   *
   * @param {string} action - El nombre de la acción
   * @param {string} [player='player1'] - Jugador a consultar ('player1' o 'player2')
   * @returns {Array} Array de teclas asignadas a esta acción
   *
   * @example
   * const jumpKeys = inputSystem.getKeyboardMapping(INPUT_ACTIONS.NORTH, 'player1');
   * console.log('Teclas para saltar del jugador 1:', jumpKeys);
   */
  getKeyboardMapping(action, player = "player1") {
    return this.mapping[player] &&
      this.mapping[player][action] &&
      this.mapping[player][action].keyboard
      ? [...this.mapping[player][action].keyboard]
      : [];
  }

  /**
   * Obtiene todos los mapeos de teclado actuales de un jugador
   * Útil para generar una pantalla de configuración de controles
   *
   * @param {string} [player='player1'] - Jugador a consultar ('player1' o 'player2')
   * @returns {Object} Objeto con todos los mapeos de teclado
   *
   * @example
   * const player1Mappings = inputSystem.getAllKeyboardMappings('player1');
   * // Mostrar en UI de configuración
   * Object.keys(player1Mappings).forEach(action => {
   *   console.log(`${action}: ${player1Mappings[action].join(', ')}`);
   * });
   */
  getAllKeyboardMappings(player = "player1") {
    if (!this.mapping[player]) return {};

    const keyboardMappings = {};
    Object.keys(this.mapping[player]).forEach((action) => {
      keyboardMappings[action] = this.getKeyboardMapping(action, player);
    });
    return keyboardMappings;
  }

  /**
   * Verifica si un gamepad está conectado para un jugador específico
   *
   * @param {string} [player='player1'] - Jugador a verificar ('player1' o 'player2')
   * @returns {boolean} true si el gamepad está conectado
   *
   * @example
   * if (inputSystem.isGamepadConnected('player1')) {
   *   console.log('Gamepad del jugador 1 está conectado');
   * }
   */
  isGamepadConnected(player = "player1") {
    return player === "player1"
      ? this.gamepad1 !== null
      : this.gamepad2 !== null;
  }

  /**
   * Obtiene información del gamepad conectado para un jugador
   *
   * @param {string} [player='player1'] - Jugador a consultar ('player1' o 'player2')
   * @returns {Object|null} Información del gamepad o null si no está conectado
   *
   * @example
   * const gamepadInfo = inputSystem.getGamepadInfo('player1');
   * if (gamepadInfo) {
   *   console.log('Gamepad:', gamepadInfo.id);
   * }
   */
  getGamepadInfo(player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;
    if (!gamepad) return null;

    return {
      id: gamepad.id,
      index: gamepad.index,
      connected: true,
    };
  }

  /**
   * Método de debug para ver el estado de todos los botones del gamepad
   * Útil para identificar qué índices de botones están siendo presionados
   *
   * @param {string} [player='player1'] - Jugador a consultar ('player1' o 'player2')
   * @returns {Object} Estado de todos los botones y ejes
   *
   * @example
   * const debug = inputSystem.debugGamepad('player1');
   * console.log('Botones presionados:', debug.pressedButtons);
   */
  debugGamepad(player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;
    if (!gamepad) return null;

    const pressedButtons = [];
    const axes = [];

    gamepad.buttons.forEach((button, index) => {
      if (button.pressed) {
        pressedButtons.push({ index, value: button.value });
      }
    });

    gamepad.axes.forEach((axis, index) => {
      const value = axis.getValue();
      if (Math.abs(value) > 0.1) {
        axes.push({ index, value });
      }
    });

    return {
      id: gamepad.id,
      pressedButtons,
      axes,
      totalButtons: gamepad.buttons.length,
      totalAxes: gamepad.axes.length,
    };
  }
}

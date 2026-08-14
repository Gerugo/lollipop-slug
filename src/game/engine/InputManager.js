export class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      shoot: false,
      grenade: false,
      vehicle: false,
      pause: false
    };

    this.prevKeys = { ...this.keys };
    this.justPressedKeys = { ...this.keys };

    // Virtual Touch Gamepad state
    this.touchState = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      shoot: false,
      grenade: false,
      vehicle: false,
      pause: false
    };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
  }

  init() {
    this.attach();
  }

  start() {
    this.attach();
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }

  _onKeyDown(e) {
    const code = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      e.preventDefault();
    }

    switch (code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = true;
        break;
      case 'Space':
        this.keys.jump = true;
        break;
      case 'KeyJ':
      case 'KeyZ':
        this.keys.shoot = true;
        break;
      case 'KeyK':
      case 'KeyX':
        this.keys.grenade = true;
        break;
      case 'KeyE':
        this.keys.vehicle = true;
        break;
      case 'Escape':
      case 'KeyP':
        this.keys.pause = true;
        break;
      default:
        break;
    }
  }

  _onKeyUp(e) {
    const code = e.code;
    switch (code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      case 'KeyJ':
      case 'KeyZ':
        this.keys.shoot = false;
        break;
      case 'KeyK':
      case 'KeyX':
        this.keys.grenade = false;
        break;
      case 'KeyE':
        this.keys.vehicle = false;
        break;
      case 'Escape':
      case 'KeyP':
        this.keys.pause = false;
        break;
      default:
        break;
    }
  }

  _onBlur() {
    this.reset();
  }

  setTouchInput(action, active) {
    if (action in this.touchState) {
      this.touchState[action] = Boolean(active);
    }
  }

  update() {
    const currentCombined = {
      left: Boolean(this.keys.left || this.touchState.left),
      right: Boolean(this.keys.right || this.touchState.right),
      up: Boolean(this.keys.up || this.touchState.up),
      down: Boolean(this.keys.down || this.touchState.down),
      jump: Boolean(this.keys.jump || this.touchState.jump),
      shoot: Boolean(this.keys.shoot || this.touchState.shoot),
      grenade: Boolean(this.keys.grenade || this.touchState.grenade),
      vehicle: Boolean(this.keys.vehicle || this.touchState.vehicle),
      pause: Boolean(this.keys.pause || this.touchState.pause)
    };

    for (const key in currentCombined) {
      this.justPressedKeys[key] = currentCombined[key] && !this.prevKeys[key];
      this.prevKeys[key] = currentCombined[key];
    }
  }

  isDown(action) {
    return Boolean(this.keys[action] || this.touchState[action] || this.prevKeys[action]);
  }

  isJustPressed(action) {
    if (this.justPressedKeys[action]) return true;
    return Boolean((this.keys[action] || this.touchState[action]) && !this.prevKeys[action]);
  }

  reset() {
    for (const key in this.keys) {
      this.keys[key] = false;
      this.touchState[key] = false;
      this.prevKeys[key] = false;
      this.justPressedKeys[key] = false;
    }
  }
}

export default InputManager;

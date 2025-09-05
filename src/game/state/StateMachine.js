import { State } from "./State.js";

export class StateMachine {
  constructor(initialStateName) {
    this.states = {};
    this.currentState = null;
    this.currentStateName = initialStateName;
    this.onEnter = {}; // callbacks al entrar a un estado
    this.onExit = {}; // callbacks al salir de un estado
  }

  addState(name, state, { onEnter, onExit } = {}) {
    this.states[name] = state;
    if (onEnter) this.onEnter[name] = onEnter;
    if (onExit) this.onExit[name] = onExit;
  }

  changeState(name, params) {
    if (this.currentState) {
      this.currentState.finish();
      if (this.onExit[this.currentStateName]) {
        this.onExit[this.currentStateName](params);
      }
    }
    this.currentStateName = name;
    this.currentState = this.states[name];
    if (this.currentState) {
      this.currentState.init(params);
      if (this.onEnter[name]) {
        this.onEnter[name](params);
      }
    }
  }

  update(dt) {
    if (this.currentState) {
      this.currentState.update(dt);
    }
  }
}

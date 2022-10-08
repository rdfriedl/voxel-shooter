import { Signal } from "../../common/utils/emitter";

export const keyStates: Record<string, boolean | undefined> = {};
export const mouseButtonStates: Record<number, boolean> = {};

const BLOCKED_EVENTS = ["Tab"];

document.addEventListener("keydown", (event) => {
  if (BLOCKED_EVENTS.includes(event.code)) {
    event.preventDefault();
  }
  keyStates[event.code] = true;
  onKeyStatesChange.emit(keyStates);
});
document.addEventListener("keyup", (event) => {
  keyStates[event.code] = false;
  onKeyStatesChange.emit(keyStates);
});

document.addEventListener("mousedown", (event) => {
  mouseButtonStates[event.button] = true;
  onMouseStates.emit(mouseButtonStates);
});
document.addEventListener("mouseup", (event) => {
  mouseButtonStates[event.button] = false;
  onMouseStates.emit(mouseButtonStates);
});

export const onKeyStatesChange = new Signal<[typeof keyStates]>();
export const onMouseStates = new Signal<[typeof mouseButtonStates]>();

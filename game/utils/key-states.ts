export const keyStates: Record<string, boolean | undefined> = {};
export const mouseButtonStates: Record<number, boolean> = {};

document.addEventListener("keydown", (event) => {
  keyStates[event.code] = true;
});
document.addEventListener("keyup", (event) => {
  keyStates[event.code] = false;
});

document.addEventListener("mousedown", (event) => {
  mouseButtonStates[event.button] = true;
});
document.addEventListener("mouseup", (event) => {
  mouseButtonStates[event.button] = false;
});

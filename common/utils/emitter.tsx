export type Listener<T extends unknown[]> = (...args: T) => void;

export class Emitter {
  listeners = new Map<string, Set<Listener<any[]>>>();

  getListeners(event: string) {
    let listeners = this.listeners.get(event);
    if (!listeners) {
      const listeners = new Set<Listener<any[]>>();
      this.listeners.set(event, listeners);
      return listeners;
    }
    return listeners;
  }
  addListener(event: string, listener: Listener<any[]>) {
    this.getListeners(event).add(listener);
  }
  removeListener(event: string, listener: Listener<any[]>) {
    this.getListeners(event).delete(listener);
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.getListeners(event);

    for (const listener of listeners) {
      listener(...args);
    }
  }
}

export class Signal<T extends any[]> {
  listeners = new Set<Listener<T>>();
  contexts = new WeakMap<Listener<T>, any>();
  addListener(listener: Listener<T>, ctx?: any) {
    this.listeners.add(listener);
    this.contexts.set(listener, ctx);
  }
  removeListener(listener: Listener<T>) {
    this.listeners.delete(listener);
    this.contexts.delete(listener);
  }

  emit(...args: T) {
    for (const listener of this.listeners) {
      listener.apply(this.contexts.get(listener), args);
    }
  }
}

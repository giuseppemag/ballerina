export {};

declare global {
  interface Array<T> {
    random(): T;
  }
}
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

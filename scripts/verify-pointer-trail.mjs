// Isolated event/animation test; this does not connect to or control a browser.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let reduced = false;
const media = new Map();
class FakeElement extends EventTarget {
  constructor() {
    super(); this.dataset = {}; this.style = { setProperty(name, value) { this[name] = value; } }; this.controls = []; this.animations = [];
  }
  closest() { return null; }
  querySelectorAll() { return this.controls; }
  getBoundingClientRect() { return { left: 0, top: 0, right: 900, bottom: 700, width: 900, height: 700 }; }
  animate(frames, options) { const animation = { frames, options, cancel() { this.cancelled = true; } }; this.animations.push(animation); return animation; }
}
globalThis.Element = FakeElement;
globalThis.document = new EventTarget();
document.hidden = false;
document.documentElement = { getAttribute: () => null };
globalThis.window = new EventTarget();
window.innerWidth = 1440;
window.location = { search: '' };
window.matchMedia = (query) => {
  if (!media.has(query)) {
    const result = new EventTarget();
    Object.defineProperty(result, 'matches', { get: () => query.includes('prefers-reduced-motion') ? reduced : true });
    media.set(query, result);
  }
  return media.get(query);
};
globalThis.getComputedStyle = () => ({ visibility: 'visible', display: 'block' });
const { createPointerTrail } = require('../dist/motion/index.js');
const container = new FakeElement();
const layer = new FakeElement();
const slots = Array.from({ length: 28 }, () => new FakeElement());
const destroy = createPointerTrail({ container, layer, slots, minDistance: 1, minInterval: 0, aspect: 1, width: () => 100 });
const move = (x, y, pointerType = 'mouse') => {
  const event = new Event('pointermove');
  Object.assign(event, { clientX: x, clientY: y, pointerType, buttons: 0 });
  container.dispatchEvent(event);
};
move(200, 200); move(300, 250);
assert.equal(slots[0].dataset.active, 'true');
assert.equal(slots[0].style.width, slots[0].style.height);
assert.equal(slots[0].animations[0].frames.length, 4);
const count = () => slots.reduce((sum, slot) => sum + slot.animations.length, 0);
const beforeTouch = count(); move(400, 200, 'touch');
assert.equal(count(), beforeTouch);
assert(slots.every((slot) => slot.dataset.active === 'false'));
move(200, 200); move(300, 250);
window.dispatchEvent(new Event('scroll'));
assert(slots.every((slot) => slot.dataset.active === 'false'));
reduced = true;
for (const result of media.values()) result.dispatchEvent(new Event('change'));
const beforeReduced = count(); move(200, 200); move(400, 250);
assert.equal(count(), beforeReduced);
destroy();
console.log('Rastro validado em isolamento: quadros de animação, proporção, cancelamento no scroll, touch e movimento reduzido.');

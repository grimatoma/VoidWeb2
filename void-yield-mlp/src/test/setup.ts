// Stable random for tests that exercise id generation. The sim uses
// Math.random() for building/ship/alert ids — replace with a deterministic
// counter so test snapshots/sequences don't flake.
let seq = 0;
const realRandom = Math.random;
Math.random = () => {
  seq = (seq * 9301 + 49297) % 233280;
  return seq / 233280;
};

// Reset id sequence between test files via beforeEach in tests as needed.
export function resetRandom() {
  seq = 0;
}

export function restoreRandom() {
  Math.random = realRandom;
}

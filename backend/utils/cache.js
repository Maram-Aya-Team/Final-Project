class InMemoryCache {
  constructor() {
    this.store = new Map();
    setInterval(() => this._cleanup(), 60_000);
  }
  set(key, value, ttlSeconds = 60) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
  get(key) {

    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }return entry.value;
  }
  del(pattern) {

    if (!pattern.includes("*")) {
      this.store.delete(pattern);
      return;
    }

    const prefix = pattern.replace("*", "");
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
  keys(prefix = "") {
    return [...this.store.keys()].filter(key =>
      key.startsWith(prefix)
    );
  }
  _cleanup() {

    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
  stats() {
    return {
      size: this.store.size,
      keys: [...this.store.keys()],
    };
  }
}
const cache = new InMemoryCache();

module.exports = cache;
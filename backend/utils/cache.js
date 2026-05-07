class InMemoryCache {
  constructor() {

    // تخزين البيانات داخل الذاكرة
    this.store = new Map();
    // تنظيف البيانات المنتهية كل دقيقة
    setInterval(() => this._cleanup(), 60_000);
  }


  // حفظ البيانات مع وقت انتهاء
  set(key, value, ttlSeconds = 60) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }


  // جلب البيانات إذا ما انتهت صلاحيتها
  get(key) {

    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }return entry.value;
  }
  // حذف cache باستخدام key أو wildcard
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


  // إرجاع جميع المفاتيح حسب prefix
  keys(prefix = "") {
    return [...this.store.keys()].filter(key =>
      key.startsWith(prefix)
    );
  }


  // حذف البيانات المنتهية
  _cleanup() {

    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }


  // معلومات عن حالة الـ cache
  stats() {
    return {
      size: this.store.size,
      keys: [...this.store.keys()],
    };
  }
}
// نسخة واحدة مشتركة داخل المشروع
const cache = new InMemoryCache();

module.exports = cache;
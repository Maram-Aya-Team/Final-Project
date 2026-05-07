const JORDAN_CITIES = ['Amman', 'Irbid', 'Zarqa', 'Ajloun', 'Jerash', 'Aqaba', 'Madaba', 'Karak'];
const JORDAN_AREAS = ['Sweifieh', 'Abdoun', 'Shmeisani', 'Zahran', 'Khalda', 'Downtown', 'Jubeiha', 'Tlaa Al Ali'];
const CATEGORIES = [
  { name: 'Electronics', icon: 'smartphone', keyword: 'electronics' },
  { name: 'Wallet', icon: 'wallet', keyword: 'wallet' },
  { name: 'Keys', icon: 'key', keyword: 'keys' },
  { name: 'Bag', icon: 'backpack', keyword: 'backpack' },
  { name: 'Documents', icon: 'file-text', keyword: 'documents' },
  { name: 'Jewelry', icon: 'gem', keyword: 'jewelry' },
  { name: 'Pet', icon: 'paw-print', keyword: 'pet,animal' },
  { name: 'Watch', icon: 'watch', keyword: 'watch' },
];
// يبني رابط صورة حسب التصنيف
const unsplashUrl = (keyword, w = 400, h = 300) =>
  `https://source.unsplash.com/${w}x${h}/?${keyword},lost,found`;

async function getFallbackPosts({ type = 'all', city = 'all', page = 1, limit = 12 } = {}) {

  // نجيب البيانات الخارجية مع بعض
  const [rawPosts, rawUsers] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json()),
    fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json()),
  ]);

  // نحولهم لشكل بوستات التطبيق
  const allPosts = rawPosts.map((post, i) => {

    const itemType = i % 3 === 0 ? 'found' : 'lost';
    const category = CATEGORIES[i % CATEGORIES.length];
    const cityName = JORDAN_CITIES[i % JORDAN_CITIES.length];
    const areaName = JORDAN_AREAS[i % JORDAN_AREAS.length];
    const user = rawUsers[(post.userId - 1) % rawUsers.length];
    const daysAgo = Math.floor(i * 0.3) % 30;

    const date = new Date(
      Date.now() - daysAgo * 86_400_000 - i * 3_600_000
    );

    const likes = Math.floor(Math.random() * 40);
    const comments = Math.floor(Math.random() * 15);
    const hasReward =
      itemType === 'lost' && i % 5 === 0;

    // نفس معادلة ترتيب الباك
    const ageHours = (Date.now() - date) / 3_600_000;
    const recency = Math.max(0, 100 - ageHours * 0.5);
    const engage = (likes * 2) + comments;
    const typePriority = itemType === 'lost' ? 20 : 0;
    const rankScore = Math.round(
      recency + engage + typePriority
    );

    return {
      _id: `ext-${post.id}`,
      type: itemType,
      title:
        post.title.charAt(0).toUpperCase()
        + post.title.slice(1, 60),
      description:
        post.body.replace(/\n/g, ' ').slice(0, 200),
      category,
      city: cityName,
      area: areaName,
      location: { address: `${areaName}, ${cityName}` },
      images: [unsplashUrl(category.keyword)],
      user: {
        _id: `ext-user-${user.id}`,
        name: user.name,
        avatar: `https://i.pravatar.cc/40?img=${user.id}`,
      },

      lostDate: itemType === 'lost' ? date.toISOString() : undefined,
      foundDate: itemType === 'found' ? date.toISOString() : undefined,
      reward:
        hasReward
          ? (Math.floor(Math.random() * 4) + 1) * 25
          : 0,
      isResolved: false,
      status: 'approved',
      likesCount: likes,
      commentsCount: comments,
      viewsCount: Math.floor(Math.random() * 200) + 10,
      rankScore,
      lastActivityAt: date.toISOString(),
      createdAt: date.toISOString(),

      // بوست جاي من API خارجي
      isFallback: true,
    };
  });

  let filtered = allPosts;

  // فلترة حسب النوع
  if (type !== 'all') {
    filtered = filtered.filter(post => post.type === type);
  }

  // فلترة حسب المدينة
  if (city !== 'all') {
    filtered = filtered.filter(post => post.city === city);
  }

  // ترتيب حسب الrank score
  filtered.sort((a, b) => b.rankScore - a.rankScore);

  // pagination
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  const hasMore = start + limit < filtered.length;

  return {
    posts: slice,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
    total: filtered.length,
    source: 'external',
  };
}

module.exports = { getFallbackPosts };
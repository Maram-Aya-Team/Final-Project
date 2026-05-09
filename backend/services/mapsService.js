const Post = require("../models/postSchema");

// مراكز المدن عشان نرجع الخريطة عالمدينة المختارة
const JORDAN_CITIES = {
  Amman: { lat: 31.9539, lng: 35.9106 },
  Irbid: { lat: 32.5568, lng: 35.8469 },
  Zarqa: { lat: 32.0728, lng: 36.0877 },
  Ajloun: { lat: 32.3326, lng: 35.7516 },
  Jerash: { lat: 32.2819, lng: 35.8997 },
  Mafraq: { lat: 32.3426, lng: 36.2023 },
  Balqa: { lat: 32.0328, lng: 35.7288 },
  Madaba: { lat: 31.7161, lng: 35.7939 },
  Karak: { lat: 31.1853, lng: 35.7044 },
  Tafilah: { lat: 30.8336, lng: 35.6042 },
  Maan: { lat: 30.1972, lng: 35.7345 },
  Aqaba: { lat: 29.5321, lng: 35.0065 },
};
const POPULATE = [
  { path: "user", select: "name avatar" },
  { path: "category", select: "name icon" },
];
// الحقول الي بدنا نرجعها للخريطة 
const PROJECTION = {
  title: 1,description: 1,type: 1,images: 1,city: 1,area: 1,location: 1,status: 1,isResolved: 1,itemDate: 1,reward: 1,category: 1,user: 1,createdAt: 1,
};

const mapsService = {

  // يجيب العناصر للخريطة مع فلترة مدينة / نوع / مسافة
  async getMapItems({ city, type = "all", lat, lng, radius = 50, limit = 200 }) {
    // حماية من limit كبير يخرب الأداء
    const safeLimit = Math.min(parseInt(limit) || 200, 500);
    // Mongo بده المسافة بالمتر
    const radiusM = parseFloat(radius) * 1000;
    // اذا في موقع مستخدم بنستخدم geoNear
    if (lat && lng) {

      const geoQuery = [
        {
          $geoNear: {
            // MongoDB بده [lng, lat] مش العكس
            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },

            distanceField: "distanceMeters",
            maxDistance: radiusM,
            spherical: true,

            // فقط البوستات المقبولة وغير المحلولة
            query: {
              status: "approved",
              isResolved: false,
            },
          },
        },

        { $limit: safeLimit },

        // نجيب معلومات التصنيف
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },

        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

        // نجيب معلومات المستخدم
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },

        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            ...PROJECTION,
            "user.name": 1,
            "user.avatar": 1,
            "category.name": 1,
            "category.icon": 1,
            distanceMeters: 1,
          },
        },
      ];

      // فلترة حسب المدينة اذا موجودة
      if (city) geoQuery[0].$geoNear.query.city = city;

      // فلترة حسب النوع
      if (type !== "all") geoQuery[0].$geoNear.query.type = type;

      const posts = await Post.aggregate(geoQuery);

      return {
        posts,
        total: posts.length,
        mode: "radius",
      };
    }

    // فلترة عادية بدون radius
    const filter = {
      status: "approved",
      isResolved: false,
    };

    if (city) filter.city = city;
    if (type !== "all") filter.type = type;

    const posts = await Post.find(filter, PROJECTION)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    return {
      posts,
      total: posts.length,
      mode: "city",
    };
  },

  // يرجع مركز المدينة للخريطة
  getCityCenter(cityName) {
    return JORDAN_CITIES[cityName] || JORDAN_CITIES.Amman;
  },

  // dropdown المدن
  getCitiesList() {
    return Object.entries(JORDAN_CITIES).map(([name, coords]) => ({
      name,
      ...coords,
    }));
  },
};

module.exports = mapsService;
const mapsService  = require('../services/mapsService');
const { asyncHandler } = require('../utils/helpers');
const mapsController = {
  // GET /api/maps/items?type=all&city=Amman&lat=31.9&lng=35.9&radius=10
  getItems: asyncHandler(async (req, res) => {
    const { type, city, lat, lng, radius, limit } = req.query;
    const result = await mapsService.getMapItems({ type, city, lat, lng, radius, limit });

    return res.status(200).json({
      success: true,
      data: {
        posts:  result.posts,
        total: result.total,
        mode:  result.mode,
      },
    });
  }),
  // GET /api/maps/cities — يرجع إحداثيات كل المدن
  getCities: asyncHandler(async (req, res) => {
    const cities = mapsService.getCitiesList();
    return res.status(200).json({ success: true, data: cities });
  }),
};

module.exports = mapsController;
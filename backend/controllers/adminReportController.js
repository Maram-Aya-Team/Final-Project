const Report = require("../models/report.schema");

const getAllReports = async (req, res) => {
  try {
    const { status, targetType, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalReports = await Report.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalReports,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReports / limitNumber),
      reports,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (status) report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllReports,
  updateReportStatus,
};
/**
 * Upload Controller — Handles secure image storage.
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        size: req.file.size,
        format: req.file.format
      }
    });
  } catch (error) {
    next(error);
  }
};

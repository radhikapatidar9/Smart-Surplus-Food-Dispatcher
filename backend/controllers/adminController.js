const User = require('../models/User');
const Donation = require('../models/Donation');

// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Add activity counts
    const usersWithActivity = await Promise.all(
      users.map(async (u) => {
        const userObj = u.toObject();
        if (u.role === 'restaurant') {
          userObj.activityCount = await Donation.countDocuments({ restaurantId: u._id });
          userObj.activityLabel = 'donations';
        } else if (u.role === 'volunteer') {
          userObj.activityCount = await Donation.countDocuments({ volunteerId: u._id });
          userObj.activityLabel = 'deliveries';
        } else if (u.role === 'ngo') {
          userObj.activityCount = await Donation.countDocuments({ ngoId: u._id });
          userObj.activityLabel = 'accepted';
        } else {
          userObj.activityCount = 0;
          userObj.activityLabel = '';
        }
        return userObj;
      })
    );

    res.json({ success: true, data: usersWithActivity });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const restaurants = await User.countDocuments({ role: 'restaurant' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const volunteers = await User.countDocuments({ role: 'volunteer' });

    const totalDonations = await Donation.countDocuments();
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const criticalDonations = await Donation.countDocuments({ category: 'critical' });
    const standardDonations = await Donation.countDocuments({ category: 'standard' });

    res.json({
      success: true,
      data: {
        totalUsers,
        restaurants,
        ngos,
        volunteers,
        totalDonations,
        deliveredDonations,
        pendingDonations,
        criticalDonations,
        standardDonations,
        criticalPct: totalDonations > 0 ? Math.round((criticalDonations / totalDonations) * 100) : 0,
        standardPct: totalDonations > 0 ? Math.round((standardDonations / totalDonations) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

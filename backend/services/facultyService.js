const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getFacultyDashboardStats = async (facultyId) => {
  // Fetch faculty events with capacity information.
  const facultyEvents = await Event.find({ organizer: facultyId })
    .select("_id status capacity title")
    .lean();

  const eventIds = facultyEvents.map((event) => event._id);

  // Calculate event status statistics.
  const totalEvents = facultyEvents.length;

  const approvedEvents = facultyEvents.filter(
    (event) => event.status === "approved",
  ).length;

  const pendingEvents = facultyEvents.filter(
    (event) => event.status === "pending",
  ).length;

  const rejectedEvents = facultyEvents.filter(
    (event) => event.status === "rejected",
  ).length;

  // Calculate active registrations for all faculty events.
  const totalRegistrations = await Registration.countDocuments({
    event: { $in: eventIds },
    status: "registered",
  });

  // Calculate registrations and capacity for each event.
  const registrationStats = await Registration.aggregate([
    {
      $match: {
        event: { $in: eventIds },
        status: "registered",
      },
    },
    {
      $group: {
        _id: "$event",
        registrations: { $sum: 1 },
      },
    },
  ]);

  const registrationMap = new Map(
    registrationStats.map((item) => [item._id.toString(), item.registrations]),
  );

  const eventAnalytics = facultyEvents.map((event) => {
    const registrations = registrationMap.get(event._id.toString()) || 0;

    const capacity = Number(event.capacity) || 0;

    const registrationPercentage =
      capacity > 0 ? Math.round((registrations / capacity) * 100) : 0;

    return {
      eventId: event._id,
      title: event.title,
      status: event.status,
      capacity,
      registrations,
      availableSeats: Math.max(capacity - registrations, 0),
      registrationPercentage,
    };
  });

  // Calculate overall registration capacity.
  const totalCapacity = eventAnalytics.reduce(
    (sum, event) => sum + event.capacity,
    0,
  );

  const overallRegistrationPercentage =
    totalCapacity > 0
      ? Math.round((totalRegistrations / totalCapacity) * 100)
      : 0;

  return {
    totalEvents,
    totalRegistrations,
    approvedEvents,
    pendingEvents,
    rejectedEvents,
    totalCapacity,
    overallRegistrationPercentage,
    eventAnalytics,
  };
};

module.exports = { getFacultyDashboardStats };

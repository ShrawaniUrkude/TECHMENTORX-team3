// Demo data for when MongoDB is not available

const demoUsers = [
  {
    _id: "demo-donor-1",
    name: "John Donor",
    email: "donor@demo.com",
    password: "$2a$10$demo", // password: demo123
    role: "donor",
    phone: "9876543210",
    address: "123 Main Street, Mumbai",
    points: 0,
    createdAt: new Date("2026-01-01"),
  },
  {
    _id: "demo-volunteer-1",
    name: "Jane Volunteer",
    email: "volunteer@demo.com",
    password: "$2a$10$demo",
    role: "volunteer",
    phone: "9876543211",
    address: "456 Service Road, Mumbai",
    points: 150,
    completedDeliveries: 12,
    createdAt: new Date("2026-01-01"),
  },
  {
    _id: "demo-org-1",
    name: "Hope Foundation",
    email: "org@demo.com",
    password: "$2a$10$demo",
    role: "organization",
    phone: "9876543213",
    address: "789 NGO Complex, Mumbai",
    organizationType: "ngo",
    registrationNumber: "NGO-MH-2025-001",
    points: 0,
    createdAt: new Date("2026-01-01"),
  },
  {
    _id: "demo-admin-1",
    name: "Admin User",
    email: "admin@demo.com",
    password: "$2a$10$demo",
    role: "admin",
    phone: "9876543212",
    address: "Admin Office, Mumbai",
    points: 0,
    createdAt: new Date("2026-01-01"),
  },
];

const demoDonations = [
  {
    _id: "demo-donation-1",
    donor: demoUsers[0],
    title: "Rice Bags",
    description: "25kg rice bags for distribution",
    category: "food",
    quantity: "25 kg",
    pickupAddress: "123 Main Street, Mumbai",
    city: "Mumbai",
    pincode: "400001",
    status: "pending",
    pointsAwarded: 50,
    createdAt: new Date("2026-02-05"),
  },
  {
    _id: "demo-donation-2",
    donor: demoUsers[0],
    title: "Winter Clothes",
    description: "Warm jackets and sweaters",
    category: "clothes",
    quantity: "15 items",
    pickupAddress: "123 Main Street, Mumbai",
    city: "Mumbai",
    pincode: "400001",
    status: "accepted",
    volunteer: demoUsers[1],
    pointsAwarded: 40,
    createdAt: new Date("2026-02-04"),
    acceptedAt: new Date("2026-02-05"),
  },
  {
    _id: "demo-donation-3",
    donor: demoUsers[0],
    title: "School Books",
    description: "Textbooks for students",
    category: "books",
    quantity: "30 books",
    pickupAddress: "123 Main Street, Mumbai",
    city: "Mumbai",
    pincode: "400001",
    status: "delivered",
    volunteer: demoUsers[1],
    pointsAwarded: 45,
    createdAt: new Date("2026-02-01"),
    acceptedAt: new Date("2026-02-02"),
    deliveredAt: new Date("2026-02-03"),
  },
];

const demoLeaderboard = [
  { _id: "1", name: "Jane Volunteer", points: 450, completedDeliveries: 35 },
  { _id: "2", name: "Priya Helper", points: 380, completedDeliveries: 28 },
  { _id: "3", name: "Rahul Kumar", points: 320, completedDeliveries: 24 },
  { _id: "4", name: "Amit Singh", points: 280, completedDeliveries: 20 },
  { _id: "5", name: "Sneha Patel", points: 250, completedDeliveries: 18 },
  { _id: "6", name: "Vikram Sharma", points: 220, completedDeliveries: 16 },
  { _id: "7", name: "Neha Gupta", points: 190, completedDeliveries: 14 },
  { _id: "8", name: "Arjun Reddy", points: 160, completedDeliveries: 12 },
  { _id: "9", name: "Kavita Joshi", points: 130, completedDeliveries: 10 },
  { _id: "10", name: "Suresh Nair", points: 100, completedDeliveries: 8 },
];

module.exports = {
  demoUsers,
  demoDonations,
  demoLeaderboard,

  findUserByEmail: (email) => demoUsers.find((u) => u.email === email),
  findUserById: (id) => demoUsers.find((u) => u._id === id),

  getDonationsByDonor: (donorId) => {
    // Return all demo donations for any demo user (flexible matching)
    if (donorId && donorId.toString().startsWith("demo-")) {
      return demoDonations.filter(
        (d) =>
          d.donor._id === donorId ||
          d.donor._id.toString().startsWith("demo-") ||
          d.donor._id === "demo-donor-1",
      );
    }
    return demoDonations.filter((d) => d.donor._id === donorId);
  },
  getDonationsByVolunteer: (volunteerId) =>
    demoDonations.filter((d) => d.volunteer?._id === volunteerId),
  getPendingDonations: () =>
    demoDonations.filter((d) => d.status === "pending"),
  getDonationById: (id) => demoDonations.find((d) => d._id === id),

  addDonation: (donation) => {
    const newDonation = {
      _id: `demo-donation-${Date.now()}`,
      ...donation,
      status: "pending",
      pointsAwarded: 50,
      createdAt: new Date(),
    };
    demoDonations.push(newDonation);
    console.log("📦 Added donation to demo data. Total:", demoDonations.length);
    return newDonation;
  },
};

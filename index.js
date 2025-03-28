const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

let rooms = Array.from({ length: 5 }, (_, i) => ({
  roomNumber: i + 1,
}));

let bookings = [];

//Book a Room (User can select a specific room)
app.post("/booking", (req, res) => {
  const { name, email, checkIn, checkOut, roomNumber } = req.body;

  // Check if the email already has an active booking
  const existingBooking = bookings.find((b) => b.email === email);
  if (existingBooking) {
    return res.status(400).json({
      message: `You already have a booking in Room ${existingBooking.roomNumber}. Your stay is from ${existingBooking.checkIn} to ${existingBooking.checkOut}.`,
    });
  }

  // Validate if the selected room exists
  const selectedRoom = rooms.find((room) => room.roomNumber === roomNumber);
  if (!selectedRoom) {
    return res.status(400).json({ message: "Invalid room number selected." });
  }

  // Check if the selected room is available
  const isRoomOccupied = bookings.some(
    (b) => b.roomNumber === roomNumber && b.checkOut >= checkIn
  );

  if (isRoomOccupied) {
    return res.status(400).json({
      message: `Room ${roomNumber} is already booked. Please select another available room.`,
    });
  }

  // Create a new booking
  const booking = {
    id: uuidv4(),
    name,
    email,
    checkIn,
    checkOut,
    roomNumber,
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

//Get Available Rooms
app.get("/available-rooms", (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];

  // Filter rooms that are NOT occupied
  const availableRooms = rooms.filter((room) => {
    const isOccupied = bookings.some(
      (b) => b.roomNumber === room.roomNumber && b.checkOut >= currentDate
    );
    return !isOccupied;
  });

  res.json({ availableRooms });
});

// View Booking Details by Email
app.get("/booking/:email", (req, res) => {
  const { email } = req.params;
  const booking = bookings.find((b) => b.email === email);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "No active booking found for this email ❌❌👎",
    });
  }

  res.json({
    success: true,
    message: `Booking found ✅. Room ${booking.roomNumber} is booked from ${booking.checkIn} to ${booking.checkOut}.`,
    booking,
  });
});

// View All Guests
app.get("/guests", (req, res) => {
  if (bookings.length === 0) {
    return res.status(404).json({ message: "No guests found ❌" });
  }

  res.json({
    success: true,
    guests: bookings.map(({ name, roomNumber }) => ({ name, roomNumber })),
  });
});

// Cancel Room Booking
app.delete("/cancel/:email", (req, res) => {
  const { email } = req.params;
  const index = bookings.findIndex((b) => b.email === email);

  if (index === -1) {
    return res.status(404).json({ message: "Booking not found ❌❌👎" });
  }

  const [removedBooking] = bookings.splice(index, 1);

  res.json({
    message:
      "Booking Cancelled 🟢🟢, always at your Service, Have a Nice Day 💝",
    removedBooking,
  });
});

// Modify Booking
app.put("/modify/:email", (req, res) => {
  const { email } = req.params;
  const { name, newEmail, checkIn, checkOut, roomNumber } = req.body;

  const booking = bookings.find((b) => b.email === email);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found ❌👎" });
  }

  let roomChangeWarning = "";

  // Check if room number is being modified
  if (roomNumber && roomNumber !== booking.roomNumber) {
    roomChangeWarning =
      "⚠️ Room change detected! Extra charges may be applicable.";
  }

  // Update the booking details if provided
  if (name) booking.name = name;
  if (newEmail) booking.email = newEmail;
  if (checkIn) booking.checkIn = checkIn;
  if (checkOut) booking.checkOut = checkOut;
  if (roomNumber) booking.roomNumber = roomNumber;

  res.json({
    message: "Booking updated successfully ✅",
    warning: roomChangeWarning,
    updatedBooking: booking,
  });
});

app.listen(3000, () => console.log("Server running on port 3000 🚀🚀"));

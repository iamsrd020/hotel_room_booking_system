const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

let rooms = Array.from({ length: 20 }, (_, i) => ({
  roomNumber: i + 1,
}));

let bookings = [];

// Book a Room with User-selected Room Option
app.post("/booking", (req, res) => {
  const { name, email, checkIn, checkOut, roomNumber } = req.body;

  // Check if the email already has an active booking
  const existingBooking = bookings.find((booking) => booking.email === email);
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
    (booking) =>
      booking.roomNumber === roomNumber && booking.checkOut >= checkIn
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

// Get Available Rooms
app.get("/available-rooms", (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date

  // Filter rooms that are NOT occupied
  const availableRooms = rooms.filter((room) => {
    const isOccupied = bookings.some(
      (booking) =>
        booking.roomNumber === room.roomNumber &&
        booking.checkOut >= currentDate
    );
    return !isOccupied;
  });

  res.json({ availableRooms });
});

app.listen(3000, () => console.log("Server running on port 3000 🚀🚀"));

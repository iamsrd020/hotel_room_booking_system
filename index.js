const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

let rooms = Array.from({ length: 10 }, (_, i) => ({
  roomNumber: i + 1,
}));

let bookings = [];

// Book a Room
app.post("/booking", (req, res) => {
  const { name, email, checkIn, checkOut } = req.body;

  // Check if the email already has an active booking
  const existingBooking = bookings.find((booking) => booking.email === email);

  if (existingBooking) {
    return res.status(400).json({
      message: `You already have a booking in Room ${existingBooking.roomNumber}. Your stay is from ${existingBooking.checkIn} to ${existingBooking.checkOut}.`,
    });
  }

  // Check if there is any available room
  const availableRoom = rooms.find((room) => {
    // Find a room that is either not booked or has been vacated
    const isRoomOccupied = bookings.some(
      (booking) =>
        booking.roomNumber === room.roomNumber && booking.checkOut >= checkIn
    );
    return !isRoomOccupied;
  });

  if (!availableRoom) {
    return res.status(400).json({
      message: "All rooms are currently occupied. Please try again later.",
    });
  }

  // Create a new booking
  const booking = {
    id: uuidv4(),
    name,
    email,
    checkIn,
    checkOut,
    roomNumber: availableRoom.roomNumber,
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

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let rooms = [];
let bookings = [];

const isRoomBooked = (roomId, date, startTime, endTime) => {
    return bookings.some(booking => 
        booking.roomId === roomId &&
        booking.date === date &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
         (endTime > booking.startTime && endTime <= booking.endTime))
    );
};

app.post('/api/rooms', (req, res) => {
    const { roomName, seats, amenities, pricePerHour } = req.body;
    const roomId = rooms.length + 1;
    rooms.push({ roomId, roomName, seats, amenities, pricePerHour });
    res.status(201).json({ roomId });
});

app.post('/api/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    if (isRoomBooked(roomId, date, startTime, endTime)) {
        return res.status(400).json({ message: 'Room is already booked for this time.' });
    }

    const bookingId = bookings.length + 1;
    bookings.push({ bookingId, customerName, date, startTime, endTime, roomId });
    res.status(201).json({ bookingId });
});

app.get('/api/rooms', (req, res) => {
    const roomData = rooms.map(room => {
        const booked = bookings.find(b => b.roomId === room.roomId);
        return {
            roomName: room.roomName,
            bookedStatus: booked ? 'Booked' : 'Available',
            customerName: booked ? booked.customerName : null,
            date: booked ? booked.date : null,
            startTime: booked ? booked.startTime : null,
            endTime: booked ? booked.endTime : null,
        };
    });
    res.json(roomData);
});

app.get('/api/customers', (req, res) => {
    const customerData = bookings.map(booking => {
        const room = rooms.find(r => r.roomId === booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room ? room.roomName : null,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        };
    });
    res.json(customerData);
});

app.get('/api/customer-bookings/:customerName', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter(b => b.customerName === customerName);
    const detailedBookings = customerBookings.map(booking => {
        const room = rooms.find(r => r.roomId === booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room ? room.roomName : null,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingId: booking.bookingId,
            bookingDate: new Date().toISOString(),
            bookingStatus: 'Confirmed',
        };
    });
    res.json(detailedBookings);
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

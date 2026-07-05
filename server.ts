import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// Define ES module replacements for CommonJS variables if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = "https://rrtbonmtytpmxjboehjq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydGJvbm10eXRwbXhqYm9laGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1MDU3MCwiZXhwIjoyMDk0OTI2NTcwfQ.-tBPPZXQnJ1uTpSh7HFfq2dfk-epG_acZJlqOYzCn9k";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define basic seed data matching the user's mockup exactly
const initialEvents = [
  {
    id: "e1",
    title: "Festival Kuliner Nusantara 2024",
    date: "15–17 Okt 2024",
    loc: "GBK, Jakarta Selatan",
    org: "Foodies ID",
    cat: "Festival",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=700",
    price: 150000,
    desc: "Rayakan kekayaan rasa nusantara. 200+ tenant UMKM terpilih bergabung dalam ekosistem transaksi modern.",
    status: "aktif",
    total: 25,
    tag: "🍜",
    slots: [
      { id: "A01", s: 0 }, { id: "A02", s: 0 }, { id: "A03", s: 1 }, { id: "A04", s: 0 }, { id: "A05", s: 1 },
      { id: "B01", s: 0 }, { id: "B02", s: 1 }, { id: "B03", s: 0 }, { id: "B04", s: 1 }, { id: "B05", s: 0 },
      { id: "C01", s: 1 }, { id: "C02", s: 0 }, { id: "C03", s: 1 }, { id: "C04", s: 0 }, { id: "C05", s: 0 },
      { id: "D01", s: 0 }, { id: "D02", s: 1 }, { id: "D03", s: 0 }, { id: "D04", s: 1 }, { id: "D05", s: 0 },
      { id: "E01", s: 1 }, { id: "E02", s: 0 }, { id: "E03", s: 1 }, { id: "E04", s: 0 }, { id: "E05", s: 1 }
    ]
  },
  {
    id: "e2",
    title: "Jakarta Tech & UMKM Expo",
    date: "22–24 Okt 2024",
    loc: "ICE BSD, Tangerang",
    org: "TechConnect",
    cat: "Pameran UMKM",
    img: "https://images.unsplash.com/photo-1540575861501-7ad0582373f3?auto=format&fit=crop&q=80&w=700",
    price: 500000,
    desc: "Pameran teknologi terintegrasi dengan sektor UMKM terbesar di Indonesia.",
    status: "aktif",
    total: 20,
    tag: "💻",
    slots: [
      { id: "A01", s: 1 }, { id: "A02", s: 1 }, { id: "A03", s: 0 }, { id: "A04", s: 1 }, { id: "A05", s: 0 },
      { id: "B01", s: 1 }, { id: "B02", s: 1 }, { id: "B03", s: 1 }, { id: "B04", s: 0 }, { id: "B05", s: 1 },
      { id: "C01", s: 0 }, { id: "C02", s: 1 }, { id: "C03", s: 1 }, { id: "C04", s: 0 }, { id: "C05", s: 1 },
      { id: "D01", s: 1 }, { id: "D02", s: 0 }, { id: "D03", s: 1 }, { id: "D04", s: 1 }, { id: "D05", s: 0 }
    ]
  },
  {
    id: "e3",
    title: "Grand Indonesia Fashion Week",
    date: "01–05 Nov 2024",
    loc: "Grand Indonesia, Jakarta",
    org: "GI Mall",
    cat: "Mall",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=700",
    price: 1200000,
    desc: "Fashion week bergengsi di jantung ibukota dengan ratusan brand lokal terbaik.",
    status: "aktif",
    total: 15,
    tag: "👗",
    slots: [
      { id: "A01", s: 0 }, { id: "A02", s: 1 }, { id: "A03", s: 0 }, { id: "A04", s: 1 }, { id: "A05", s: 0 },
      { id: "B01", s: 0 }, { id: "B02", s: 0 }, { id: "B03", s: 1 }, { id: "B04", s: 0 }, { id: "B05", s: 0 },
      { id: "C01", s: 1 }, { id: "C02", s: 0 }, { id: "C03", s: 1 }, { id: "C04", s: 0 }, { id: "C05", s: 0 }
    ]
  }
];

const initialBookings = [
  {
    id: "BK-001",
    evId: "e1",
    evTitle: "Festival Kuliner Nusantara 2024",
    slot: "A03",
    tName: "Alex Rizky",
    bName: "Kopi Senja Utama",
    bType: "Food & Beverage",
    pic: "Alex Rizky",
    phone: "08123456789",
    amt: 150000,
    status: "pending",
    proof: null,
    date: "12 Mei 2026, 09:45"
  },
  {
    id: "BK-002",
    evId: "e1",
    evTitle: "Festival Kuliner Nusantara 2024",
    slot: "B02",
    tName: "Sari Batik",
    bName: "Batik Nusantara",
    bType: "Fashion",
    pic: "Sari Indah",
    phone: "08234567890",
    amt: 150000,
    status: "confirmed",
    proof: "ok",
    date: "10 Mei 2026, 11:20"
  },
  {
    id: "BK-003",
    evId: "e2",
    evTitle: "Jakarta Tech & UMKM Expo",
    slot: "A01",
    tName: "Budi Tech",
    bName: "Budi Electronics",
    bType: "Elektronik",
    pic: "Budi Santoso",
    phone: "08345678901",
    amt: 500000,
    status: "rejected",
    proof: null,
    date: "08 Mei 2026, 14:00"
  }
];

const initialNotifs = [
  {
    id: "n1",
    title: "Booking #BK-002 Dikonfirmasi!",
    msg: "Slot B02 Festival Kuliner telah dikonfirmasi organizer.",
    type: "success",
    time: "2j lalu",
    read: false,
    role: "tenant"
  },
  {
    id: "n2",
    title: "Booking Baru Masuk",
    msg: "Kopi Senja Utama booking Slot A03 — menunggu verifikasi.",
    type: "info",
    time: "3j lalu",
    read: false,
    role: "organizer"
  },
  {
    id: "n3",
    title: "Bukti Bayar Diterima",
    msg: "Batik Nusantara upload bukti untuk Slot B02.",
    type: "warning",
    time: "5j lalu",
    read: true,
    role: "organizer"
  }
];

// REST API Endpoints

// 1. GET all events
app.get("/api/events", async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('id');
    if (error) {
      if (error.code === '42P01') {
        return res.status(500).json({ error: "Supabase tables are not created yet. Please run the SQL setup." });
      }
      throw error;
    }
    
    // Auto-seed if empty
    if (data.length === 0) {
      await supabase.from('events').insert(initialEvents);
      await supabase.from('bookings').insert(initialBookings);
      await supabase.from('notifications').insert(initialNotifs);
      return res.json(initialEvents);
    }
    
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE an event
app.post("/api/events", async (req, res) => {
  const { title, date, loc, org, cat, price, desc, status, img, tag, total } = req.body;
  
  if (!title || !date || !loc || price === undefined) {
    return res.status(400).json({ error: "Kolom title, date, loc, dan price wajib diisi." });
  }

  const totalSlots = Number(total) || 20;
  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / 5)); // A, B, C, D, E...
    const num = (i % 5) + 1;
    slots.push({ id: `${row}0${num}`, s: 0 });
  }

  const newEvent = {
    id: "e_" + Date.now(),
    title,
    date,
    loc,
    org: org || "Admin",
    cat: cat || "Festival",
    img: img || "https://images.unsplash.com/photo-1540575861501-7ad0582373f3?auto=format&fit=crop&q=80&w=700",
    price: Number(price),
    desc: desc || "Deskripsi event baru yang menarik untuk UMKM.",
    status: status || "aktif",
    total: totalSlots,
    tag: tag || "🎪",
    slots
  };

  const { data, error } = await supabase.from('events').insert([newEvent]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// 3. EDIT/UPDATE an event
app.put("/api/events/:id", async (req, res) => {
  const { title, date, loc, cat, price, desc, status, slots, img, total } = req.body;
  
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (date !== undefined) updateData.date = date;
  if (loc !== undefined) updateData.loc = loc;
  if (cat !== undefined) updateData.cat = cat;
  if (price !== undefined) updateData.price = Number(price);
  if (desc !== undefined) updateData.desc = desc;
  if (status !== undefined) updateData.status = status;
  if (slots !== undefined) updateData.slots = slots;
  if (img !== undefined) updateData.img = img;
  if (total !== undefined) updateData.total = Number(total);

  try {
    if (total !== undefined) {
      const { data: existingEvents } = await supabase.from('events').select('slots, total').eq('id', req.params.id);
      if (existingEvents && existingEvents.length > 0) {
        const existingEvent = existingEvents[0];
        if (Number(total) !== existingEvent.total) {
          const newTotal = Number(total);
          const newSlots = [];
          for (let i = 0; i < newTotal; i++) {
            const row = String.fromCharCode(65 + Math.floor(i / 5));
            const num = (i % 5) + 1;
            const slotId = `${row}0${num}`;
            const existingSlot = existingEvent.slots?.find((s: any) => s.id === slotId);
            newSlots.push({ id: slotId, s: existingSlot ? existingSlot.s : 0 });
          }
          updateData.slots = newSlots;
        }
      }
    }

    const { data, error } = await supabase.from('events').update(updateData).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    if (data.length === 0) return res.status(404).json({ error: "Event tidak ditemukan." });
    
    res.json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE an event
app.delete("/api/events/:id", async (req, res) => {
  const { error } = await supabase.from('events').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Event berhasil dihapus." });
});

// 5. Toggle a Slot manually
app.post("/api/events/:id/slots/:slotId/toggle", async (req, res) => {
  const { data: events, error } = await supabase.from('events').select('*').eq('id', req.params.id);
  if (error || events.length === 0) return res.status(404).json({ error: "Event tidak ditemukan." });
  
  const event = events[0];
  const slot = event.slots.find((s: any) => s.id === req.params.slotId);
  if (!slot) return res.status(404).json({ error: "Slot tidak ditemukan." });

  slot.s = slot.s === 1 ? 0 : 1;
  
  const { data: updated, error: updErr } = await supabase.from('events').update({ slots: event.slots }).eq('id', req.params.id).select();
  if (updErr) return res.status(500).json({ error: updErr.message });
  
  res.json(updated[0]);
});

// 6. GET all bookings
app.get("/api/bookings", async (req, res) => {
  const { data, error } = await supabase.from('bookings').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 7. CREATE a booking slot
app.post("/api/bookings", async (req, res) => {
  const { evId, slot, bName, bType, pic, phone } = req.body;

  if (!evId || !slot || !bName || !bType || !pic) {
    return res.status(400).json({ error: "Harap isi semua kolom wajib penawaran." });
  }

  // Get event
  const { data: events, error: evErr } = await supabase.from('events').select('*').eq('id', evId);
  if (evErr || events.length === 0) return res.status(404).json({ error: "Event tidak ditemukan." });
  const event = events[0];

  const slotObj = event.slots.find((s: any) => s.id === slot);
  if (!slotObj) return res.status(404).json({ error: "Slot tidak ditemukan." });
  if (slotObj.s === 1) return res.status(400).json({ error: "Maaf, slot ini sudah di-booking." });

  // Reserve slot
  slotObj.s = 1;
  await supabase.from('events').update({ slots: event.slots }).eq('id', evId);

  // Generate Booking
  const bkId = "BK-" + String(Math.floor(100 + Math.random() * 900));
  const now = new Date();
  const nowString = now.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const newBooking = {
    id: bkId,
    evId,
    evTitle: event.title,
    slot,
    tName: pic,
    bName,
    bType,
    pic,
    phone: phone || "",
    amt: event.price,
    status: "pending",
    proof: null,
    date: nowString
  };

  const { data: bData, error: bErr } = await supabase.from('bookings').insert([newBooking]).select();
  if (bErr) return res.status(500).json({ error: bErr.message });

  // Add Notification
  await supabase.from('notifications').insert([{
    id: "n_" + Date.now(),
    title: "Booking Baru Masuk",
    msg: `${bName} membooking Slot ${slot} di ${event.title} — menunggu bukti bayar.`,
    type: "info",
    time: "Baru saja",
    read: false,
    role: "organizer"
  }]);

  res.status(201).json(bData[0]);
});

// 8. Submit payment proof
app.post("/api/bookings/:id/pay", async (req, res) => {
  const { data: bookings, error } = await supabase.from('bookings').select('*').eq('id', req.params.id);
  if (error || bookings.length === 0) return res.status(404).json({ error: "Booking tidak ditemukan." });

  const booking = bookings[0];
  const { data: updData, error: updErr } = await supabase.from('bookings').update({ proof: req.body.proof || "ok" }).eq('id', req.params.id).select();
  if (updErr) return res.status(500).json({ error: updErr.message });

  await supabase.from('notifications').insert([{
    id: "n_" + Date.now(),
    title: "Bukti Pembayaran Diterima",
    msg: `Tenant ${booking.bName} mengunggah bukti bayar untuk Slot ${booking.slot}.`,
    type: "warning",
    time: "Baru saja",
    read: false,
    role: "organizer"
  }]);

  res.json(updData[0]);
});

// 9. Confirm / reject booking
app.post("/api/bookings/:id/verify", async (req, res) => {
  const { status } = req.body;
  if (status !== "confirmed" && status !== "rejected") {
    return res.status(400).json({ error: "Status harus 'confirmed' atau 'rejected'." });
  }

  const { data: bookings, error } = await supabase.from('bookings').select('*').eq('id', req.params.id);
  if (error || bookings.length === 0) return res.status(404).json({ error: "Booking tidak ditemukan." });
  const booking = bookings[0];

  await supabase.from('bookings').update({ status }).eq('id', req.params.id);

  // Find event and update slot if rejected
  const { data: events } = await supabase.from('events').select('*').eq('id', booking.evId);
  let event = null;
  if (events && events.length > 0) {
    event = events[0];
    const slotObj = event.slots.find((s: any) => s.id === booking.slot);
    if (slotObj) {
      if (status === "rejected") slotObj.s = 0;
      else slotObj.s = 1;
      await supabase.from('events').update({ slots: event.slots }).eq('id', booking.evId);
    }
  }

  // Notify tenant
  await supabase.from('notifications').insert([{
    id: "n_" + Date.now(),
    title: status === "confirmed" ? `Booking #${booking.id} Sukses!` : `Booking #${booking.id} Ditolak`,
    msg: status === "confirmed" 
      ? `Mantap! Slot ${booking.slot} di ${booking.evTitle} telah dikonfirmasi oleh panitia.`
      : `Registrasi pembayaran untuk ${booking.slot} ditolak. Silakan hubungi organizer.`,
    type: status === "confirmed" ? "success" : "error",
    time: "Baru saja",
    read: false,
    role: "tenant"
  }]);

  res.json({ booking: { ...booking, status }, event });
});

// 10. GET notifications
app.get("/api/notifications", async (req, res) => {
  const { data, error } = await supabase.from('notifications').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 11. Mark notification as read
app.post("/api/notifications/:id/read", async (req, res) => {
  await supabase.from('notifications').update({ read: true }).eq('id', req.params.id);
  res.json({ success: true });
});

// 12. Mark all notifications as read
app.post("/api/notifications/read-all", async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role dibutuhkan." });
  
  if (role === 'all') {
    await supabase.from('notifications').update({ read: true }).neq('id', 'null');
  } else {
    await supabase.from('notifications').update({ read: true }).eq('role', role);
  }
  res.json({ success: true });
});

// 13. GET Users
app.get("/api/users", async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 14. PUT Update User
app.put("/api/users/:id", async (req, res) => {
  const { name, email, av, password, bName, bType } = req.body;

  try {
    const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (userErr || !user) return res.status(404).json({ error: "User tidak ditemukan." });

    if (user.role === 'tenant' && bName !== undefined && bName.trim().length < 3) {
      return res.status(400).json({ error: "Nama bisnis minimal harus 3 karakter." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }

  const updates: any = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (av !== undefined) updates.av = av;
  if (password) updates.password = password;
  if (bName !== undefined) updates.bName = bName;
  if (bType !== undefined) updates.bType = bType;

  const { data, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 15. CREATE/REGISTER User
app.post("/api/users", async (req, res) => {
  const { id, name, email, role, av, password, bName, bType } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Kolom name, email, password, dan role wajib diisi." });
  }

  const newUser = {
    id: id || "u_" + Date.now(),
    name,
    email,
    role,
    av: av || `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}`,
    password,
    bName: bName || "",
    bType: bType || ""
  };

  const { data, error } = await supabase.from('users').insert([newUser]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

export default app;

// Vite server setup following the instructions precisely
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server + Vite listening on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server locally, Vercel will use the exported app
if (!process.env.VERCEL) {
  startServer();
}

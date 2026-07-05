import { EventItem, Booking, NotificationItem, User } from "./types";

// Dynamic base API proxy url
const BASE_URL = "/api";

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await fetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error("Gagal mengambil data event");
  return res.json();
}

export async function createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error("Gagal menambahkan event");
  return res.json();
}

export async function updateEvent(id: string, eventData: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(`${BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error("Gagal memperbarui event");
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus event");
}

export async function toggleEventSlot(id: string, slotId: string): Promise<EventItem> {
  const res = await fetch(`${BASE_URL}/events/${id}/slots/${slotId}/toggle`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Gagal mengubah status slot");
  return res.json();
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/bookings`);
  if (!res.ok) throw new Error("Gagal mengambil data booking");
  return res.json();
}

export async function createBooking(bookingData: {
  evId: string;
  slot: string;
  bName: string;
  bType: string;
  pic: string;
  tName?: string;
  phone?: string;
}): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Gagal membuat booking");
  }
  return res.json();
}

export async function submitPayment(id: string, proof: string): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings/${id}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proof }),
  });
  if (!res.ok) throw new Error("Gagal mengunggah bukti pembayaran");
  return res.json();
}

export async function verifyBooking(id: string, status: "confirmed" | "rejected"): Promise<{ booking: Booking; event: EventItem }> {
  const res = await fetch(`${BASE_URL}/bookings/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Gagal memverifikasi booking");
  return res.json();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${BASE_URL}/notifications`);
  if (!res.ok) throw new Error("Gagal mengambil data notifikasi");
  return res.json();
}

export async function readNotification(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Gagal menandai notifikasi telah dibaca");
}

export async function readAllNotifications(role: "tenant" | "organizer"): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Gagal membaca semua notifikasi");
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Gagal mengambil data user");
  return res.json();
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Gagal memperbarui data user");
  return res.json();
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Gagal mendaftarkan user baru");
  }
  return res.json();
}

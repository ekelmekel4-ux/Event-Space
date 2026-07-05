export interface Slot {
  id: string;
  s: number; // 0 = available, 1 = booked
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  loc: string;
  org: string;
  cat: string;
  img: string;
  price: number;
  desc: string;
  status: 'aktif' | 'draft' | 'selesai';
  total: number;
  tag: string;
  slots: Slot[];
  images?: string[];
}

export interface Booking {
  id: string;
  evId: string;
  evTitle: string;
  slot: string;
  tName: string;
  bName: string;
  bType: string;
  pic: string;
  phone: string;
  amt: number;
  status: 'pending' | 'confirmed' | 'rejected';
  proof: string | null;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  msg: string;
  type: 'success' | 'info' | 'warning' | 'error';
  time: string;
  read: boolean;
  role: 'tenant' | 'organizer' | 'all';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'organizer';
  av: string;
  password?: string;
  bName?: string;
  bType?: string;
}

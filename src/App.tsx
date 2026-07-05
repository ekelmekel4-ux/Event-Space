import { useState, useEffect } from "react";
import {
  Search, Calendar, MapPin, ChevronLeft, ChevronRight, Check, X,
  Trash2, Plus, ArrowRight, LogOut, ShieldAlert, Award, Clock,
  Home, List, FileText, Ticket, User as UserIcon, Bell, LayoutDashboard, CheckCircle, Info,
  LineChart, BarChart3, QrCode, Compass, Pencil, Eye, EyeOff
} from "lucide-react";

import { EventItem, Booking, NotificationItem, User } from "./types";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchEvents, createEvent, updateEvent, deleteEvent, toggleEventSlot,
  fetchBookings, createBooking, submitPayment, verifyBooking,
  fetchNotifications, readNotification, readAllNotifications,
  fetchUsers, updateUser, createUser
} from "./api";

import SplashView from "./components/SplashView";
import OnboardingView from "./components/OnboardingView";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import NotificationOverlay from "./components/NotificationOverlay";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for Storage
const supabaseUrl = "https://rrtbonmtytpmxjboehjq.supabase.co";
const supabaseKey = "sb_publishable_QXG2bXGzs8NgQHWZP0ry7Q_xC_Wi4xG";
const supabase = createClient(supabaseUrl, supabaseKey);

const USERS: Record<string, User> = {
  tenant: {
    id: "t1",
    name: "Go Youn Jung",
    email: "younjung@gmail.com",
    role: "tenant",
    av: "https://i.pravatar.cc/80?u=younjung"
  },
  organizer: {
    id: "o1",
    name: "Michael",
    email: "admin@eventspace.com",
    role: "organizer",
    av: "https://i.pravatar.cc/80?u=michael"
  }
};

const CATS = ["Semua", "Bazar", "Festival", "Pameran UMKM", "Mall"];

const initialUsers = [
  {
    id: "t1",
    name: "Go Youn Jung",
    email: "younjung@gmail.com",
    role: "tenant",
    av: "https://i.pravatar.cc/80?u=younjung",
    password: "tenant123",
    bName: "Kopi Senja Utama",
    bType: "Food & Beverage"
  },
  {
    id: "o1",
    name: "Michael",
    email: "admin@eventspace.com",
    role: "organizer",
    av: "https://i.pravatar.cc/80?u=michael",
    password: "admin123"
  }
];

const formatRangeDate = (startStr: string, endStr: string) => {
  if (!startStr) return "";
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return "";

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  const startYear = start.getFullYear();

  if (!endStr) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const end = new Date(endStr);
  if (isNaN(end.getTime())) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startDay} ${startMonth} ${startYear}`;
      }
      return `${startDay}–${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
};

const parseDateRange = (dateStr: string) => {
  if (!dateStr) return { start: "", end: "" };

  const monthsMap: Record<string, number> = {
    "jan": 0, "feb": 1, "mar": 2, "apr": 3, "mei": 4, "jun": 5,
    "jul": 6, "agu": 7, "sep": 8, "okt": 9, "nov": 10, "des": 11
  };

  const pad = (num: number) => String(num).padStart(2, '0');

  try {
    const cleanStr = dateStr.replace(/\s+/g, ' ').trim();

    // Check pattern: DD–DD Mmm YYYY (e.g. "15–17 Okt 2024")
    const match1 = cleanStr.match(/^(\d+)[–-](\d+)\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (match1) {
      const startDay = parseInt(match1[1]);
      const endDay = parseInt(match1[2]);
      const monthStr = match1[3].toLowerCase();
      const year = parseInt(match1[4]);
      const month = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : 0;

      return {
        start: `${year}-${pad(month + 1)}-${pad(startDay)}`,
        end: `${year}-${pad(month + 1)}-${pad(endDay)}`
      };
    }

    // Check pattern: DD Mmm YYYY (e.g. "15 Okt 2024")
    const match2 = cleanStr.match(/^(\d+)\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (match2) {
      const day = parseInt(match2[1]);
      const monthStr = match2[2].toLowerCase();
      const year = parseInt(match2[3]);
      const month = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : 0;

      const dateVal = `${year}-${pad(month + 1)}-${pad(day)}`;
      return { start: dateVal, end: dateVal };
    }

    // Check pattern: DD Mmm – DD Mmm YYYY (e.g. "30 Jun – 2 Jul 2026")
    const match3 = cleanStr.match(/^(\d+)\s+([a-zA-Z]+)\s*[–-]\s*(\d+)\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (match3) {
      const startDay = parseInt(match3[1]);
      const startMonthStr = match3[2].toLowerCase();
      const endDay = parseInt(match3[3]);
      const endMonthStr = match3[4].toLowerCase();
      const year = parseInt(match3[5]);

      const startMonth = monthsMap[startMonthStr] !== undefined ? monthsMap[startMonthStr] : 0;
      const endMonth = monthsMap[endMonthStr] !== undefined ? monthsMap[endMonthStr] : 0;

      return {
        start: `${year}-${pad(startMonth + 1)}-${pad(startDay)}`,
        end: `${year}-${pad(endMonth + 1)}-${pad(endDay)}`
      };
    }
  } catch (e) {
    console.error("Error parsing date range", e);
  }

  return { start: "", end: "" };
};

const parseIndonesianDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  try {
    const cleanStr = dateStr.replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleanStr.split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1].toLowerCase();
      const year = parseInt(parts[2], 10);

      const months: Record<string, number> = {
        januari: 0, jan: 0,
        februari: 1, feb: 1,
        maret: 2, mar: 2,
        april: 3, apr: 3,
        mei: 4,
        juni: 5, jun: 5,
        juli: 6, jul: 6,
        agustus: 7, ags: 7, agu: 7,
        september: 8, sep: 8,
        oktober: 9, okt: 9,
        november: 10, nov: 10,
        desember: 11, des: 11
      };

      let month = months[monthStr];
      if (month === undefined) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
        return null;
      }

      let hour = 0;
      let minute = 0;
      if (parts.length >= 4) {
        const timePart = parts[3];
        const timeSubParts = timePart.split(/[:.]/);
        if (timeSubParts.length >= 2) {
          hour = parseInt(timeSubParts[0], 10);
          minute = parseInt(timeSubParts[1], 10);
        }
      }

      return new Date(year, month, day, hour, minute);
    }
  } catch (e) {
    console.error("Error parsing date: ", dateStr, e);
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
};

const formatJuta = (val: number) => {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace('.0', '') + " Jt";
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(0) + " Rb";
  }
  return val.toString();
};

const formatIndonesianDateStr = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

export default function App() {

  const AppFooter = () => (
    <div className="bg-transparent mt-10 pt-6 pb-8 border-t border-slate-100 flex flex-row items-center justify-between text-[11px] text-[#94a3b8] font-normal px-2 shrink-0 select-none font-sans w-full">
      <div className="text-left">
        © 2026 EventSpace. All rights reserved.
      </div>
      <div className="flex gap-6 items-center justify-end">
        <button
          onClick={() => showToast("Kebijakan Privasi EventSpace")}
          className="text-[#94a3b8] hover:text-violet-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] font-normal font-sans"
        >
          Privacy Policy
        </button>
        <button
          onClick={() => showToast("Ketentuan Layanan EventSpace")}
          className="text-[#94a3b8] hover:text-violet-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] font-normal font-sans"
        >
          Terms of Service
        </button>
        <button
          onClick={() => setHelpModalOpen(true)}
          className="text-[#94a3b8] hover:text-violet-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] font-normal font-sans"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
  const [usersList, setUsersList] = useState<any[]>(() => {
    const saved = localStorage.getItem("eventspace_users");
    if (saved) return JSON.parse(saved);
    return initialUsers;
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem("eventspace_current_user_id");
    if (savedId) {
      const savedUsers = localStorage.getItem("eventspace_users");
      const list = savedUsers ? JSON.parse(savedUsers) : initialUsers;
      const matchedUser = list.find((u: any) => u.id === savedId);
      if (matchedUser) {
        return {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          av: matchedUser.av,
          bName: matchedUser.bName,
          bType: matchedUser.bType
        };
      }
    }
    return null;
  });

  const [screen, setScreen] = useState<string>(() => {
    const savedId = localStorage.getItem("eventspace_current_user_id");
    if (savedId) {
      const savedScreen = localStorage.getItem("eventspace_current_screen");
      if (savedScreen && savedScreen !== "splash" && savedScreen !== "onboarding" && savedScreen !== "landing" && savedScreen !== "login" && savedScreen !== "register") {
        return savedScreen;
      }
    }
    return "splash";
  });

  const [prevScreen, setPrevScreen] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<"tenant" | "organizer">("tenant");
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("eventspace_users", JSON.stringify(usersList));
  }, [usersList]);

  // Sync screen state to localStorage on transition
  useEffect(() => {
    if (screen && screen !== "splash" && screen !== "onboarding") {
      localStorage.setItem("eventspace_current_screen", screen);
    }
  }, [screen]);

  // Dynamic theme-color meta tag updater for physical phone status bar matching
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (screen === "landing" || screen === "splash" || screen === "onboarding") {
        meta.setAttribute("content", "#f4f6fb");
      } else {
        meta.setAttribute("content", "#ffffff");
      }
    }
  }, [screen]);

  // Data State loaded from REST API
  const [allEvents, setEvents] = useState<EventItem[]>([]);
  const [allBookings, setBookings] = useState<Booking[]>([]);
  const [allNotifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const events = user
    ? (user.role === "organizer"
      ? (user.email === "admin@eventspace.com"
        ? allEvents
        : allEvents.filter(e => e.org === user.name)
      )
      : allEvents
    )
    : allEvents;

  const bookings = user
    ? (user.role === "organizer"
      ? (user.email === "admin@eventspace.com"
        ? allBookings
        : allBookings.filter(b => events.some(e => e.id === b.evId))
      )
      : allBookings.filter(b =>
        (user.bName && b.bName === user.bName) ||
        (user.name && b.tName === user.name) ||
        (user.name && b.pic === user.name)
      )
    )
    : [];

  const notifications = allNotifications.filter(n => {
    if (!user) return false;
    if (user.role === "organizer") {
      return n.role === "organizer" || n.role === "all";
    }
    if (n.role === "tenant") {
      const userBookingIds = bookings.map(b => b.id);
      const hasMatchingBooking = userBookingIds.some(id =>
        n.title.includes(id) || n.msg.includes(id)
      );
      const mentionsUser = (user.bName && (n.title.includes(user.bName) || n.msg.includes(user.bName))) ||
        (user.name && (n.title.includes(user.name) || n.msg.includes(user.name)));
      return hasMatchingBooking || mentionsUser;
    }
    return n.role === "all";
  });

  // Search and Filters
  const [filterCat, setFilterCat] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("Pre");
  const [bookingTab, setBookingTab] = useState<string>("pending");

  // Selection State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [selectedActiveBk, setSelectedActiveBk] = useState<Booking | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "slots">("info");
  const [repStartDate, setRepStartDate] = useState<string>("2026-05-01");
  const [repEndDate, setRepEndDate] = useState<string>("2026-05-31");
  const [activeOrgSubView, setActiveOrgSubView] = useState<"dashboard" | "report">("dashboard");

  // App Utilities
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [paymentTimer, setPaymentTimer] = useState<number>(14 * 60 + 59);
  const [payMethod, setPayMethod] = useState<'qris' | 'va' | 'wallet'>('qris');

  // Form states
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register state (pure frontend mock)
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regRole, setRegRole] = useState<string>("tenant");

  // Booking Form State
  const [editProfileBName, setEditProfileBName] = useState<string>("");
  const [editProfileBType, setEditProfileBType] = useState<string>("");
  const [bFormPic, setBFormPic] = useState<string>("");
  const [bFormPhone, setBFormPhone] = useState<string>("");

  // Event Form State
  const [eFormTitle, setEFormTitle] = useState<string>("");
  const [eFormDate, setEFormDate] = useState<string>("");
  const [eFormStartDate, setEFormStartDate] = useState<string>("");
  const [eFormEndDate, setEFormEndDate] = useState<string>("");
  const [eFormTotal, setEFormTotal] = useState<number>(20);

  // Synchronize date pickers with eFormDate formatted string
  useEffect(() => {
    if (eFormStartDate) {
      const formatted = formatRangeDate(eFormStartDate, eFormEndDate);
      setEFormDate(formatted);
    }
  }, [eFormStartDate, eFormEndDate]);

  const [eFormLoc, setEFormLoc] = useState<string>("");
  const [eFormCat, setEFormCat] = useState<string>("Bazar");
  const [eFormPrice, setEFormPrice] = useState<number>(150000);
  const [eFormDesc, setEFormDesc] = useState<string>("");
  const [eFormImg, setEFormImg] = useState<string>("");
  const [eFormStatus, setEFormStatus] = useState<"aktif" | "draft" | "selesai">("aktif");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileEmail, setEditProfileEmail] = useState("");
  const [editProfileAv, setEditProfileAv] = useState("");
  const [secOldPass, setSecOldPass] = useState("");
  const [secNewPass, setSecNewPass] = useState("");
  const [uploadingProfileImg, setUploadingProfileImg] = useState(false);

  // Load initial data
  useEffect(() => {
    refreshData();
    // Default search state initialized correctly
    setSearchQuery("");
  }, []);

  // Sync Timer for QRIS payment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === "payment" && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, paymentTimer]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [evList, bkList, ntList, usrList] = await Promise.all([
        fetchEvents(),
        fetchBookings(),
        fetchNotifications(),
        fetchUsers()
      ]);
      setEvents(evList);
      setBookings(bkList);
      setNotifications(ntList);
      if (usrList && usrList.length > 0) {
        const savedProfiles = localStorage.getItem("eventspace_business_profiles");
        const profiles = savedProfiles ? JSON.parse(savedProfiles) : {
          "t1": { bName: "Kopi Senja Utama", bType: "Food & Beverage" }
        };
        const enrichedUsers = usrList.map((u: any) => {
          if (profiles[u.id]) {
            return { ...u, bName: profiles[u.id].bName, bType: profiles[u.id].bType };
          }
          return u;
        });
        setUsersList(enrichedUsers);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Gagal memperbarui data dari server.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const navigateTo = (nextScreen: string) => {
    setPrevScreen(screen);
    setScreen(nextScreen);
  };

  const handleLogin = () => {
    const emailExists = usersList.some(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.role === loginRole
    );

    if (!emailExists) {
      setLoginError("email salah");
      return;
    }

    const matchedUser = usersList.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.password === loginPassword &&
        u.role === loginRole
    );

    if (matchedUser) {
      setUser({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        av: matchedUser.av,
        bName: matchedUser.bName,
        bType: matchedUser.bType
      });
      localStorage.setItem("eventspace_current_user_id", matchedUser.id);
      setLoginError("");
      showToast(`Login berhasil! Selamat datang, ${matchedUser.name}!`);
      setBookingTab("pending");
      navigateTo(loginRole === "organizer" ? "org_dashboard" : "home");
    } else {
      setLoginError("pasword salah");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("eventspace_current_user_id");
    localStorage.removeItem("eventspace_current_screen");
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setShowPassword(false);
    showToast("Berhasil keluar dari sesi.");
    navigateTo("landing");
  };

  const handleToggleSlot = async (eventId: string, slotId: string) => {
    try {
      const updatedEvent = await toggleEventSlot(eventId, slotId);
      // update events list
      setEvents(allEvents.map(e => e.id === eventId ? updatedEvent : e));
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(updatedEvent);
      }
      showToast(`Status slot ${slotId} diperbarui.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal merubah status slot.");
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedEvent || !selectedSlot) return;
    if (!user?.bName || !user?.bType) {
      showToast("Profil Bisnis Anda belum lengkap. Silakan lengkapi di menu Edit Profil!");
      return;
    }
    if (!bFormPic.trim() || !bFormPhone.trim()) {
      showToast("Harap lengkapi semua baris bertanda * (PIC dan No Telp)");
      return;
    }

    // Validate phone number format (must contain 10-15 digits)
    const rawDigits = bFormPhone.replace(/[\D]/g, "");
    if (rawDigits.length < 10 || rawDigits.length > 15) {
      showToast("Nomor WhatsApp tidak valid (harus 10-15 digit angka)!");
      return;
    }

    try {
      const pendingBooking = await createBooking({
        evId: selectedEvent.id,
        slot: selectedSlot,
        bName: user.bName,
        bType: user.bType,
        pic: bFormPic,
        tName: user.name,
        phone: bFormPhone
      });
      setCurrentBooking(pendingBooking);
      setPaymentTimer(14 * 60 + 59);
      showToast("Konsep pendaftaran berhasil disimpan!");
      navigateTo("payment");
    } catch (err: any) {
      showToast(err.message || "Gagal membuat booking slot.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentBooking) return;
    try {
      await submitPayment(currentBooking.id, "ok_proof_submitted");
      await refreshData();
      showToast("Bukti pembayaran berhasil diupload!");
      navigateTo("my_bookings");
    } catch (err) {
      showToast("Gagal menyerahkan bukti pembayaran.");
    }
  };

  const handleVerifyBooking = async (bookingId: string, status: "confirmed" | "rejected") => {
    try {
      await verifyBooking(bookingId, status);
      await refreshData();
      showToast(`Pesanan berhasil ${status === "confirmed" ? "Dikonfirmasi" : "Ditolak"}`);
    } catch (err) {
      showToast("Gagal memproses verifikasi.");
    }
  };

  const handleSaveEvent = async () => {
    if (!eFormTitle.trim() || !eFormDate.trim() || !eFormLoc.trim()) {
      showToast("Semua baris bertanda wajib * harus diisi!");
      return;
    }

    // Ensure slot price is formatted correctly and greater than zero
    if (eFormPrice === undefined || eFormPrice === null || isNaN(eFormPrice) || eFormPrice <= 0) {
      showToast("Harga sewa per slot harus berupa angka yang valid!");
      return;
    }

    // Ensure slot price does not exceed upper bound limit (10.000.000)
    if (eFormPrice >= 10000001) {
      showToast("Harga sewa per slot tidak boleh melebihi Rp 10.000.000!");
      return;
    }

    // Ensure total slots count is formatted correctly and greater than zero
    if (eFormTotal === undefined || eFormTotal === null || isNaN(eFormTotal) || eFormTotal <= 0) {
      showToast("Jumlah slot booth harus berupa angka positif!");
      return;
    }

    try {
      if (editingEventId) {
        // Update
        await updateEvent(editingEventId, {
          title: eFormTitle,
          date: eFormDate,
          loc: eFormLoc,
          cat: eFormCat,
          price: eFormPrice,
          desc: eFormDesc,
          img: eFormImg,
          status: eFormStatus,
          total: eFormTotal
        });
        showToast("Event berhasil diperbarui!");
      } else {
        // Create
        await createEvent({
          title: eFormTitle,
          date: eFormDate,
          loc: eFormLoc,
          cat: eFormCat,
          price: eFormPrice,
          desc: eFormDesc,
          img: eFormImg,
          status: eFormStatus,
          org: user?.name || "Admin",
          total: eFormTotal
        });
        showToast("Event baru berhasil ditambahkan!");
      }
      await refreshData();
      navigateTo("org_events");
    } catch (err) {
      showToast("Gagal mengubah data event.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Event ini?")) return;
    try {
      await deleteEvent(id);
      await refreshData();
      showToast("Event berhasil dihapus.");
    } catch (err) {
      showToast("Gagal menghapus event.");
    }
  };

  const handleReadNotif = async (id: string) => {
    try {
      await readNotification(id);
      setNotifications(allNotifications.map(n => n.id === id ? { ...n, read: true } : n));

      // Close notifications popup
      setIsNotifOpen(false);

      if (!user) return;

      const notif = notifications.find(n => n.id === id);
      if (!notif) return;

      // Detect content to understand where to redirect
      const isConfirm = /konfirmasi|diterima|sukses|berhasil|confirmed|success/i.test(notif.title + " " + notif.msg);
      const isReject = /tolak|rejected|batal/i.test(notif.title + " " + notif.msg);

      if (user.role === "tenant") {
        if (isConfirm) {
          setBookingTab("confirmed");
        } else if (isReject) {
          setBookingTab("rejected");
        } else {
          setBookingTab("pending");
        }
        navigateTo("my_bookings");
        showToast(`Membuka Booking Anda: ${notif.title}`);
      } else if (user.role === "organizer") {
        if (isConfirm) {
          setBookingTab("confirmed");
        } else if (isReject) {
          setBookingTab("rejected");
        } else {
          setBookingTab("pending");
        }
        navigateTo("org_bookings");
        showToast(`Verifikasi Booking: ${notif.title}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAllNotifs = async () => {
    if (!user) return;
    try {
      await readAllNotifications(user.role);
      setNotifications(allNotifications.map(n => n.role === user.role || n.role === "all" ? { ...n, read: true } : n));
      showToast("Semua notifikasi dibaca.");
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="pill po">Menunggu</span>;
      case "confirmed":
        return <span className="pill pg">Dikonfirmasi</span>;
      case "rejected":
        return <span className="pill pr">Ditolak</span>;
      case "waiting":
        return <span className="pill pb">Belum Bayar</span>;
      case "aktif":
        return <span className="pill pg">Aktif</span>;
      case "draft":
        return <span className="pill pgy">Draft</span>;
      case "selesai":
        return <span className="pill pgy">Selesai</span>;
      default:
        return <span className="pill pgy">{status}</span>;
    }
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString("id-ID");
  };

  // Pre-fill input forms helpers
  const prepareEditForm = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEFormTitle(ev.title);
    setEFormDate(ev.date);
    const parsed = parseDateRange(ev.date);
    setEFormStartDate(parsed.start);
    setEFormEndDate(parsed.end);
    setEFormTotal(ev.total || ev.slots?.length || 20);
    setEFormLoc(ev.loc);
    setEFormCat(ev.cat);
    setEFormPrice(ev.price);
    setEFormDesc(ev.desc);
    setEFormImg(ev.img || "");
    setEFormStatus(ev.status);
    navigateTo("org_ev_form");
  };

  const prepareCreateForm = () => {
    setEditingEventId(null);
    setEFormTitle("");
    setEFormDate("");
    setEFormStartDate("");
    setEFormEndDate("");
    setEFormTotal(20);
    setEFormLoc("");
    setEFormCat("Bazar");
    setEFormPrice(150000);
    setEFormDesc("");
    setEFormImg("");
    setEFormStatus("aktif");
    navigateTo("org_ev_form");
  };

  // Filter & Search events list
  const filteredEventsForTenant = events.filter((e) => {
    const matchesCat = filterCat === "Semua" || e.cat === filterCat;
    const matchesQuery = searchQuery.trim() === "" ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.loc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Selamat Pagi";
    if (hour >= 12 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const WelcomeSlider = () => {
    const [idx, setIdx] = useState(0);
    const slides = [
      {
        img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200",
        title: `Halo ${getGreeting()}...`,
        subtitle: "silahkan mencari event ✨",
        desc: "EventSpace adalah platform modern yang menghubungkan Event Organizer (🏢) dan Tenant UMKM (🏪) secara interaktif."
      },
      {
        img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
        title: "Temukan Event Potensial",
        subtitle: "Bazaar & Festival 🎪",
        desc: "Jelajahi berbagai bazaar, festival kuliner, pameran buku, dan expo kreatif yang sesuai dengan target pasar bisnis Anda."
      },
      {
        img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200",
        title: "Pilih Slot Interaktif",
        subtitle: "Denah Visual 📍",
        desc: "Pantau ketersediaan slot tenant ter-update secara real-time. Pilih lokasi strategis dengan peta visual terintegrasi."
      },
      {
        img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
        title: "Pembayaran Instan",
        subtitle: "Lunas Seketika ✅",
        desc: "Transaksi sewa lewat QRIS otomatis atau transfer VA Bank. Status pesanan diverifikasi instan tanpa berkas fisik."
      }
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setIdx((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(timer);
    }, [slides.length]);

    const slide = slides[idx];

    return (
      <div
        className="relative w-full h-[250px] md:h-[280px] rounded-[24px] overflow-hidden shadow-xl shadow-violet-500/15 flex items-center bg-violet-900 group cursor-pointer"
        onClick={() => setIdx((prev) => (prev + 1) % slides.length)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            src={slide.img}
            alt="Welcome Background"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-violet-900/60 to-black/40 z-0" />

        <div className="relative z-10 px-6 md:px-8 w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-start text-left"
            >
              <div className="inline-block bg-fuchsia-500 text-white px-4 py-1 rounded-full text-[10px] md:text-[11px] font-black tracking-widest mb-2.5 uppercase shadow-lg shadow-fuchsia-500/30">
                {slide.subtitle}
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-3 font-sans tracking-tight drop-shadow-md">
                {slide.title}
              </h2>
              <p className="text-[11px] md:text-[13px] font-medium text-violet-100 mb-4 md:mb-6 max-w-[280px] leading-relaxed drop-shadow-sm">
                {slide.desc}
              </p>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateTo("explore");
            }}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-bold py-2.5 px-5 md:py-3.5 md:px-6 rounded-full text-[10px] md:text-xs tracking-wider transition-all active:scale-95 shadow-lg shadow-violet-500/30 relative z-20"
          >
            CARI EVENT SEKARANG
          </button>
        </div>

        {/* Global Floating Animations for EO & Tenant */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-6 right-6 text-4xl drop-shadow-lg opacity-80 hidden md:block pointer-events-none z-10"
        >
          🏪
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute bottom-6 right-16 text-4xl drop-shadow-lg opacity-80 hidden md:block pointer-events-none z-10"
        >
          🏢
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-fuchsia-400' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans antialiased text-slate-800">
      {/* Target Application Frame */}
      <div id="frame" className="w-full h-[100dvh] bg-[#f4f6fb] overflow-hidden relative flex flex-col select-none">

        {/* Soft Modern Warm Light Ambient Glow Layers */}
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 rounded-full bg-violet-600/5 blur-[64px] pointer-events-none z-0" />
        <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 rounded-full bg-fuchsia-600/5 blur-[64px] pointer-events-none z-0" />
        <div className="absolute top-[35%] right-[-140px] w-72 h-72 rounded-full bg-orange-500/5 blur-[80px] pointer-events-none z-0" />

        {/* Toast Alert popup overlay */}
        {toastMessage && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-violet-600 border border-violet-400 text-white px-5 py-2.5 rounded-2xl text-xs font-bold z-[100] tracking-wide pointer-events-none shadow-xl shadow-violet-600/30 whitespace-nowrap fade-up-anim flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white pulse-anim" />
            {toastMessage}
          </div>
        )}

        {/* Global Notifications Panel Overlay */}
        {isNotifOpen && user && (
          <NotificationOverlay
            notifications={notifications}
            role={user.role}
            onClose={() => setIsNotifOpen(false)}
            onRead={handleReadNotif}
            onReadAll={handleReadAllNotifs}
          />
        )}

        {/* Global QR Code Modal */}
        <AnimatePresence>
          {qrModalUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
            >
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center w-full max-w-sm">
                <h3 className="font-extrabold text-slate-800 mb-4 text-center">QR Akses Masuk</h3>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrModalUrl}`}
                  alt="QR Besar"
                  className="w-full h-auto aspect-square rounded-2xl border border-slate-200 p-2 mb-6 shadow-sm"
                />
                <div className="flex gap-3 w-full">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrModalUrl}`);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `QR_Akses_${qrModalUrl}.png`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        showToast("QR Code berhasil didownload!");
                      } catch (e) {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrModalUrl}`, '_blank');
                      }
                    }}
                    className="flex-1 bg-violet-600 active:scale-95 transition-transform hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl cursor-pointer"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setQrModalUrl(null)}
                    className="flex-1 bg-slate-100 active:scale-95 transition-transform hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Global Help Center Modal */}
          {helpModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
            >
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center w-full max-w-sm relative overflow-hidden shadow-2xl">
                {/* Header Gradient Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>

                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 mt-2">
                  <Info className="w-6 h-6" />
                </div>

                <h3 className="font-extrabold text-slate-800 text-lg text-center mb-1 font-sans">Pusat Bantuan</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-5 font-sans">Hubungi Admin EventSpace</p>

                <div className="w-full space-y-3.5 mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left font-sans">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">No. WhatsApp Admin</span>
                    <span className="text-xs font-mono font-black text-slate-800">+62 812-3456-7890</span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Email Layanan</span>
                    <span className="text-xs font-mono font-black text-slate-800">support@eventspace.com</span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Jam Operasional</span>
                    <span className="text-xs font-black text-slate-800">Setiap Hari, 08:00 - 22:00 WIB</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full font-sans">
                  <button
                    onClick={() => {
                      window.open("https://wa.me/6281234567890", "_blank");
                    }}
                    className="flex-1 bg-violet-600 hover:bg-violet-750 active:scale-95 transition-all text-white font-bold py-3.5 rounded-2xl text-xs cursor-pointer shadow-md shadow-violet-600/20"
                  >
                    WhatsApp Admin
                  </button>
                  <button
                    onClick={() => setHelpModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 font-bold py-3.5 rounded-2xl text-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area Wrapper */}
        <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">

          {/* Global sticky Navigation (Bottom Bar on Mobile only, hidden on Desktop/Tablet) */}
          {user && ["home", "explore", "my_bookings", "profile", "org_dashboard", "org_events", "org_bookings"].includes(screen) && (
            <div className="md:hidden order-2 w-full shrink-0 no-print">
              <Navbar
                role={user.role}
                activeScreen={screen}
                onNavigate={(scName) => navigateTo(scName)}
              />
            </div>
          )}

          {/* Active view routing */}
          <div id="screen" className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 relative no-scrollbar md:order-2 order-1 bg-slate-50/30">

            {/* SCREEN: SPLASH */}
            {screen === "splash" && (
              <SplashView onLoadComplete={() => navigateTo("onboarding")} />
            )}

            {/* SCREEN: ONBOARDING */}
            {screen === "onboarding" && (
              <OnboardingView
                onSkip={() => navigateTo("landing")}
                onFinish={() => navigateTo("landing")}
              />
            )}

            {/* SCREEN: LANDING (Identity Selection) */}
            {screen === "landing" && (
              <div className="flex-1 bg-[#f4f6fb] flex flex-col justify-between p-5 md:p-7 relative min-h-[100dvh] md:min-h-0 h-full overflow-hidden">
                <meta name="theme-color" content="#f4f6fb" />
                {/* Aesthetic Animated Background Image */}
                <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden bg-[#f4f6fb]">
                  <motion.img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560"
                    alt="Animated Abstract Background"
                    className="w-[200%] h-full object-cover opacity-35 md:opacity-40 max-w-none"
                    animate={{ x: ["-50%", "0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f4f6fb] via-white/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f4f6fb]/90 via-white/50 to-transparent" />
                </div>

                <div className="z-10 flex-1 flex flex-col items-center justify-center text-center gap-4 md:gap-6 mt-4 md:mt-12">
                  <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden shadow-xl shadow-violet-600/15 float-anim">
                    <img src="/logo.svg" alt="Event Space Logo" className="w-full h-full object-cover" />
                  </div>

                  <div className="text-center">
                    <h2 className="text-[26px] font-black text-slate-800 tracking-tight leading-none drop-shadow-sm">
                      Event<span className="text-violet-600">Space</span>
                    </h2>
                  </div>

                  <div className="mt-4">
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug">
                      Hubungkan Bisnis Anda<br />dengan Event Terbaik
                    </h1>
                    <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">
                      Pilih identitas Anda untuk melanjutkan pendaftaran
                    </p>
                  </div>
                </div>

                <div className="z-10 flex flex-col gap-3.5 mb-6 md:mb-14">
                  {/* User Role Card: Tenant */}
                  <div
                    onClick={() => {
                      setLoginRole("tenant");
                      setLoginEmail("younjung@gmail.com");
                      setLoginPassword("tenant123");
                      setLoginError("");
                      setShowPassword(false);
                      navigateTo("login");
                    }}
                    className="cyber-card rounded-3xl p-4.5 cursor-pointer flex items-center gap-4 hover:bg-violet-600/5 group"
                  >
                    <div className="bg-violet-500/10 border border-violet-500/20 w-12 h-12 rounded-xl flex items-center justify-center p-1 font-bold shrink-0">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold text-slate-800 mb-0.5 group-hover:text-violet-600 transition-all font-sans">
                        Tenant / UMKM
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Cari event, sewa slot booth secara interaktif & kelola transaksi
                      </p>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* User Role Card: Organizer */}
                  <div
                    onClick={() => {
                      setLoginRole("organizer");
                      setLoginEmail("admin@eventspace.com");
                      setLoginPassword("admin123");
                      setLoginError("");
                      setShowPassword(false);
                      navigateTo("login");
                    }}
                    className="cyber-card rounded-3xl p-4.5 cursor-pointer flex items-center gap-4 hover:bg-orange-600/5 group"
                  >
                    <div className="bg-orange-500/10 border border-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center p-1 font-bold shrink-0">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold text-slate-800 mb-0.5 group-hover:text-orange-600 transition-all font-sans">
                        Event Organizer
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Buat event promosional, kelola grid booth & validasi tenant
                      </p>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div className="z-10 text-center shrink-0 mb-1 md:mb-4">
                  <p className="text-slate-400 text-xs">
                    Belum memiliki akun?{" "}
                    <button
                      onClick={() => {
                        setRegName("");
                        setRegEmail("");
                        setRegPassword("");
                        setRegRole("tenant");
                        navigateTo("register");
                      }}
                      className="text-violet-600 font-bold hover:underline bg-transparent"
                    >
                      Daftar Sekarang
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN: LOGIN */}
            {screen === "login" && (
              <div className="flex-1 bg-[#f4f6fb] flex flex-col relative min-h-[100dvh] md:min-h-0 h-full overflow-hidden items-center justify-center">
                {/* Aesthetic Animated Background Image */}
                <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden bg-[#f4f6fb]">
                  <motion.img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560"
                    alt="Animated Abstract Background"
                    className="w-[200%] h-full object-cover opacity-35 md:opacity-40 max-w-none"
                    animate={{ x: ["-50%", "0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f4f6fb] via-white/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f4f6fb]/90 via-white/50 to-transparent" />
                </div>

                <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center">
                  <button
                    onClick={() => navigateTo("landing")}
                    className="bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white text-slate-700 rounded-2xl w-11 h-11 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </div>

                <div className="w-full max-w-md px-6 relative z-10">
                  <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white/70 backdrop-blur-2xl rounded-2xl md:rounded-[32px] p-5 md:p-7 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                    <div className="mb-4 md:mb-8 flex flex-col items-center text-center mt-1 md:mt-2">
                      <motion.img
                        src="/logo.svg"
                        alt="Event Space Logo"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-5 shadow-lg shadow-violet-500/20 rounded-xl md:rounded-[20px]"
                      />
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                        Selamat Datang!
                      </h2>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        Akses dashboard <span className="font-black uppercase tracking-wider text-violet-600">{loginRole === "organizer" ? "Organizer" : "Tenant"}</span>
                      </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Alamat Email</label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginError("");
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 md:py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="contoh@mail.com"
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password PIN</label>
                          <button className="text-[10px] font-bold text-violet-600 hover:text-violet-500 transition-colors">Lupa?</button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              setLoginError("");
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-2.5 md:py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                            placeholder="••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center p-1"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Demo Help */}
                      <div className="bg-violet-50 border border-violet-100 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] text-slate-600 space-y-2 flex flex-col mt-1.5 md:mt-2">
                        <p className="font-bold flex items-center gap-1.5 text-violet-600">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Kredensial Demo Instan:
                        </p>
                        <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                          <span>Email: <span className="font-mono font-bold text-slate-800 ml-1">{loginRole === "organizer" ? "admin@eventspace.com" : "younjung@gmail.com"}</span></span>
                          <span>Sandi: <span className="font-mono font-bold text-slate-800 ml-1">{loginRole === "organizer" ? "admin123" : "tenant123"}</span></span>
                        </div>
                      </div>

                      {/* Error Panel */}
                      <AnimatePresence>
                        {loginError && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[11px] text-rose-600 flex items-center justify-center gap-2 font-semibold text-center mt-2">
                              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                              {loginError}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-4 md:mt-8 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        className="w-full h-11 md:h-14 rounded-2xl font-black font-sans text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/20 hover:shadow-violet-500/40"
                      >
                        Masuk Sekarang <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* SCREEN: REGISTER */}
            {screen === "register" && (
              <div className="flex-1 bg-[#f4f6fb] flex flex-col relative min-h-[100dvh] md:min-h-0 h-full overflow-hidden items-center justify-center">
                {/* Aesthetic Animated Background Image */}
                <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden bg-[#f4f6fb]">
                  <motion.img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560"
                    alt="Animated Abstract Background"
                    className="w-[200%] h-full object-cover opacity-35 md:opacity-40 max-w-none"
                    animate={{ x: ["-50%", "0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f4f6fb] via-white/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f4f6fb]/90 via-white/50 to-transparent" />
                </div>

                <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-20 flex items-center">
                  <button
                    onClick={() => navigateTo("landing")}
                    className="bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white text-slate-700 rounded-2xl w-9 h-9 md:w-11 md:h-11 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="w-full max-w-md px-6 relative z-10 flex flex-col">
                  <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white/70 backdrop-blur-2xl rounded-2xl md:rounded-[32px] p-5 md:p-7 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] md:max-h-[85vh] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                    <div className="mb-3 md:mb-6 flex flex-col items-center text-center mt-1 shrink-0">
                      <motion.img
                        src="/logo.svg"
                        alt="Event Space Logo"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 md:w-14 md:h-14 mb-2 md:mb-4 shadow-lg shadow-violet-500/20 rounded-xl md:rounded-[18px]"
                      />
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                        Buat Akun Baru
                      </h2>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Bergabunglah dengan ekosistem EventSpace
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 md:space-y-4 pr-2 no-scrollbar pb-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Nama Lengkap</label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 md:py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="Nama representatif..."
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Alamat Email</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 md:py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="contoh@mail.com"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Password PIN</label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 md:py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="Minimal 8 karakter"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Peran / Role</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setRegRole("tenant")}
                            className={`py-2.5 md:py-3.5 rounded-2xl text-xs font-bold transition-all border ${regRole === "tenant" ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                          >
                            🏪 Tenant
                          </button>
                          <button
                            onClick={() => setRegRole("organizer")}
                            className={`py-2.5 md:py-3.5 rounded-2xl text-xs font-bold transition-all border ${regRole === "organizer" ? "bg-fuchsia-50 border-fuchsia-500 text-fuchsia-700 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                          >
                            🏢 Organizer
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-4 shrink-0 pt-3 md:pt-4 border-t border-slate-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          const trimmedName = regName.trim();
                          const trimmedEmail = regEmail.trim();
                          const rawPassword = regPassword;

                          if (!trimmedName || !trimmedEmail || !rawPassword) {
                            showToast("Harap isi semua baris manual!");
                            return;
                          }

                          if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
                            showToast("Format alamat email tidak valid!");
                            return;
                          }

                          if (rawPassword.length < 8) {
                            showToast("Password PIN minimal harus 8 karakter!");
                            return;
                          }

                          if (usersList.some(u => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
                            showToast("Alamat email ini sudah terdaftar!");
                            return;
                          }

                          try {
                            const newRegisteredUser = await createUser({
                              id: "u_" + Date.now(),
                              name: trimmedName,
                              email: trimmedEmail,
                              role: regRole as "tenant" | "organizer",
                              av: `https://i.pravatar.cc/80?u=${encodeURIComponent(trimmedName)}`,
                              password: rawPassword,
                              bName: "",
                              bType: ""
                            });

                            setUsersList((prev) => [...prev, newRegisteredUser]);
                            showToast("Registrasi berhasil! Silakan login.");
                            setLoginRole(regRole as "tenant" | "organizer");
                            setLoginEmail(trimmedEmail);
                            setLoginPassword(rawPassword);
                            navigateTo("login");
                          } catch (err: any) {
                            console.error(err);
                            showToast(err.message || "Registrasi gagal, silakan coba lagi.");
                          }
                        }}
                        className="w-full h-11 md:h-14 rounded-2xl font-black font-sans text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/20 hover:shadow-violet-500/40"
                      >
                        Daftar Akun <ArrowRight className="w-4 h-4" />
                      </motion.button>
                      <div className="text-center mt-3 md:mt-4">
                        <p className="text-slate-500 text-[10px] font-medium">
                          Sudah punya akun?{" "}
                          <button
                            onClick={() => navigateTo("login")}
                            className="text-violet-600 font-bold hover:text-violet-500 bg-transparent transition-colors"
                          >
                            Login
                          </button>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* SCREEN: HOME (Tenant Dashboard) */}
            {screen === "home" && (
              <div className="flex-1 flex flex-col h-full min-h-0 bg-aesthetic-canvas">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  activeScreen={screen}
                  onNavigate={navigateTo}
                />

                {/* SCROLLABLE WRAPPER */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col min-h-0">

                  {/* Welcome Container Slider */}
                  <div className="px-5 pt-8 md:pt-5 pb-3 shrink-0">
                    <WelcomeSlider />
                  </div>

                  {/* Summary Action Buttons / Minimalist Stat & Popular Event */}
                  <div className="px-5 pb-4 shrink-0 mt-4">
                    <h3 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-4">Statistik & Rekomendasi</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Minimalist Stat Card */}
                      <div
                        onClick={() => navigateTo("tenant_statistics")}
                        className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Event<br />Diikuti</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-2xl font-black text-slate-800">{bookings.length} <span className="text-[10px] font-bold text-slate-400">/ Tahun</span></p>
                          {/* Detailed Activity Graph */}
                          <div className="flex items-end justify-between gap-1 mt-3 h-8 w-full">
                            {[30, 50, 40, 70, 45, 90, 60, 100, 80, 50, 75, 40].map((val, i) => (
                              <div key={i} className="w-full bg-violet-50 rounded-t-sm group-hover:bg-violet-100 transition-colors flex items-end justify-center h-full">
                                <div className="w-full bg-violet-500 rounded-t-sm" style={{ height: `${val}%` }}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Total Dana Card */}
                      <div
                        onClick={() => navigateTo("tenant_statistics")}
                        className="bg-gradient-to-br from-violet-600 to-fuchsia-600 border border-violet-500 rounded-[20px] p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                          <LineChart className="w-16 h-16 text-white" />
                        </div>
                        <div className="relative z-10">
                          <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-2 backdrop-blur-sm">
                            <LineChart className="w-4 h-4" />
                          </div>
                          <p className="text-[9px] font-bold text-white/90 uppercase tracking-widest leading-relaxed">Total Dana<br />Dikeluarkan</p>
                        </div>
                        <div className="relative z-10 mt-3 flex flex-col justify-end">
                          <p className="text-xl font-black text-white truncate mb-1.5">
                            Rp {(() => {
                              const totalSpend = bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + b.amt, 0);
                              return formatPrice(totalSpend);
                            })()}
                          </p>
                          {/* Detailed Financial Graph */}
                          <div className="flex items-end justify-between gap-1 mt-1.5 h-8 w-full opacity-90">
                            {[20, 35, 25, 40, 60, 50, 85, 70, 95, 60, 80, 55].map((val, i) => (
                              <div key={i} className="w-full bg-white/20 rounded-t-sm flex items-end justify-center h-full hover:bg-white/30 transition-colors">
                                <div className="w-full bg-white rounded-t-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ height: `${val}%` }}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Bookings Section */}
                  <div className="px-5 pb-8 shrink-0 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">Penyewaan Aktif</h3>
                    </div>
                    {(() => {
                      const activeBookings = bookings.filter(b => b.status === "confirmed");
                      if (activeBookings.length === 0) {
                        return (
                          <div className="bg-white border border-slate-100 rounded-[20px] p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <span className="text-3xl opacity-50 block mb-2">🎟️</span>
                            <p className="text-[11px] font-bold text-slate-500">Belum ada penyewaan aktif.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 gap-4">
                          {activeBookings.map(bk => {
                            const ev = events.find(e => e.id === bk.evId);
                            return (
                              <div key={bk.id} onClick={() => setSelectedActiveBk(bk)} className="bg-white border border-slate-100 rounded-[20px] p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow">
                                <img src={ev?.img || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100"} className="w-14 h-14 rounded-[14px] object-cover shrink-0" alt="event" />
                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                  <h4 className="text-[13px] font-extrabold text-slate-800 truncate pr-2">{ev?.title || "Event"}</h4>
                                  <p className="text-[11px] font-medium text-slate-500">Booth {bk.slot}</p>
                                </div>
                                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 font-bold text-[9px] rounded-full shrink-0">Berlangsung</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  <AppFooter />
                </div>
                <AnimatePresence>
                  {selectedActiveBk && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-slate-900/60 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
                      >
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
                          <h3 className="text-lg font-black leading-tight mb-1">{selectedActiveBk.evTitle}</h3>
                          <span className="inline-block px-2 py-0.5 bg-white/20 rounded font-semibold text-[10px] tracking-wider uppercase">Aktif / Berlangsung</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400 font-medium">No. Booking</span>
                            <span className="text-sm font-bold text-slate-800">{selectedActiveBk.id}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400 font-medium">Slot Booth</span>
                            <span className="text-sm font-black text-violet-600">{selectedActiveBk.slot}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-400 font-medium">Nama Bisnis</span>
                            <span className="text-sm font-bold text-slate-800">{selectedActiveBk.bName}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2">
                            <span className="text-xs text-slate-400 font-medium">Total Biaya</span>
                            <span className="text-sm font-bold text-emerald-600">Rp {formatPrice(selectedActiveBk.amt)}</span>
                          </div>

                          {/* Invoice & QR Action Buttons */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                              onClick={() => {
                                navigateTo("invoice_detail");
                              }}
                              className="bg-violet-50 text-violet-700 hover:bg-violet-100 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                              <span className="text-[10px] font-bold">Lihat Invoice</span>
                            </button>
                            <button
                              onClick={() => {
                                setQrModalUrl(selectedActiveBk.id);
                              }}
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <QrCode className="w-5 h-5" />
                              <span className="text-[10px] font-bold">QR Akses</span>
                            </button>
                          </div>

                          <button
                            onClick={() => setSelectedActiveBk(null)}
                            className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-[16px] text-xs transition-colors"
                          >
                            Tutup Detail
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* SCREEN: TENANT STATISTICS */}
            {screen === "tenant_statistics" && (
              <div className="flex-1 flex flex-col h-full min-h-0 bg-aesthetic-canvas">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  showBack
                  onBack={() => navigateTo(prevScreen === "profile" ? "profile" : "home")}
                />
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                  {/* Title */}
                  <div className="px-6 py-6 shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Statistik Tenant</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Ringkasan aktivitas dan riwayat penyewaan Anda</p>
                  </div>

                  <div className="px-6 mb-4 shrink-0">
                    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 border border-violet-500 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                        <LineChart className="w-24 h-24 text-white" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">Total Dana Dikeluarkan</p>
                          <p className="text-2xl font-black text-white mt-0.5">
                            Rp {(() => {
                              const totalSpend = bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + b.amt, 0);
                              return formatPrice(totalSpend);
                            })()}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm shrink-0">
                          <LineChart className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Detailed Graph for Statistics Screen */}
                      <div className="relative z-10 mt-4 h-16 flex items-end justify-between gap-2 w-full">
                        {[20, 35, 25, 40, 60, 50, 85, 70, 95, 60, 80, 55].map((val, i) => (
                          <div key={i} className="w-full bg-white/20 rounded-t-md flex items-end justify-center h-full hover:bg-white/30 transition-colors cursor-pointer group/bar relative">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-6 bg-white text-violet-600 text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                              {val}%
                            </div>
                            <div className="w-full bg-white rounded-t-md shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ height: `${val}%` }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart Dummy */}
                  <div className="px-6 mb-8 shrink-0">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Biaya Sewa</p>
                          <p className="text-xl font-black text-slate-800">
                            Rp {formatPrice(bookings.filter(b => b.status === "confirmed").reduce((acc, curr) => acc + curr.amt, 0))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event Diikuti</p>
                          <p className="text-xl font-black text-violet-600">{bookings.filter(b => b.status === "confirmed").length} <span className="text-[10px] font-bold text-slate-400">/ Tahun</span></p>
                        </div>
                      </div>

                      {/* Simple Bar Chart */}
                      <div className="flex items-end gap-2 h-32 mt-4 pt-4 border-t border-slate-50">
                        {[40, 70, 45, 90, 60, 100, 80].map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full">
                            <div className="w-full bg-slate-50 rounded-t-md relative flex items-end justify-center group-hover:bg-violet-50 transition-colors h-full">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`w-full rounded-t-md ${i === 5 ? 'bg-gradient-to-t from-violet-600 to-fuchsia-600' : 'bg-slate-300 group-hover:bg-violet-300'}`}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  {bookings.length > 0 && (
                    <div className="px-6 mb-8 shrink-0">
                      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <h3 className="text-[13px] font-extrabold text-slate-800 mb-4 tracking-wide">DISTRIBUSI KATEGORI EVENT</h3>
                        <div className="flex flex-col gap-4">
                          {(() => {
                            const cats: Record<string, number> = {};
                            let total = 0;
                            bookings.forEach(bk => {
                              const ev = events.find(e => e.id === bk.evId);
                              if (ev) {
                                cats[ev.cat] = (cats[ev.cat] || 0) + 1;
                                total++;
                              }
                            });
                            const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
                            return sortedCats.map(([cat, count], i) => (
                              <div key={cat}>
                                <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-xs font-bold text-slate-700">{cat}</span>
                                  <span className="text-[10px] font-bold text-slate-400">{count} Event ({Math.round(count / total * 100)}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${i === 0 ? 'bg-violet-600' : i === 1 ? 'bg-fuchsia-500' : 'bg-slate-300'}`}
                                    style={{ width: `${(count / total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Riwayat Penyewaan */}
                  <div className="px-6 pb-12 shrink-0">
                    <h3 className="text-[13px] font-extrabold text-slate-800 mb-4 tracking-wide">RIWAYAT PENYEWAAN</h3>
                    <div className="flex flex-col gap-3">
                      {bookings.length === 0 ? (
                        <div className="text-center py-10 bg-white border border-slate-100 rounded-[20px]">
                          <span className="text-3xl opacity-50 block mb-2">📜</span>
                          <p className="text-[11px] text-slate-400 font-bold">Belum ada riwayat penyewaan.</p>
                        </div>
                      ) : (
                        bookings.map(bk => {
                          const ev = events.find(e => e.id === bk.evId);
                          return (
                            <div key={bk.id} className="bg-white rounded-[20px] p-4 flex gap-4 items-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                              <img src={ev?.img || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100"} className="w-14 h-14 rounded-[14px] object-cover shrink-0" alt="event" />
                              <div className="flex flex-col justify-center flex-1 min-w-0">
                                <h4 className="text-[13px] font-extrabold text-slate-800 truncate pr-2">{ev?.title || "Event"}</h4>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Booth {bk.slot} • {bk.date.split(',')[0]}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[11px] font-black text-emerald-600 mb-1">Rp {formatPrice(bk.amt)}</p>
                                <span className={`inline-block px-2 py-1 text-[8px] font-bold rounded uppercase tracking-wider ${bk.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                  {bk.status === 'confirmed' ? 'Sukses' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN: INVOICE DETAIL (PER TENANT) */}
            {screen === "invoice_detail" && selectedActiveBk && (() => {
              const linkedEv = events.find(e => e.id === selectedActiveBk.evId);

              // Generate deterministic digital signature hash based on booking ID
              const sha256Hash = "SHA256: " + Array.from(selectedActiveBk.id + selectedActiveBk.slot)
                .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "")
                .padEnd(32, "8e9f2a7b1c")
                .toUpperCase()
                .substring(0, 32);

              const formattedPrintDate = new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              });

              return (
                <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b1329] print-container">
                  {/* PDF Navbar Header */}
                  <div className="bg-[#0f172a] h-14 border-b border-slate-800/80 px-4 flex justify-between items-center no-print shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-md">PDF</span>
                      <span className="text-xs md:text-sm font-extrabold text-slate-100 font-sans tracking-wide">
                        Pratinjau Dokumen PDF Resmi - Invoice Booking
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-lg shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span>🖨️</span> CETAK / SIMPAN
                      </button>
                      <button
                        onClick={() => {
                          setSelectedActiveBk(null);
                          navigateTo("home");
                        }}
                        className="text-slate-400 hover:text-slate-200 text-base cursor-pointer font-bold pl-2"
                        title="Tutup Pratinjau"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* PDF A4 Document Wrapper */}
                  <div className="flex-1 overflow-y-auto px-4 py-8 md:py-12 flex justify-center no-scrollbar print-container">
                    <div
                      id="printable-invoice"
                      className="w-full max-w-3xl bg-white rounded-2xl p-6 md:p-10 shadow-2xl border border-slate-200/40 flex flex-col gap-6 text-slate-700 font-sans"
                    >
                      {/* Invoice Letterhead / Header */}
                      <div className="flex justify-between items-start pb-5 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                                <defs>
                                  <linearGradient id="grad-tenant" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#4f46e5" />
                                  </linearGradient>
                                </defs>
                                <rect width="100" height="100" rx="24" fill="url(#grad-tenant)" />
                                <g fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="26" y="26" width="20" height="20" rx="4" />
                                  <rect x="54" y="26" width="20" height="20" rx="4" />
                                  <rect x="26" y="54" width="20" height="20" rx="4" />
                                  <rect x="54" y="54" width="20" height="20" rx="4" />
                                </g>
                              </svg>
                            </div>
                            <span className="text-base font-black text-slate-800 tracking-tight font-sans">EventSpace.</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mt-1 leading-none">EventSpace Ltd. Hub & Promoter</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-2 leading-relaxed">
                            Kebayoran Baru, Jakarta Selatan, 12130<br />
                            Telp: (021) 555-EVNT • support@eventspace.com
                          </p>
                        </div>

                        <div className="text-right font-sans">
                          <h2 className="text-base font-black text-slate-800 leading-tight uppercase tracking-wide">INVOICE BOOKING BOOTH</h2>
                          <p className="text-[10px] font-black text-violet-600 tracking-wide mt-1 uppercase font-sans">
                            {selectedActiveBk.evTitle || linkedEv?.title || 'Festival Event'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1.5 font-bold">
                            Dokumen ID: <span className="text-violet-600 font-extrabold font-mono">#INV-{selectedActiveBk.id}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5 font-bold">
                            Tanggal Cetak: <span className="text-slate-700 font-bold">{formattedPrintDate}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1 font-bold">
                            Status Laporan: <span className="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded uppercase text-[8px] tracking-wider font-sans">RESMI & TERVERIFIKASI</span>
                          </p>
                        </div>
                      </div>

                      {/* Tenant, Event & Payment Meta Box (Elegant 3-column Layout) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div>
                          <span className="text-[8px] font-extrabold tracking-wider uppercase text-slate-400 block mb-1">PEMILIK LAPAK (TENANT)</span>
                          <p className="text-xs font-extrabold text-slate-800">{selectedActiveBk.bName}</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">ID Member: <span className="font-mono font-bold">ES-{selectedActiveBk.id.substring(3)}-TENANT</span></p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">PIC: {selectedActiveBk.pic}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4">
                          <span className="text-[8px] font-extrabold tracking-wider uppercase text-slate-400 block mb-1">EVENT & BOOTH SEWA</span>
                          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                            {selectedActiveBk.evTitle || linkedEv?.title || 'Event Space'}
                          </p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">Slot Lapak: <span className="font-mono font-black text-violet-600">{selectedActiveBk.slot}</span></p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Lokasi: {linkedEv?.loc || 'Area EventSpace'}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4">
                          <span className="text-[8px] font-extrabold tracking-wider uppercase text-slate-400 block mb-1">METODE PEMBAYARAN</span>
                          <p className="text-xs font-extrabold text-slate-800">VA Digital / QRIS Lunas</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1 leading-relaxed">
                            Diverifikasi otomatis lunas oleh perbankan pada <span className="font-mono font-bold text-slate-700">{selectedActiveBk.date.split(',')[0]}</span>.
                          </p>
                        </div>
                      </div>

                      {/* Table Section */}
                      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                              <th className="py-3 px-4 font-extrabold">Nama Event</th>
                              <th className="py-3 px-4 font-extrabold">Kategori & Lokasi</th>
                              <th className="py-3 px-4 font-extrabold text-center">Slot Booth</th>
                              <th className="py-3 px-4 font-extrabold text-center">Status Sewa</th>
                              <th className="py-3 px-4 font-extrabold text-right">Biaya Akhir</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            <tr className="hover:bg-slate-50/50 transition-colors font-sans">
                              <td className="py-4 px-4">
                                <div className="font-extrabold text-slate-800 leading-tight">
                                  {selectedActiveBk.evTitle || linkedEv?.title || 'Event'}
                                </div>
                                <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                  {linkedEv?.org || 'Promoter EventSpace'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-500 leading-tight">
                                <div className="font-bold">{linkedEv?.cat || 'Sewa Slot Lapak'}</div>
                                <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{linkedEv?.loc || 'Area EventSpace'}</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono font-extrabold">
                                  {selectedActiveBk.slot}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                  Selesai
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right font-mono font-bold text-slate-800">
                                Rp {formatPrice(selectedActiveBk.amt)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Important Notes & Total Details */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 border-t border-slate-200">
                        <div className="flex-1">
                          <h4 className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">CATATAN PENTING</h4>
                          <p className="text-[9px] text-slate-400 font-semibold leading-relaxed max-w-md">
                            Bukti pembayaran invoice ini sah dan terbit otomatis secara digital dari sistem EventSpace. Harap tunjukkan dokumen cetak/digital ini kepada petugas lapangan saat melakukan bongkar muat loading-in UMKM Anda di lokasi event.
                          </p>
                        </div>

                        <div className="w-full md:w-64 text-right">
                          <div className="flex justify-between items-center py-1 text-slate-500 text-[10px] font-bold">
                            <span>Subtotal Biaya Lapak:</span>
                            <span className="font-mono">Rp {formatPrice(selectedActiveBk.amt)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-slate-500 text-[10px] font-bold">
                            <span>PPN Lapak (0% Promo):</span>
                            <span className="font-mono">Rp 0</span>
                          </div>

                          {/* Double line divider */}
                          <div className="border-b-4 border-double border-slate-200 my-1.5" />

                          <div className="flex justify-between items-center py-1 text-slate-800 font-black text-sm">
                            <span>TOTAL AKHIR:</span>
                            <span className="text-cyan-600 font-mono text-base">Rp {formatPrice(selectedActiveBk.amt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hash & Verified Stamp Dotted Circle */}
                      <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-200">
                        <div>
                          <span className="text-[7px] font-extrabold uppercase text-slate-400 tracking-wider block">DIGITAL SIGNATURE HASH</span>
                          <span className="text-[8px] font-mono font-bold text-slate-400 tracking-tight">{sha256Hash}</span>
                        </div>

                        <div className="relative flex flex-col items-center">
                          {/* Dotted verified circular stamp */}
                          <div className="absolute right-0 -top-12 w-24 h-24 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center rotate-[-12deg] pointer-events-none select-none font-black text-emerald-500/40 text-[9px] text-center p-2 uppercase tracking-wide leading-tight">
                            EventSpace<br />OFFICIAL<br />APPROVED
                          </div>
                          <div className="text-right z-10">
                            <p className="text-[10px] font-extrabold text-slate-800">Verifikator EventSpace</p>
                            <p className="text-[8px] font-bold text-slate-400 mt-0.5">Promoter Caregiver Buddy</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SCREEN: EXPLORE */}
            {screen === "explore" && (
              <div className="flex-1 flex flex-col h-full min-h-0 bg-aesthetic-canvas">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  activeScreen={screen}
                  onNavigate={navigateTo}
                />

                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col min-h-0">
                  {/* Search Bar */}
                  <div className="px-5 pt-6 py-2 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="inp !pl-11 !bg-white"
                        placeholder="Cari expo, bazaar, kota..."
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Sliders */}
                  <div className="flex gap-2 px-5 py-2.5 overflow-x-auto no-scrollbar shrink-0">
                    {CATS.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        className={`tag select-none whitespace-nowrap py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${cat === filterCat
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/10 font-bold border-transparent"
                          : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Katalog Header */}
                  <div className="px-5 py-3 shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Eksklusif</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Temukan event terbaik untuk mengembangkan bisnismu.</p>
                  </div>

                  {/* Scrollable Events List */}
                  <div className="px-5 pb-8 shrink-0">
                    {filteredEventsForTenant.length === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <span className="text-4xl">🎪</span>
                        <p className="text-xs font-bold mt-3">Tidak ada event yang sesuai.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {/* Featured Event (1st item) */}
                        {(() => {
                          const featuredEvent = filteredEventsForTenant[0];
                          return (
                            <div
                              onClick={() => {
                                setSelectedEvent(featuredEvent);
                                setSelectedSlot(null);
                                setDetailTab("info");
                                navigateTo("event_detail");
                              }}
                              className="bg-white rounded-[24px] overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all"
                            >
                              <div className="relative h-72 overflow-hidden">
                                <img
                                  src={featuredEvent.img}
                                  alt={featuredEvent.title}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute top-4 left-4">
                                  <span className="bg-violet-600 text-white text-[9px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase">
                                    {featuredEvent.cat}
                                  </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                  <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                                    {featuredEvent.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="p-5">
                                <p className="text-[11px] font-medium text-slate-500 mb-4 line-clamp-2">
                                  {featuredEvent.desc}
                                </p>
                                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                                  <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                      INVESTASI
                                    </p>
                                    <p className="text-xl font-black text-violet-600 leading-none">
                                      Rp {formatPrice(featuredEvent.price)}
                                    </p>
                                  </div>
                                  <button
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] py-2.5 px-6 rounded-[12px] transition-colors shadow-sm hover:shadow-md"
                                  >
                                    Lihat Detail
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Other Events Grid */}
                        {filteredEventsForTenant.length > 1 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredEventsForTenant.slice(1).map((ev) => {
                              return (
                                <div
                                  key={ev.id}
                                  onClick={() => {
                                    setSelectedEvent(ev);
                                    setSelectedSlot(null);
                                    setDetailTab("info");
                                    navigateTo("event_detail");
                                  }}
                                  className="bg-[#fafaf7] rounded-[20px] overflow-hidden cursor-pointer flex flex-col border border-[#f0f0eb] hover:-translate-y-1 hover:shadow-md transition-all relative"
                                >
                                  {/* Top right empty or other icons can go here if needed later */}

                                  <div className="relative h-36 overflow-hidden bg-slate-200 shrink-0">
                                    <img
                                      src={ev.img}
                                      alt={ev.title}
                                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-2 left-2">
                                      <span className="bg-[#4a4a4a] text-white text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        {ev.cat}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-3.5 flex flex-col flex-1">
                                    <h4 className="text-[12px] font-extrabold text-[#2a2a2a] leading-snug mb-1.5 line-clamp-2">
                                      {ev.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium mb-3 line-clamp-2 pb-2 border-b border-[#e5e5df]">
                                      {ev.desc}
                                    </p>

                                    <div className="mt-auto pt-1">
                                      <p className="text-[12px] font-black text-violet-600 mb-2">
                                        Rp {formatPrice(ev.price)}
                                      </p>
                                      <button className="w-full py-2 border border-[#d5d5cf] text-[#4a4a4a] font-extrabold text-[9px] rounded-xl tracking-widest hover:bg-[#ebebeb] uppercase transition-colors">
                                        Detail
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    <AppFooter />
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN: EVENT DETAIL */}
            {screen === "event_detail" && selectedEvent && (
              <div className="flex-1 flex flex-col bg-white h-full relative">
                <div className="flex-1 overflow-y-auto no-scrollbar relative bg-white pb-24">
                  <div className="relative w-full h-[300px] sm:h-[380px] overflow-hidden bg-slate-50">
                    <div className={`flex h-full w-full no-scrollbar ${(Array.isArray(selectedEvent.images) && selectedEvent.images.length > 1)
                        ? "overflow-x-auto snap-x snap-mandatory"
                        : "overflow-hidden"
                      }`}>
                      {(Array.isArray(selectedEvent.images) && selectedEvent.images.length > 0
                        ? selectedEvent.images
                        : [selectedEvent.img || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"]
                      ).map((imgUrl, i) => (
                        <div key={i} className="min-w-full h-full snap-center shrink-0 relative flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={`${selectedEvent.title} - ${i + 1}`}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />

                    {/* Navigation Dots */}
                    {(selectedEvent.images && selectedEvent.images.length > 1) && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                        {selectedEvent.images.map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm" />
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => navigateTo(prevScreen === "explore" ? "explore" : "home")}
                      className="absolute top-5 left-5 bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center text-slate-800 transition-transform active:scale-90 z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Floating Content Card overlapping the image */}
                  <div className="relative -mt-[12px] bg-white rounded-t-[32px] pt-6 px-6 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-md mb-3">
                      {selectedEvent.cat}
                    </span>
                    <h1 className="text-2xl font-black text-slate-800 leading-tight mb-4">
                      {selectedEvent.title}
                    </h1>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">{selectedEvent.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">{selectedEvent.loc.split(",")[0]}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-[13px] font-extrabold text-slate-800 mb-2">Tentang Event</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{selectedEvent.desc}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[13px] font-extrabold text-slate-800">Peta Slot Tersedia</h3>
                        <span className="text-[10px] text-slate-400 font-semibold">Lantai 1</span>
                      </div>

                      {/* Legends */}
                      <div className="flex gap-4 items-center mb-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          <div className="w-3 h-3 bg-red-50 border border-red-300 rounded-[4px]" /> Terisi
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded-[4px]" /> Tersedia
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          <div className="w-3 h-3 bg-amber-50 border border-red-400 rounded-[4px]" /> Dipilih
                        </div>
                      </div>

                      {/* Grid layout */}
                      <div className="bg-[#f8f9fc] border border-slate-100 p-4 rounded-2xl">
                        <div className="grid grid-cols-5 gap-2">
                          {selectedEvent.slots.map((slot) => {
                            const isBooked = slot.s === 1;
                            const isSelected = selectedSlot === slot.id;

                            let borderStyle = "border-emerald-200";
                            let bgStyle = "bg-emerald-50 hover:bg-emerald-100 text-emerald-600";

                            if (isBooked) {
                              borderStyle = "border-red-300";
                              bgStyle = "bg-red-50 text-red-500 cursor-not-allowed";
                            }
                            if (isSelected) {
                              borderStyle = "border-red-400 border-2";
                              bgStyle = "bg-amber-50 text-red-500 font-bold";
                            }

                            return (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`aspect-square rounded-[8px] border text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${bgStyle} ${borderStyle}`}
                              >
                                {slot.id}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Map Image Dummy */}
                      <div className="mt-4 relative rounded-2xl overflow-hidden h-24 bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Map" />
                        <button className="relative z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition-transform active:scale-95">
                          <MapPin className="w-3.5 h-3.5 text-blue-700" /> Buka Map Navigasi
                        </button>
                      </div>
                    </div>
                  </div>
                  <AppFooter />
                </div>

                {/* Bottom Sticky action */}
                <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 z-30 pb-safe">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                      SLOT TERPILIH
                    </p>
                    <p className={`text-[14px] font-extrabold leading-none ${selectedSlot ? 'text-blue-700' : 'text-blue-500'}`}>
                      {selectedSlot ? `Booth ${selectedSlot}` : "Belum Memilih"}
                    </p>
                  </div>

                  {(() => {
                    const isSelectedSlotBooked = selectedEvent?.slots.find(s => s.id === selectedSlot)?.s === 1;
                    return (
                      <button
                        disabled={!selectedSlot || isSelectedSlotBooked}
                        onClick={() => {
                          setBFormPic(user?.name || "");
                          setBFormPhone("");
                          navigateTo("booking_form");
                        }}
                        className={`px-8 py-3.5 font-extrabold text-[12px] rounded-[14px] transition-all ${selectedSlot && !isSelectedSlotBooked
                            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 active:scale-95 cursor-pointer shadow-md shadow-violet-500/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                      >
                        Pilih Slot
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* SCREEN: BOOKING FORM (Tenant Details input) */}
            {screen === "booking_form" && selectedEvent && selectedSlot && (
              <div className="flex-1 flex flex-col justify-between bg-white h-full relative">
                <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0 bg-white shadow-sm relative z-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigateTo("event_detail")}
                      className="text-slate-800 cursor-pointer active:scale-95 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-extrabold text-[15px] text-slate-800 tracking-wide">Form Pendaftaran Tenant</h2>
                  </div>
                  <button className="text-slate-400 relative active:scale-95 transition-transform">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                  </button>
                </div>

                {/* Form entries scroll */}
                <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-28 no-scrollbar bg-white">

                  {/* Recap */}
                  <div className="mt-4 bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 shadow-sm items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-slate-500 leading-none mb-1 flex items-center">
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md mr-2">Booth {selectedSlot}</span>
                        Outdoor Area
                      </p>
                      <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{selectedEvent.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">{selectedEvent.date} • {selectedEvent.cat}</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-[11px] text-blue-900 font-extrabold uppercase tracking-widest leading-none">Informasi Bisnis</h3>
                      <button onClick={() => { setEditProfileBName(user?.bName || ""); setEditProfileBType(user?.bType || ""); navigateTo("profile"); }} className="text-[9px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded uppercase">Edit</button>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                      {(!user?.bName || !user?.bType) && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                          <p className="text-xs font-bold text-rose-500 mb-1">Profil Bisnis Belum Lengkap!</p>
                          <p className="text-[10px] text-slate-500">Silakan lengkapi profil terlebih dahulu.</p>
                        </div>
                      )}
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Business Name</span>
                        <span className="block text-sm font-extrabold text-slate-800">{user?.bName || "-"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Business Type</span>
                        <span className="block text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md inline-block">{user?.bType || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] text-blue-900 font-extrabold uppercase tracking-widest leading-none border-b border-slate-100 pb-2">Informasi Kontak (PIC)</h3>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">PIC Name</label>
                      <input
                        type="text"
                        value={bFormPic}
                        onChange={(e) => setBFormPic(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Nama lengkap penanggung jawab"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">PIC Phone</label>
                      <div className="flex">
                        <div className="h-[42px] px-4 bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl flex items-center text-xs font-bold text-slate-500">
                          +62
                        </div>
                        <input
                          type="tel"
                          value={bFormPhone}
                          onChange={(e) => setBFormPhone(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 border-l-0 text-slate-800 text-xs px-3 py-3 rounded-r-xl focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                          placeholder="812xxxxxx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] text-slate-800 font-extrabold uppercase tracking-widest leading-none mb-1">Ringkasan Pesanan</h3>
                    <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Harga Sewa Slot</span>
                        <span className="font-bold text-slate-800">Rp {formatPrice(selectedEvent.price)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Biaya Layanan</span>
                        <span className="font-bold text-slate-800">Rp 0</span>
                      </div>
                      <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-800">Total Pembayaran</span>
                        <span className="text-[15px] font-black text-slate-800">Rp {formatPrice(selectedEvent.price)}</span>
                      </div>
                    </div>
                  </div>
                  <AppFooter />
                </div>

                <div className="bg-white border-t border-slate-100 p-6 shrink-0 absolute bottom-0 left-0 right-0 z-30 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <button
                    disabled={!user?.bName || !user?.bType || !bFormPic || !bFormPhone}
                    onClick={handleBookingSubmit}
                    className={`w-full py-4 font-bold text-sm rounded-xl cursor-pointer transition-all flex items-center justify-between px-6 ${user?.bName && user?.bType && bFormPic && bFormPhone
                        ? "bg-[#964B00] text-white shadow-lg active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN: PAYMENT */}
            {screen === "payment" && selectedEvent && currentBooking && (
              <div className="flex-1 flex flex-col justify-between bg-aesthetic-canvas h-full">
                <div className="px-5 pt-4 flex items-center gap-3 shrink-0 mb-4 uppercase">
                  <button
                    onClick={() => navigateTo("booking_form")}
                    className="bg-slate-100 border border-slate-200 hover:bg-slate-250 text-slate-700 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="font-extrabold text-[13px] text-slate-800 tracking-wide">Gerbang Pembayaran</div>
                </div>

                {/* Payment Details Container */}
                <div className="flex-1 overflow-y-auto px-5 pb-20 space-y-4 no-scrollbar">

                  {/* Event Bill Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">ID Pesanan: {currentBooking.id}</p>
                      <span className="pill pb px-2.5 py-0.5 text-[8.5px] font-bold">Menunggu Transfer</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 mb-3">{selectedEvent.title}</h4>

                    <div className="border-t border-slate-100 pt-3 border-dashed flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-violet-50 w-9 h-9 rounded-xl flex items-center justify-center border border-violet-100">
                          <span className="text-base text-violet-600 font-bold">📍</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Booth {selectedSlot}</p>
                          <p className="text-[10px] text-slate-400 leading-none mt-0.5">{currentBooking.bName}</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold text-orange-600">Rp {formatPrice(selectedEvent.price)}</span>
                    </div>
                  </div>

                  {/* PAYMENT METHOD SELECTOR TABS */}
                  <div className="space-y-2 select-none">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pilih Metode Pembayaran</h3>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                      <button
                        onClick={() => setPayMethod('qris')}
                        className={`py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${payMethod === 'qris'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        📱 QRIS
                      </button>
                      <button
                        onClick={() => setPayMethod('va')}
                        className={`py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${payMethod === 'va'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        🏦 Bank VA
                      </button>
                      <button
                        onClick={() => setPayMethod('wallet')}
                        className={`py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${payMethod === 'wallet'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        💳 E-Wallet
                      </button>
                    </div>
                  </div>

                  {/* Method Content Container */}
                  <div className="border border-slate-200/85 bg-white rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
                    {payMethod === 'qris' && (
                      <div className="fade-up-anim">
                        <div className="p-4 flex items-center justify-between shrink-0 bg-violet-50/40">
                          <div className="flex items-center gap-3">
                            <div className="w-[38px] h-[38px] bg-violet-50 border border-violet-100/50 rounded-xl flex items-center justify-center">
                              <span className="text-lg">📱</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-850">QRIS ASPI Nasional</p>
                              <p className="text-[9px] text-slate-400">GoPay, ShopeePay, OVO, Dana, LinkAja</p>
                            </div>
                          </div>
                          <span className="pill pp font-extrabold text-[8px] px-2.5 py-1">Instant</span>
                        </div>

                        <div className="p-6 flex flex-col items-center gap-4 border-t border-slate-100 select-none">
                          {/* Barcode Mock Component */}
                          <div className="w-32 h-32 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg shadow-violet-100/80 border border-violet-100">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <rect x="0" y="0" width="30" height="30" fill="#4f46e5" />
                              <rect x="5" y="5" width="20" height="20" fill="white" />
                              <rect x="10" y="10" width="10" height="10" fill="#4f46e5" />

                              <rect x="70" y="0" width="30" height="30" fill="#4f46e5" />
                              <rect x="75" y="5" width="20" height="20" fill="white" />
                              <rect x="80" y="10" width="10" height="10" fill="#4f46e5" />

                              <rect x="0" y="70" width="30" height="30" fill="#4f46e5" />
                              <rect x="5" y="75" width="20" height="20" fill="white" />
                              <rect x="10" y="80" width="10" height="10" fill="#4f46e5" />

                              {/* Complex random path bits for barcode look */}
                              <rect x="40" y="5" width="10" height="20" fill="#ec4899" />
                              <rect x="55" y="0" width="10" height="10" fill="#4f46e5" />
                              <rect x="40" y="35" width="15" height="10" fill="#4f46e5" />
                              <rect x="10" y="45" width="20" height="15" fill="#ec4899" />
                              <rect x="80" y="40" width="15" height="25" fill="#4f46e5" />
                              <rect x="50" y="80" width="25" height="15" fill="#ec4899" />
                              <rect x="55" y="50" width="15" height="15" fill="#7c3aed" />
                            </svg>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed text-center font-semibold tracking-wide uppercase max-w-[200px]">
                            Pindai barcode ini di aplikasi bank / dompet digital Anda untuk melunasi sewa
                          </p>
                        </div>
                      </div>
                    )}

                    {payMethod === 'va' && (
                      <div className="fade-up-anim p-5 space-y-4">
                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                          <span className="text-xl">🏦</span>
                          <div>
                            <p className="text-xs font-black text-amber-800 leading-tight">Transfer Virtual Account (VA)</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Dicek otomatis dalam 10 detik setelah dibayar</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* VA option 1: BCA */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-600 text-white font-black text-[9px] px-2 py-1 rounded">BCA</div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none">BCA Virtual Account</p>
                                <p className="text-xs font-mono font-black text-slate-800 mt-1">80777 0812 9494 02</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("807770812949402");
                                setToastMessage("Nomor VA BCA disalin ke clipboard!");
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="text-[9.5px] bg-white border border-slate-250 hover:bg-slate-100 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer text-slate-600 shadow-sm"
                            >
                              Salin
                            </button>
                          </div>

                          {/* VA option 2: Mandiri */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-500 text-white font-black text-[9px] px-2 py-1 rounded">MANDIRI</div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none">Mandiri VA Berbintang</p>
                                <p className="text-xs font-mono font-black text-slate-800 mt-1">88908 0812 9494 02</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("889080812949402");
                                setToastMessage("Nomor VA Mandiri disalin!");
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="text-[9.5px] bg-white border border-slate-250 hover:bg-slate-100 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer text-slate-600 shadow-sm"
                            >
                              Salin
                            </button>
                          </div>

                          {/* VA option 3: BRI */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-800 text-white font-black text-[9px] px-2 py-1 rounded">BRI</div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none">BRIVA (BRI VA)</p>
                                <p className="text-xs font-mono font-black text-slate-800 mt-1">12891 0812 9494 02</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("128910812949402");
                                setToastMessage("Nomor BRIVA disalin!");
                                setTimeout(() => setToastMessage(null), 2500);
                              }}
                              className="text-[9.5px] bg-white border border-slate-250 hover:bg-slate-100 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer text-slate-600 shadow-sm"
                            >
                              Salin
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {payMethod === 'wallet' && (
                      <div className="fade-up-anim p-5 space-y-4">
                        <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 p-3 rounded-2xl">
                          <span className="text-xl">💳</span>
                          <div>
                            <p className="text-xs font-black text-violet-800 leading-tight">Link Dompet Digital Terintegrasi</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Pembayaran instan langsung pemicu App di smartphone</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* GoPay */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🟢</span>
                              <div>
                                <p className="text-xs font-extrabold text-slate-800">GoPay Instatap</p>
                                <p className="text-[9px] text-slate-400">Konfirmasi via Gojek App</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Aktif</span>
                          </div>

                          {/* OVO */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🟣</span>
                              <div>
                                <p className="text-xs font-extrabold text-slate-800">OVO Smartpay</p>
                                <p className="text-[9px] text-slate-400">Konfirmasi via nomor OVO</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Aktif</span>
                          </div>

                          {/* ShopeePay */}
                          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🟠</span>
                              <div>
                                <p className="text-xs font-extrabold text-slate-800">ShopeePay Direct Link</p>
                                <p className="text-[9px] text-slate-400">Potong koin Shopee otomatis</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Aktif</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 text-xs shadow-sm">
                    <span className="text-xl self-center">⚡</span>
                    <div>
                      <p className="font-bold text-orange-600 mb-0.5">Konfirmasi Manual Instan</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Sistem ini memicu simulasi upload bukti bayar instan saat tombol konfirmasi bayar di bawah di-klik.
                      </p>
                    </div>
                  </div>
                  <AppFooter />
                </div>

                {/* Bottom total recap and verify click */}
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 z-30 select-none">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                        Total Tagihan
                      </p>
                      <p className="text-xl font-extrabold text-slate-800 leading-none">
                        Rp {formatPrice(selectedEvent.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {Math.floor(paymentTimer / 60)}:{(paymentTimer % 60 < 10 ? "0" : "") + (paymentTimer % 60)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    className="w-full h-12.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xl shadow-orange-500/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1"
                  >
                    Konfirmasi Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN: MY BOOKINGS LIST */}
            {screen === "my_bookings" && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  activeScreen={screen}
                  onNavigate={navigateTo}
                />

                <div className="px-5 py-2 shrink-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Status Booking Anda</h1>
                  <p className="text-xs text-slate-400 mt-1 leading-none">Kelola pengajuan sewa booth retail Anda</p>
                </div>

                {/* Tabs list filter */}
                <div className="px-5 py-3 shrink-0">
                  <div className="flex bg-slate-200/50 rounded-xl p-1 gap-1 border border-slate-200/30">
                    {["pending", "confirmed", "rejected"].map((tab) => {
                      const label = tab === "pending" ? "Menunggu" : tab === "confirmed" ? "Diterima" : "Ditolak";
                      const isTabActive = bookingTab === tab;

                      return (
                        <button
                          key={tab}
                          onClick={() => setBookingTab(tab)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${isTabActive
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Booking items list */}
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-3.5 no-scrollbar">
                  {bookings.filter(b => b.status === bookingTab).length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <span className="text-4xl">📎</span>
                      <p className="text-xs font-bold mt-2">Tidak ada booking di tab ini</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.status === bookingTab).map((bk) => {
                      const linkedEv = events.find(e => e.id === bk.evId);

                      return (
                        <div
                          key={bk.id}
                          className="bg-white border border-slate-200 rounded-2.5xl p-4.5 flex flex-col gap-3 relative shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <p className="text-[9px] text-violet-650 font-bold tracking-wider mb-1">
                                KODE BOOKING: #{bk.id}
                              </p>
                              <h3 className="text-sm font-extrabold text-slate-800 truncate max-w-[190px]">
                                {bk.bName}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[190px]">
                                {bk.evTitle} • <strong className="text-violet-600">Booth {bk.slot}</strong>
                              </p>
                            </div>
                            {getStatusPill(bk.status)}
                          </div>

                          <div className="border-t border-slate-100 pt-3 flex items-end justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block mb-0.5">TERECAP SEJAK</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{bk.date}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-bold block mb-0.5">DEPOSIT</span>
                              <span className="text-[15px] font-black text-orange-600">Rp {formatPrice(bk.amt)}</span>
                            </div>
                          </div>

                          {/* Pay trigger fallback inside list */}
                          {bk.status === 'pending' && !bk.proof && (
                            <div className="border-t border-slate-100 pt-3">
                              <button
                                onClick={() => {
                                  const ev = events.find(e => e.id === bk.evId);
                                  if (ev) {
                                    setSelectedEvent(ev);
                                    setSelectedSlot(bk.slot);
                                    setCurrentBooking(bk);
                                    navigateTo("payment");
                                  }
                                }}
                                className="w-full text-center py-2 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 active:scale-97 cursor-pointer transition-all border border-violet-100"
                              >
                                Selesaikan Pembayaran QRIS
                              </button>
                            </div>
                          )}

                          {/* Confirmed QR Code Access */}
                          {bk.status === 'confirmed' && (
                            <div className="border-t border-slate-100 pt-3 flex flex-col items-center justify-center bg-emerald-50/50 rounded-b-2.5xl -mx-4.5 -mb-4.5 pb-4 mt-2">
                              <span className="text-[10px] text-emerald-600 font-extrabold mb-2 uppercase tracking-wide">
                                ✅ QR Akses Masuk Lapangan
                              </span>
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bk.id}`}
                                alt="QR Akses"
                                onClick={() => setQrModalUrl(bk.id)}
                                className="w-24 h-24 rounded-lg border border-emerald-200 p-1.5 bg-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              <span className="text-[9px] text-slate-500 mt-2 font-medium">Klik QR untuk memperbesar dan simpan</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SCREEN: MY TICKETS (Data Booking Confirmed) */}
            {screen === "my_tickets" && (
              <div className="flex-1 flex flex-col h-full bg-aesthetic-canvas">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                />

                <div className="px-5 py-2 shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => navigateTo("home")}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Tiket Booking</h1>
                    <p className="text-xs text-slate-400 mt-0.5 leading-none">Event yang sudah disetujui</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 space-y-5 no-scrollbar">
                  {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                    <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <span className="text-4xl block mb-3">🎫</span>
                      <p className="text-sm font-extrabold text-slate-600 mb-1">Belum Ada Tiket</p>
                      <p className="text-xs font-semibold">Anda belum memiliki event yang disetujui oleh EO.</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.status === 'confirmed').map((bk) => {
                      const linkedEv = events.find(e => e.id === bk.evId);

                      return (
                        <div
                          key={bk.id}
                          className="bg-white border border-emerald-100 rounded-[28px] overflow-hidden flex flex-col relative shadow-xl shadow-emerald-500/5 group"
                        >
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-emerald-100 font-bold tracking-widest uppercase mb-1">
                                E-Ticket Akses Masuk
                              </p>
                              <h3 className="text-lg font-black leading-tight drop-shadow-sm truncate max-w-[200px]">
                                {bk.evTitle}
                              </h3>
                            </div>
                            <div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/30 text-center shrink-0">
                              <span className="block text-[9px] font-semibold text-emerald-50 uppercase tracking-widest mb-0.5">Booth</span>
                              <span className="block text-xl font-black drop-shadow-sm leading-none">{bk.slot}</span>
                            </div>
                          </div>

                          <div className="p-6 flex flex-col gap-4 border-b-2 border-dashed border-slate-100 relative">
                            <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-200"></div>
                            <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-200"></div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tanggal Event</p>
                                <p className="text-sm font-extrabold text-slate-800">{linkedEv?.date || '-'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lokasi</p>
                                <p className="text-sm font-extrabold text-slate-800">{linkedEv?.loc || '-'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-1 pt-4 border-t border-slate-100">
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Nama Usaha / Penyewa</p>
                                <p className="text-[13px] font-extrabold text-slate-800">{bk.bName}</p>
                              </div>
                              <div className="flex-1 text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Kode Booking</p>
                                <p className="text-[13px] font-bold text-violet-600 font-mono bg-violet-50 px-2 py-0.5 rounded-lg inline-block">#{bk.id}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-slate-50/50 flex flex-col items-center justify-center">
                            <p className="text-[11px] text-slate-500 font-bold mb-3 text-center px-4">
                              Tunjukkan QR Code ini kepada panitia event saat loading-in.
                            </p>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bk.id}`}
                              alt="QR Akses"
                              onClick={() => setQrModalUrl(bk.id)}
                              className="w-32 h-32 rounded-xl border border-emerald-200 p-2 bg-white shadow-sm cursor-pointer group-hover:shadow-md transition-all group-hover:border-emerald-400"
                            />
                            <button
                              onClick={() => setQrModalUrl(bk.id)}
                              className="mt-4 text-[11px] font-extrabold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-colors"
                            >
                              Perbesar QR
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <AppFooter />
                </div>
              </div>
            )}

            {/* SCREEN: INVOICE (Data Pembayaran Selesai) */}
            {screen === "invoice" && (
              <div className="flex-1 flex flex-col h-full min-h-0 bg-aesthetic-canvas">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                />

                <div className="px-5 py-2 shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => navigateTo("home")}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Invoice Pembayaran</h1>
                    <p className="text-xs text-slate-400 mt-0.5 leading-none">Riwayat transaksi lunas</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 space-y-4 no-scrollbar min-h-0">
                  {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                    <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <span className="text-4xl block mb-3">🧾</span>
                      <p className="text-sm font-extrabold text-slate-600 mb-1">Belum Ada Invoice</p>
                      <p className="text-xs font-semibold">Anda belum memiliki transaksi pembayaran yang selesai.</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.status === 'confirmed').map((bk) => {
                      const linkedEv = events.find(e => e.id === bk.evId);

                      return (
                        <div
                          key={`inv-${bk.id}`}
                          className="bg-white border border-slate-200 rounded-[24px] overflow-hidden flex flex-col relative shadow-sm"
                        >
                          <div className="p-5 border-b border-dashed border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
                                STATUS INVOICE
                              </p>
                              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                LUNAS
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
                                KODE REF
                              </p>
                              <p className="text-sm font-black text-slate-800">INV-{bk.id.substring(0, 6)}</p>
                            </div>
                          </div>

                          <div className="p-5 flex flex-col gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dibayarkan Untuk</p>
                              <h3 className="text-sm font-extrabold text-slate-800 mt-0.5">{bk.evTitle}</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Booth: <span className="font-bold text-violet-600">{bk.slot}</span></p>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Total Bayar</p>
                                <p className="text-lg font-black text-orange-600">Rp {formatPrice(bk.amt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Tanggal</p>
                                <p className="text-xs font-extrabold text-slate-700">{bk.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <AppFooter />
                </div>
              </div>
            )}

            {/* SCREEN: PROFILE */}
            {screen === "profile" && user && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full justify-between pb-4 overflow-y-auto no-scrollbar">
                <div>
                  <Header
                    user={user}
                    notifications={notifications}
                    onOpenNotif={() => setIsNotifOpen(true)}
                    activeScreen={screen}
                    onNavigate={navigateTo}
                  />

                  <div className="p-5 flex flex-col gap-5">
                    {/* Top User Profile Section matching the image */}
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50/50 rounded-[32px] p-8 flex flex-col items-center relative border border-violet-100/50 shadow-sm">
                      <div className="relative mb-4 group">
                        <img
                          src={user.av}
                          alt={user.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://i.pravatar.cc/80";
                          }}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                        />
                        <button
                          onClick={() => {
                            if (user) {
                              setEditProfileName(user.name);
                              setEditProfileEmail(user.email);
                              setEditProfileAv(user.av);
                              setEditProfileBName(user.bName || "");
                              setEditProfileBType(user.bType || "");
                              navigateTo("edit_profile");
                            }
                          }}
                          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-[17px] font-black text-slate-900 tracking-tight">{user.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user.email}</p>

                      <div className="mt-4 px-4 py-1.5 bg-violet-100/50 rounded-full border border-violet-200/50">
                        <span className="text-[9px] font-black text-violet-700 tracking-widest uppercase">
                          {user.role === 'organizer' ? '🏢 EVENT ORGANIZER' : '💼 TENANT UMKM'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Summary Stats grid-cols-3 */}
                    <div className="grid grid-cols-3 gap-3">
                      {user.role === 'organizer' ? (
                        <>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Aktif</span>
                            <span className="text-sm font-black text-violet-700">{events.length} Event</span>
                          </div>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Selesai</span>
                            <span className="text-sm font-black text-violet-700">0 Event</span>
                          </div>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Status</span>
                            <span className="text-[11px] font-black text-emerald-600 mt-1">Terverifikasi</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Aktif</span>
                            <span className="text-sm font-black text-violet-700">{bookings.length} Event</span>
                          </div>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Selesai</span>
                            <span className="text-sm font-black text-violet-700">0 Event</span>
                          </div>
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 tracking-wider mb-1 uppercase">Status</span>
                            <span className="text-[11px] font-black text-emerald-600 mt-1">Terverifikasi</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom Section: Action list single card */}
                    <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col mt-2">
                      <button
                        onClick={() => {
                          if (user) {
                            setEditProfileName(user.name);
                            setEditProfileEmail(user.email);
                            setEditProfileAv(user.av);
                            setEditProfileBName(user.bName || "");
                            setEditProfileBType(user.bType || "");
                            navigateTo("edit_profile");
                          }
                        }}
                        className="w-full flex items-center justify-between p-4 px-5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-5 h-5 text-violet-700" />
                          <span className="text-xs font-bold text-slate-800">Ubah Informasi Akun</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => navigateTo("security_settings")}
                        className="w-full flex items-center justify-between p-4 px-5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="w-5 h-5 text-violet-700" />
                          <span className="text-xs font-bold text-slate-800">Keamanan Sandi & Enkripsi</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      {user.role === 'tenant' && (
                        <button
                          onClick={() => navigateTo("tenant_statistics")}
                          className="w-full flex items-center justify-between p-4 px-5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-violet-700" />
                            <span className="text-xs font-bold text-slate-800">Statistik Penyewaan <span className="ml-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] uppercase tracking-widest">Aktif</span></span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      )}

                      <button
                        onClick={() => setHelpModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 px-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-violet-700" />
                          <span className="text-xs font-bold text-slate-800">Pusat Bantuan EventSpace</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 px-5 hover:bg-rose-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5 text-rose-600 group-hover:-translate-x-1 transition-transform" />
                          <span className="text-xs font-bold text-rose-600">Keluar dari Akun</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* SCREEN: EDIT PROFILE */}
            {screen === "edit_profile" && user && (
              <div className="flex-1 flex flex-col bg-white h-full relative z-20 overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-slate-100 shrink-0">
                  <button
                    onClick={() => navigateTo("profile")}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="font-extrabold text-slate-800">Edit Profil</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                  <div>
                    <label className="lbl font-bold">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editProfileName}
                      onChange={(e) => setEditProfileName(e.target.value)}
                      className="inp"
                      placeholder="Nama Anda"
                    />
                  </div>
                  <div>
                    <label className="lbl font-bold">Alamat Email</label>
                    <input
                      type="email"
                      value={editProfileEmail}
                      onChange={(e) => setEditProfileEmail(e.target.value)}
                      className="inp"
                      placeholder="Email Anda"
                    />
                  </div>
                  {user.role === 'tenant' && (
                    <>
                      <div>
                        <label className="lbl font-bold">Nama Bisnis</label>
                        <input
                          type="text"
                          value={editProfileBName}
                          onChange={(e) => setEditProfileBName(e.target.value)}
                          className="inp"
                          placeholder="Nama Usaha / Bisnis Anda"
                        />
                      </div>
                      <div>
                        <label className="lbl font-bold">Kategori Bisnis</label>
                        <select
                          value={editProfileBType}
                          onChange={(e) => setEditProfileBType(e.target.value)}
                          className="inp appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                        >
                          <option value="">Pilih kategori bisnis</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Fashion & Craft">Fashion & Craft</option>
                          <option value="Health & Beauty">Health & Beauty</option>
                          <option value="Electronics">Electronics & IT</option>
                          <option value="Kerajinan">Kerajinan / Aksesoris</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="lbl font-bold">Foto Profil</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editProfileAv}
                        onChange={(e) => setEditProfileAv(e.target.value)}
                        className="inp flex-1 text-xs"
                        placeholder="Upload atau paste URL..."
                      />
                      <label className={`bg-violet-100 text-violet-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-violet-200 transition-colors ${uploadingProfileImg ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploadingProfileImg ? 'Loading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingProfileImg}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingProfileImg(true);
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                              const { data, error } = await supabase.storage
                                .from('event-images')
                                .upload(fileName, file);

                              if (error) throw error;

                              const { data: { publicUrl } } = supabase.storage
                                .from('event-images')
                                .getPublicUrl(fileName);

                              setEditProfileAv(publicUrl);
                              showToast("Foto profil berhasil di-upload!");
                            } catch (err: any) {
                              showToast("Gagal upload foto!");
                            } finally {
                              setUploadingProfileImg(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (user.role === "tenant" && editProfileBName.trim().length < 3) {
                        showToast("Nama bisnis minimal harus 3 karakter!");
                        return;
                      }
                      try {
                        setLoading(true);
                        const savedProfiles = localStorage.getItem("eventspace_business_profiles");
                        const profiles = savedProfiles ? JSON.parse(savedProfiles) : {
                          "t1": { bName: "Kopi Senja Utama", bType: "Food & Beverage" }
                        };
                        profiles[user.id] = { bName: editProfileBName, bType: editProfileBType };
                        localStorage.setItem("eventspace_business_profiles", JSON.stringify(profiles));

                        await updateUser(user.id, { name: editProfileName, email: editProfileEmail, av: editProfileAv, bName: editProfileBName, bType: editProfileBType });
                        const updatedUser = { ...user, name: editProfileName, email: editProfileEmail, av: editProfileAv, bName: editProfileBName, bType: editProfileBType };
                        setUser(updatedUser);
                        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, name: editProfileName, email: editProfileEmail, av: editProfileAv, bName: editProfileBName, bType: editProfileBType } : u));
                        showToast("Profil berhasil diperbarui!");
                        navigateTo("profile");
                      } catch (err) {
                        showToast("Gagal memperbarui profil di server.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl shadow-lg mt-6 cursor-pointer active:scale-95 transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN: SECURITY SETTINGS */}
            {screen === "security_settings" && user && (
              <div className="flex-1 flex flex-col bg-white h-full relative z-20 overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-slate-100 shrink-0">
                  <button
                    onClick={() => navigateTo("profile")}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="font-extrabold text-slate-800">Keamanan Sandi</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                  <div>
                    <label className="lbl font-bold">Password Saat Ini</label>
                    <input
                      type="password"
                      value={secOldPass}
                      onChange={(e) => setSecOldPass(e.target.value)}
                      className="inp"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <label className="lbl font-bold">Password Baru</label>
                    <input
                      type="password"
                      value={secNewPass}
                      onChange={(e) => setSecNewPass(e.target.value)}
                      className="inp"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      const currentUserFull = usersList.find(u => u.id === user.id);
                      if (!currentUserFull) {
                        showToast("Terjadi kesalahan sistem.");
                        return;
                      }
                      if (currentUserFull.password && currentUserFull.password !== secOldPass) {
                        showToast("Password saat ini salah!");
                        return;
                      }
                      if (secNewPass.length < 8) {
                        showToast("Password baru minimal 8 karakter!");
                        return;
                      }

                      try {
                        setLoading(true);
                        await updateUser(user.id, { password: secNewPass });
                        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, password: secNewPass } : u));
                        showToast("Password berhasil diperbarui!");
                        navigateTo("profile");
                      } catch (err) {
                        showToast("Gagal memperbarui password di server.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl shadow-lg mt-6 cursor-pointer active:scale-95 transition-all"
                  >
                    Simpan Password
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN: ORGANIZER DASHBOARD */}
            {screen === "org_dashboard" && user && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full print-container">
                <div className="no-print">
                  <Header
                    user={user}
                    notifications={notifications}
                    onOpenNotif={() => setIsNotifOpen(true)}
                    activeScreen={screen}
                    onNavigate={navigateTo}
                  />
                </div>

                <div className="px-5 py-4 space-y-4 flex-1 overflow-y-auto pb-14 no-scrollbar">
                  {/* Modern Segmented Sub-View Switcher Tab Control */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 max-w-[280px] no-print self-start">
                    <button
                      onClick={() => setActiveOrgSubView("dashboard")}
                      className={`flex-1 text-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${activeOrgSubView === "dashboard"
                          ? "bg-white text-slate-800 shadow-sm border border-slate-200/10"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                        }`}
                    >
                      Ringkasan
                    </button>
                    <button
                      onClick={() => setActiveOrgSubView("report")}
                      className={`flex-1 text-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${activeOrgSubView === "report"
                          ? "bg-white text-slate-800 shadow-sm border border-slate-200/10"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                        }`}
                    >
                      Laporan
                    </button>
                  </div>

                  {/* SUB-VIEW 1: RINGKASAN DASHBOARD */}
                  {activeOrgSubView === "dashboard" && (
                    <div className="space-y-5 fade-up-anim no-print">
                      <div>
                        <h1 className="text-2xl font-black text-slate-800">Dashboard Promoter 👋</h1>
                        <p className="text-xs text-slate-500 mt-1">Ringkasan performa penjualan lapak booth Anda</p>
                      </div>

                      {/* 4 Premium Metric Cards inspired by the pet hotel design */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Total Booking */}
                        <div className="bg-white border border-slate-100 p-5 rounded-[24px] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-black text-slate-800 leading-none">{bookings.length}</span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Total Booking</h4>
                            <p className="text-[9px] text-slate-500 mt-1 font-medium">Semua data masuk</p>
                          </div>
                        </div>

                        {/* 2. Menunggu Konfirmasi */}
                        <div className="bg-white border border-slate-100 p-5 rounded-[24px] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/5 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                              <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-black text-slate-800 leading-none">
                              {bookings.filter(b => b.status === 'pending').length}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Menunggu Konfirmasi</h4>
                            <p className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md mt-1 font-semibold inline-block">Butuh Verifikasi</p>
                          </div>
                        </div>

                        {/* 3. Booking Aktif */}
                        <div className="bg-white border border-slate-100 p-5 rounded-[24px] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-black text-slate-800 leading-none">
                              {bookings.filter(b => b.status === 'confirmed').length}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Booking Disetujui</h4>
                            <p className="text-[9px] text-slate-500 mt-1 font-medium">Sewa booth aktif</p>
                          </div>
                        </div>

                        {/* 4. Total Pendapatan */}
                        <div className="bg-white border border-slate-100 p-5 rounded-[24px] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                              <BarChart3 className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black text-slate-800 truncate leading-none">
                              Rp {formatPrice(bookings.filter(b => b.status === 'confirmed').reduce((sum, item) => sum + item.amt, 0))}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Total Omset Lunas</h4>
                            <p className="text-[9px] text-slate-500 mt-1 font-medium">Realisasi dana bersih</p>
                          </div>
                        </div>
                      </div>

                      {/* Split Layout Column: Weekly Revenue (Left 60%) & Recent Bookings (Right 40%) */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Left Column: Weekly Event Revenue Bar Chart */}
                        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Tren Performa</span>
                                <h3 className="text-base font-black text-slate-800 mt-0.5">Grafik Pendapatan Event</h3>
                              </div>
                              <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
                                4 Minggu Terakhir
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold mb-6">Akumulasi mingguan dari sewa booth lunas</p>
                          </div>

                          <div className="flex items-end gap-3 justify-between h-56 pt-2">
                            {/* Y-Axis Labels */}
                            <div className="flex flex-col justify-between h-full text-[10px] font-bold text-slate-400 pb-6 pr-1 text-right select-none shrink-0 font-mono">
                              <span>15 Jt</span>
                              <span>10 Jt</span>
                              <span>5 Jt</span>
                              <span>0</span>
                            </div>

                            {/* Bar columns */}
                            <div className="flex-1 flex justify-around gap-4 h-full items-end">
                              {(() => {
                                const weeklyRevenues = (() => {
                                  const revenues = [0, 0, 0, 0];
                                  bookings.forEach(b => {
                                    if (b.status !== "confirmed") return;
                                    const bDate = parseIndonesianDate(b.date);
                                    if (!bDate) return;
                                    const day = bDate.getDate();
                                    if (day <= 7) revenues[0] += b.amt;
                                    else if (day <= 14) revenues[1] += b.amt;
                                    else if (day <= 21) revenues[2] += b.amt;
                                    else revenues[3] += b.amt;
                                  });
                                  if (revenues.every(r => r === 0) && user?.email === "admin@eventspace.com") {
                                    return [4500000, 9200000, 6800000, 12500000];
                                  }
                                  return revenues;
                                })();
                                const maxVal = 15000000; // represented max value is 15 Jt

                                return ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"].map((weekLabel, idx) => {
                                  const val = weeklyRevenues[idx];
                                  const pct = Math.max(Math.min(Math.round((val / maxVal) * 100), 100), 8); // at least 8% to make it visible and pretty

                                  return (
                                    <div key={weekLabel} className="flex-1 flex flex-col items-center gap-2.5 h-full max-w-[50px]">
                                      <div className="w-full flex-1 bg-slate-50 border border-slate-100/50 rounded-full relative overflow-hidden flex items-end">
                                        <motion.div
                                          initial={{ height: 0 }}
                                          animate={{ height: `${pct}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut" }}
                                          className="w-full rounded-full cursor-pointer relative group shadow-md shadow-blue-500/10 flex flex-col justify-between items-center py-2 transition-transform duration-300 hover:scale-105 active:scale-95"
                                          style={{ background: 'linear-gradient(to top, #2563eb, #38bdf8)' }}
                                        >
                                          {/* Floating Value inside or above on hover */}
                                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm border border-slate-700">
                                            Rp {formatPrice(val)}
                                          </div>
                                        </motion.div>
                                      </div>

                                      {/* Nominal value on top of label */}
                                      <span className="text-[10px] font-black text-slate-700 leading-none">
                                        {formatJuta(val)}
                                      </span>

                                      {/* Day text label */}
                                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wide select-none">
                                        {weekLabel}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Booking Terbaru List */}
                        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Booking Terkini</span>
                                <h3 className="text-base font-black text-slate-800 mt-0.5">Booking Terbaru</h3>
                              </div>
                              <button
                                onClick={() => { setBookingTab("pending"); navigateTo("org_bookings"); }}
                                className="text-[10px] text-violet-600 font-extrabold hover:underline"
                              >
                                Lihat Semua
                              </button>
                            </div>

                            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
                              {bookings.length === 0 ? (
                                <div className="text-center py-6">
                                  <p className="text-xs text-slate-400 font-medium">Belum ada pengajuan masuk</p>
                                </div>
                              ) : (
                                bookings.slice(0, 3).map(b => {
                                  // Determine status badge classes
                                  let statusBadge = <span className="pill pb">Menunggu</span>;
                                  if (b.status === "confirmed") {
                                    statusBadge = <span className="pill pg">Diterima</span>;
                                  } else if (b.status === "rejected") {
                                    statusBadge = <span className="pill pr">Ditolak</span>;
                                  }

                                  return (
                                    <div
                                      key={b.id}
                                      onClick={() => {
                                        setBookingTab(b.status);
                                        navigateTo("org_bookings");
                                      }}
                                      className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-2 hover:bg-slate-100/50 hover:border-slate-200 transition-all cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2.5 truncate">
                                        <img
                                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.tName)}&background=eef2ff&color=4f46e5&bold=true&size=80`}
                                          className="w-8 h-8 rounded-full border border-slate-200/50 shrink-0"
                                          alt="Tenant"
                                        />
                                        <div className="truncate">
                                          <p className="text-xs font-black text-slate-800 leading-tight truncate">{b.bName || b.tName}</p>
                                          <p className="text-[9px] text-slate-400 font-bold tracking-wide mt-0.5">{b.id} • {b.slot}</p>
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <p className="text-xs font-extrabold text-slate-800">Rp {formatPrice(b.amt)}</p>
                                        <div className="mt-1">{statusBadge}</div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Quick booking pending info and process action button */}
                          <div className="border-t border-slate-100 mt-4 pt-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>Total Antrean Pending</span>
                              <span className="text-amber-500 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                {bookings.filter(b => b.status === "pending").length} Pengajuan
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setBookingTab("pending");
                                navigateTo("org_bookings");
                              }}
                              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-violet-500/10 cursor-pointer active:scale-95 transition-all text-center"
                            >
                              Proses Booking
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action quick shortcut cards */}
                      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 shrink-0">
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={prepareCreateForm}
                          className="flex-1 min-w-[155px] cyber-card rounded-[20px] p-4 flex items-center gap-3 bg-white cursor-pointer border border-slate-100 group transition-all"
                        >
                          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div className="text-left truncate">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight mb-0.5">Buat Event</p>
                            <p className="text-[9px] text-slate-400 font-semibold leading-tight">Lapak Baru</p>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            navigateTo("org_events");
                          }}
                          className="flex-1 min-w-[155px] cyber-card rounded-[20px] p-4 flex items-center gap-3 bg-white cursor-pointer border border-slate-100 group transition-all"
                        >
                          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="text-left truncate">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight mb-0.5">Kelola Event</p>
                            <p className="text-[9px] text-slate-400 font-semibold leading-tight">Daftar Lapak</p>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setBookingTab("pending");
                            navigateTo("org_bookings");
                          }}
                          className="flex-1 min-w-[155px] cyber-card rounded-[20px] p-4 flex items-center gap-3 bg-white cursor-pointer border border-slate-100 group transition-all"
                        >
                          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="text-left truncate">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight mb-0.5">Validasi Sewa</p>
                            <p className="text-[9px] text-slate-400 font-semibold leading-tight">Bukti Transfer</p>
                          </div>
                        </motion.button>
                      </div>

                      {/* Event occupancy rates list */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Okupansi Booth</span>
                            <p className="text-sm font-extrabold text-slate-800">Status Keterisian Lahan</p>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-md">Live Update</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {events.map((e) => {
                            const bookedCount = e.slots.filter(s => s.s === 1).length;
                            const pct = Math.round((bookedCount / e.total) * 100);

                            return (
                              <div key={e.id} className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm relative overflow-hidden flex flex-col justify-between gap-3 group hover:border-violet-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-center relative z-10">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img src={e.img} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200/40" alt={e.title} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-800 leading-tight truncate">{e.title}</p>
                                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate">{e.date}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-sm font-black text-violet-600">{pct}%</span>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{bookedCount}/{e.total} Lapak</p>
                                  </div>
                                </div>
                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden relative z-10 border border-slate-100">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 2: LAPORAN PENYEWAAN & PENDAPATAN */}
                  {activeOrgSubView === "report" && (
                    <div className="space-y-5 fade-up-anim">
                      {/* Control Panel: Filters & Action Buttons */}
                      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
                        <div className="w-full md:w-auto flex justify-center md:justify-start">
                          <div className="bg-slate-50 border border-slate-200/60 rounded-full px-4 py-2 flex items-center justify-center gap-2 shadow-inner w-full max-w-[320px]">
                            <span className="text-slate-400 text-xs">📅</span>
                            <div className="flex items-center gap-1.5 flex-1">
                              <div className="flex flex-col">
                                <span className="text-[7px] font-extrabold uppercase text-slate-400 tracking-wider leading-none mb-0.5">Mulai</span>
                                <input
                                  type="date"
                                  value={repStartDate}
                                  onChange={(e) => setRepStartDate(e.target.value)}
                                  className="bg-transparent border-none text-[10px] font-black focus:outline-none text-slate-700 w-[105px] cursor-pointer p-0"
                                />
                              </div>
                              <span className="text-slate-300 font-extrabold text-[10px] px-0.5 self-end mb-1">→</span>
                              <div className="flex flex-col">
                                <span className="text-[7px] font-extrabold uppercase text-slate-400 tracking-wider leading-none mb-0.5">Selesai</span>
                                <input
                                  type="date"
                                  value={repEndDate}
                                  onChange={(e) => setRepEndDate(e.target.value)}
                                  className="bg-transparent border-none text-[10px] font-black focus:outline-none text-slate-700 w-[105px] cursor-pointer p-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadPDF}
                          className="w-full md:w-auto bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <span>📥</span> DOWNLOAD PDF
                        </button>
                      </div>

                      {/* Printable Report Document wrapper */}
                      <div
                        id="printable-report"
                        className="bg-white border border-slate-200 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col gap-6"
                      >
                        {/* Report Official Document Header (Letterhead style) */}
                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                                  <defs>
                                    <linearGradient id="grad-eo" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#7c3aed" />
                                      <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                  </defs>
                                  <rect width="100" height="100" rx="24" fill="url(#grad-eo)" />
                                  <g fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="26" y="26" width="20" height="20" rx="4" />
                                    <rect x="54" y="26" width="20" height="20" rx="4" />
                                    <rect x="26" y="54" width="20" height="20" rx="4" />
                                    <rect x="54" y="54" width="20" height="20" rx="4" />
                                  </g>
                                </svg>
                              </div>
                              <span className="text-base font-black text-slate-800 tracking-tight font-sans">EventSpace.</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mt-1 leading-none">Professional Event Booth Hub</p>
                          </div>

                          <div className="text-left md:text-right font-sans">
                            <h2 className="text-base font-black text-slate-800 leading-tight">LAPORAN TRANSAKSI REALISASI</h2>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold">
                              Periode: <span className="text-violet-600 font-extrabold font-mono">{formatIndonesianDateStr(repStartDate)}</span> s/d <span className="text-violet-600 font-extrabold font-mono">{formatIndonesianDateStr(repEndDate)}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                              Dibuat: <span className="text-slate-600 font-bold">{user.name} (Promoter)</span> • Dicetak: <span className="text-slate-600 font-bold font-mono">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </p>
                          </div>
                        </div>

                        {/* Computed report variables */}
                        {(() => {
                          const filtered = bookings.filter(b => {
                            if (b.status !== "confirmed") return false;
                            const bDate = parseIndonesianDate(b.date);
                            if (!bDate) return true;
                            const start = new Date(repStartDate);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date(repEndDate);
                            end.setHours(23, 59, 59, 999);
                            return bDate >= start && bDate <= end;
                          });

                          const totalRevenue = filtered.reduce((sum, item) => sum + item.amt, 0);
                          const averagePrice = filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0;

                          const totalCapacity = events.reduce((sum, e) => sum + e.total, 0);
                          const occupancyPct = totalCapacity > 0 ? Math.min(Math.round((filtered.length / totalCapacity) * 100), 100) : 0;

                          return (
                            <>
                              {/* 3 Report Specific Stat Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">Total Realisasi Pendapatan</span>
                                  <p className="text-xl font-black text-slate-800 leading-none">Rp {formatPrice(totalRevenue)}</p>
                                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mt-2 inline-block font-sans">
                                    Realisasi Tunai Lunas
                                  </span>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">Rerata Nilai Sewa Lapak</span>
                                  <p className="text-xl font-black text-slate-800 leading-none">Rp {formatPrice(averagePrice)}</p>
                                  <span className="text-[9px] text-slate-400 font-semibold mt-2 block">
                                    Per-transaksi booth tersewa
                                  </span>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">Tingkat Okupansi Booth</span>
                                  <p className="text-xl font-black text-slate-800 leading-none">{occupancyPct}%</p>
                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2 border border-slate-100">
                                    <div className="h-full bg-violet-600 rounded-full" style={{ width: `${occupancyPct}%` }} />
                                  </div>
                                </div>
                              </div>

                              {/* Laporan Table */}
                              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                                <table className="w-full text-left border-collapse font-sans">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                                      <th className="py-3.5 px-4 font-extrabold">Invoice</th>
                                      <th className="py-3.5 px-4 font-extrabold">Tenant & PIC</th>
                                      <th className="py-3.5 px-4 font-extrabold">Slot</th>
                                      <th className="py-3.5 px-4 font-extrabold text-center">Bayar</th>
                                      <th className="py-3.5 px-4 font-extrabold">Tanggal Sewa</th>
                                      <th className="py-3.5 px-4 font-extrabold text-center">Status</th>
                                      <th className="py-3.5 px-4 font-extrabold text-right">Pendapatan</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {filtered.length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="py-8 px-4 text-center text-slate-400 font-semibold font-sans">
                                          Tidak ditemukan transaksi lunas dalam rentang tanggal ini.
                                        </td>
                                      </tr>
                                    ) : (
                                      filtered.map(b => {
                                        // Deterministic payment method based on booking ID
                                        let payMethodText = "QRIS (BNC)";
                                        const lastDigit = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
                                        if (lastDigit % 3 === 0) {
                                          payMethodText = "VA Mandiri";
                                        } else if (lastDigit % 3 === 1) {
                                          payMethodText = "E-Wallet (GoPay)";
                                        }

                                        return (
                                          <tr key={b.id} className="hover:bg-slate-50/50 transition-colors font-sans">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{b.id}</td>
                                            <td className="py-3 px-4">
                                              <div className="font-extrabold text-slate-800">{b.bName || b.tName}</div>
                                              <div className="text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">PIC: {b.pic} • {b.phone}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-extrabold">
                                                {b.slot}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-[10px] font-bold text-slate-500 font-mono">
                                              {payMethodText}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 font-bold">{b.date}</td>
                                            <td className="py-3 px-4 text-center">
                                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-[#e2fbf0]">
                                                LUNAS
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-extrabold text-emerald-600 font-mono">
                                              + Rp {formatPrice(b.amt)}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Official verification signature row at bottom for professional paper print */}
                              <div className="hidden print:flex justify-end gap-16 mt-10 pt-6 font-sans">
                                <div className="text-center">
                                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Disetujui Oleh,</p>
                                  <div className="h-14"></div>
                                  <p className="text-xs font-bold text-slate-800 underline">Michael</p>
                                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Promoter EventSpace</p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="no-print">
                    <AppFooter />
                  </div>
                </div>
              </div>
            )}


            {/* SCREEN: ORGANIZER EVENTS MANAGER */}
            {screen === "org_events" && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  activeScreen={screen}
                  onNavigate={navigateTo}
                />

                <div className="px-6 pt-6 pb-2 shrink-0 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Kelola Event Promosi</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Edit, hapus & atur slot spatial</p>
                  </div>
                  <button
                    onClick={prepareCreateForm}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-md shadow-orange-500/20"
                  >
                    Create Event
                  </button>
                </div>

                {/* Events scroll table cards */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-14 no-scrollbar">
                  {events.length === 0 ? (
                    <div className="text-center py-20 text-slate-350 select-none">
                      <span className="text-3xl">🗓️</span>
                      <p className="text-xs mt-2 font-bold">Belum ada Event buatan Anda</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {events.map((e) => {
                        const avCount = e.slots.filter(s => s.s === 0).length;
                        return (
                          <div key={e.id} className="bg-white border border-slate-200 rounded-2.5xl p-4 space-y-3 shadow-sm">
                            <div className="flex gap-3">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                <img src={e.img} alt={e.title} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 text-base">{e.tag}</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="text-xs font-bold leading-snug text-slate-800 truncate max-w-[130px]">{e.title}</h4>
                                  {getStatusPill(e.status)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{e.date}</p>
                                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                                  <span className="text-xs font-extrabold text-orange-605">Rp {formatPrice(e.price)}</span>
                                  <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 py-0.5 px-2 rounded-md">{avCount} Kosong</span>
                                </div>
                              </div>
                            </div>

                            {/* Event action controls inside cards */}
                            <div className="flex gap-2.5 pt-1.5 border-t border-slate-100 shrink-0">
                              <button
                                onClick={() => prepareEditForm(e)}
                                className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-violet-650 bg-violet-50 hover:bg-violet-100 border border-violet-150 active:scale-97 cursor-pointer transition-all"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedEvent(e);
                                  navigateTo("org_slot");
                                }}
                                className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-emerald-650 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 active:scale-97 cursor-pointer transition-all"
                              >
                                Lapak Slot
                              </button>

                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 cursor-pointer active:scale-97 transition-all flex items-center justify-center shrink-0"
                              >
                                <Trash2 className="w-4 h-4 shrink-0 text-rose-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <AppFooter />
                </div>
              </div>
            )}

            {/* SCREEN: ORGANIZER BOOKINGS VERIFICATION */}
            {screen === "org_bookings" && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full">
                <Header
                  user={user}
                  notifications={notifications}
                  onOpenNotif={() => setIsNotifOpen(true)}
                  activeScreen={screen}
                  onNavigate={navigateTo}
                />

                <div className="px-6 pt-6 pb-2 shrink-0 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Kelola Booking</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Konfirmasi dan verifikasi pengajuan sewa booth</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 pb-14 space-y-5 no-scrollbar relative">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari Tenant atau Slot ID..." className="w-full bg-white border border-slate-200 text-xs px-10 py-3 rounded-full outline-none focus:border-violet-500 shadow-sm placeholder:text-slate-400" />
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setBookingTab('all')}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${bookingTab === 'all' || !bookingTab ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setBookingTab('pending')}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${bookingTab === 'pending' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Menunggu
                    </button>
                    <button
                      onClick={() => setBookingTab('confirmed')}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${bookingTab === 'confirmed' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Dikonfirmasi
                    </button>
                    <button
                      onClick={() => setBookingTab('rejected')}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${bookingTab === 'rejected' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Ditolak
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl p-3 shadow-md relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-md"></div>
                      <p className="text-[9px] font-extrabold text-white/70 tracking-widest uppercase mb-1">Total Booking</p>
                      <p className="text-2xl font-black text-white">{bookings.length}</p>
                    </div>
                    <div className="bg-orange-500 rounded-xl p-3 shadow-md relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-md"></div>
                      <p className="text-[9px] font-extrabold text-white/70 tracking-widest uppercase mb-1">Menunggu</p>
                      <p className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'pending').length}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-bold text-slate-800">Daftar Booking Terbaru</h3>
                      <button className="text-[10px] text-violet-700 font-bold hover:underline">Terbaru v</button>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const filteredBookings = bookingTab === 'all' || !bookingTab ? bookings : bookings.filter(b => b.status === bookingTab);

                        if (filteredBookings.length === 0) {
                          return (
                            <div className="text-center py-20 text-slate-400 select-none">
                              <span className="text-4xl block mb-2 opacity-50">📂</span>
                              <p className="text-xs font-bold">Tidak ada booking {bookingTab === 'pending' ? 'menunggu' : ''}</p>
                            </div>
                          );
                        }

                        // Group by evId/evTitle
                        const grouped: Record<string, typeof filteredBookings> = {};
                        filteredBookings.forEach(b => {
                          const evTitle = b.evTitle || "Event Lainnya";
                          if (!grouped[evTitle]) grouped[evTitle] = [];
                          grouped[evTitle].push(b);
                        });

                        return Object.entries(grouped).map(([evTitle, evBookings]) => (
                          <div key={evTitle} className="mb-6">
                            <h4 className="text-[11px] font-extrabold text-violet-700 tracking-wider uppercase mb-3 flex items-center gap-2 border-b border-violet-100 pb-2">
                              <span className="bg-violet-100 text-violet-600 p-1 rounded-md">🎪</span>
                              {evTitle}
                              <span className="ml-auto text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{evBookings.length} Booking</span>
                            </h4>
                            <div className="space-y-3">
                              {evBookings.map((b) => (
                                <div key={b.id} className="bg-white border border-slate-150 p-3.5 rounded-2xl flex items-start gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
                                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 mt-1">
                                    <LayoutDashboard className="w-5 h-5 text-violet-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] font-extrabold text-slate-800 truncate mb-0.5">{b.bName || "Penyewa"}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium mb-1">{b.bType || "Tenant"}</p>

                                    <div className="flex flex-col gap-0.5 mb-2 bg-slate-50 border border-slate-100 rounded-lg p-2">
                                      <p className="text-[9px] text-slate-500 font-medium"><span className="font-bold text-slate-700">PIC:</span> {b.pic || "-"}</p>
                                      <p className="text-[9px] text-slate-500 font-medium"><span className="font-bold text-slate-700">No HP:</span> {b.phone || "-"}</p>
                                    </div>

                                    {b.status === 'pending' ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-[4px] text-[9px] font-bold">
                                        <Clock className="w-2.5 h-2.5" /> Menunggu Pembayaran
                                      </span>
                                    ) : b.status === 'confirmed' ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-[4px] text-[9px] font-bold">
                                        <CheckCircle className="w-2.5 h-2.5" /> Lunas
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-[4px] text-[9px] font-bold">
                                        <X className="w-2.5 h-2.5" /> Ditolak
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0 flex flex-col justify-between h-full min-h-[90px]">
                                    <p className="text-[11px] font-extrabold text-violet-900 mt-1">Booth {b.slot}</p>
                                    {b.status === 'pending' ? (
                                      <div className="flex flex-col gap-1.5 mt-2">
                                        <button
                                          onClick={() => handleVerifyBooking(b.id, "confirmed")}
                                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 shadow-sm shadow-emerald-500/20 block w-full text-center"
                                        >
                                          Konfirmasi
                                        </button>
                                        <button
                                          onClick={() => handleVerifyBooking(b.id, "rejected")}
                                          className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 shadow-sm shadow-rose-500/20 block w-full text-center animate-pulse"
                                        >
                                          Tolak
                                        </button>
                                      </div>
                                    ) : b.status === 'confirmed' ? (
                                      <p className="text-[9px] font-semibold text-emerald-600 mt-1 font-bold">Lunas / Diterima</p>
                                    ) : (
                                      <p className="text-[9px] font-semibold text-rose-605 mt-1 font-bold">Ditolak</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="bg-violet-50 border border-violet-100 p-3 rounded-xl flex gap-2 shadow-sm items-start">
                    <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Tips Admin</p>
                      <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">Konfirmasi booking segera setelah validasi pembayaran manual jika tenant memilih transfer bank.</p>
                    </div>
                  </div>
                  <AppFooter />
                </div>
              </div>
            )}

            {/* SCREEN: ORGANIZER EVENTS CREATION / FORM */}
            {screen === "org_ev_form" && (
              <div className="flex-1 flex flex-col bg-aesthetic-canvas h-full justify-between">
                <div className="px-5 pt-4 flex items-center gap-3 shrink-0 uppercase mb-4">
                  <button
                    onClick={() => navigateTo("org_events")}
                    className="bg-slate-100 border border-slate-200 hover:bg-slate-250 text-slate-700 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="font-extrabold text-[13px] text-slate-800 tracking-wide">
                    {editingEventId ? "Sunting Detil Event" : "Rancang Event Baru"}
                  </div>
                </div>

                {/* Creation Form Entries */}
                <div className="flex-1 overflow-y-auto px-5 pb-20 space-y-5 no-scrollbar">

                  {/* Card 1: Informasi Utama */}
                  <div className="bg-white border border-slate-150/60 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                      <span className="bg-violet-50 text-violet-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-[8px] sm:text-[9px]">
                        01
                      </span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Informasi Utama</h4>
                    </div>

                    <div>
                      <label className="lbl">Nama Event Utama *</label>
                      <input
                        type="text"
                        value={eFormTitle}
                        onChange={(e) => setEFormTitle(e.target.value)}
                        className="inp"
                        placeholder="Contoh: Festival Kuliner Senopati"
                      />
                    </div>

                    <div>
                      <label className="lbl">Detail Alamat / Lokasi Hall *</label>
                      <input
                        type="text"
                        value={eFormLoc}
                        onChange={(e) => setEFormLoc(e.target.value)}
                        className="inp"
                        placeholder="Contoh: Mall Grand Indonesia, Jakpus"
                      />
                    </div>
                  </div>

                  {/* Card 2: Penyelenggaraan & Slot */}
                  <div className="bg-white border border-slate-150/60 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                      <span className="bg-fuchsia-50 text-fuchsia-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-[8px] sm:text-[9px]">
                        02
                      </span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tanggal & Slotting</h4>
                    </div>

                    <div className="pl-0 pr-7 sm:px-0">
                      <label className="lbl">Pilih Rentang Tanggal Mulai & Selesai *</label>
                      <div className="flex flex-col sm:flex-row gap-3 w-full min-w-0">
                        <div className="flex flex-col min-w-0 w-full flex-1">
                          <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">Mulai</span>
                          <input
                            type="date"
                            value={eFormStartDate}
                            onChange={(e) => setEFormStartDate(e.target.value)}
                            className="inp bg-slate-50 text-slate-800 border-slate-200"
                            style={{ minWidth: 0, width: "100%" }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0 w-full flex-1">
                          <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">Selesai</span>
                          <input
                            type="date"
                            value={eFormEndDate}
                            onChange={(e) => setEFormEndDate(e.target.value)}
                            className="inp bg-slate-50 text-slate-800 border-slate-200"
                            style={{ minWidth: 0, width: "100%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="lbl">Kategori Sektor *</label>
                        <select
                          value={eFormCat}
                          onChange={(e) => setEFormCat(e.target.value)}
                          className="inp select-arrow-custom bg-slate-50 text-slate-800 border-slate-200 py-2"
                        >
                          {CATS.filter(c => c !== "Semua").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Jumlah Slot Booth *</label>
                        <input
                          type="number"
                          value={eFormTotal || ""}
                          onChange={(e) => setEFormTotal(e.target.value === "" ? 0 : Number(e.target.value))}
                          className="inp"
                          placeholder="Contoh: 20"
                          min={1}
                          max={100}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="lbl">Harga Sewa / Slot *</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-black text-slate-400 z-10 select-none">Rp</span>
                        <input
                          type="text"
                          value={eFormPrice === 0 ? "" : eFormPrice.toLocaleString("id-ID")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setEFormPrice(val === "" ? 0 : parseInt(val, 10));
                          }}
                          className="inp"
                          style={{ paddingLeft: "44px" }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Narasi & Media */}
                  <div className="bg-white border border-slate-150/60 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                      <span className="bg-orange-50 text-orange-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-[8px] sm:text-[9px]">
                        03
                      </span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Fasilitas & Publikasi</h4>
                    </div>

                    <div>
                      <label className="lbl font-bold">Narasi Lengkap & Fasilitas Lapak</label>
                      <textarea
                        value={eFormDesc}
                        onChange={(e) => setEFormDesc(e.target.value)}
                        className="inp h-auto p-3.5 leading-relaxed font-sans text-xs"
                        rows={4}
                        placeholder="Jelaskan fasilitas tenda, listrik watt, AC, meja, sirkulasi pengunjung..."
                      />
                    </div>

                    <div>
                      <label className="lbl font-bold">Gambar Header Event</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={eFormImg}
                          onChange={(e) => setEFormImg(e.target.value)}
                          className="inp text-xs flex-1"
                          placeholder="Upload atau paste link URL..."
                        />
                        <label className={`bg-violet-100 text-violet-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-violet-200 transition-colors ${uploadingImg ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {uploadingImg ? 'Loading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImg}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploadingImg(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                                const { data, error } = await supabase.storage
                                  .from('event-images')
                                  .upload(fileName, file);

                                if (error) {
                                  throw error;
                                }

                                const { data: { publicUrl } } = supabase.storage
                                  .from('event-images')
                                  .getPublicUrl(fileName);

                                setEFormImg(publicUrl);
                                showToast("Gambar berhasil di-upload!");
                              } catch (err: any) {
                                showToast("Gagal upload! Pastikan bucket 'event-images' public sudah dibuat di Supabase.");
                                console.error(err);
                              } finally {
                                setUploadingImg(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="lbl">Status Publikasi</label>
                      <select
                        value={eFormStatus}
                        onChange={(e) => setEFormStatus(e.target.value as any)}
                        className="inp select-arrow-custom bg-slate-50 text-slate-800 border-slate-200 py-2"
                      >
                        <option value="aktif">Aktif (Terlihat Publik)</option>
                        <option value="draft">Draft (Simpan Sementara)</option>
                        <option value="selesai">Selesai (Diarsipkan)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action buttons bottom */}
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex gap-2.5">
                  <button
                    onClick={() => navigateTo("org_events")}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl h-11 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-[2] font-sans font-bold text-xs tracking-wider uppercase h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {editingEventId ? "Perbarui" : "Publikasikan"}
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN: ORGANIZER SLOTS MANAGER GRID */}
            {screen === "org_slot" && selectedEvent && (
              <div className="flex-1 flex flex-col justify-between bg-aesthetic-canvas h-full">
                <div className="px-5 pt-4 flex items-center gap-3 shrink-0 mb-3 uppercase border-b border-slate-200 pb-3 bg-white shadow-sm">
                  <button
                    onClick={() => navigateTo("org_events")}
                    className="bg-slate-100 border border-slate-200 hover:bg-slate-250 text-slate-700 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-405 font-bold uppercase tracking-wider leading-none mb-1">Manajer Denah Geospasial</p>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-none truncate max-w-[190px]">{selectedEvent.title}</h4>
                  </div>
                </div>

                {/* Slots control panel */}
                <div className="flex-1 overflow-y-auto px-5 py-2.5 pb-16 space-y-4 no-scrollbar">

                  {/* Stats recap cards split 3 */}
                  <div className="grid grid-cols-3 gap-2 shrink-0">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center shadow-sm">
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pagu Booth</p>
                      <p className="text-xl font-black text-slate-800">{selectedEvent.total}</p>
                    </div>
                    <div className="bg-emerald-55 border border-emerald-200 p-2.5 rounded-xl text-center shadow-sm">
                      <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Kosong</p>
                      <p className="text-xl font-black text-emerald-600">{selectedEvent.slots.filter(s => s.s === 0).length}</p>
                    </div>
                    <div className="bg-rose-55 border border-rose-200 p-2.5 rounded-xl text-center shadow-sm">
                      <p className="text-[8px] text-rose-600 font-bold uppercase tracking-wider mb-1">Laku</p>
                      <p className="text-xl font-black text-rose-600">{selectedEvent.slots.filter(s => s.s === 1).length}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-2xl select-none shadow-sm">
                    <p className="text-[10px] text-slate-600 font-extrabold flex items-center gap-1">
                      💡 Tips Operasi:
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      Silakan ketuk (tap) salah satu kode booth di bawah ini untuk merubah ketersediaannya (toggle sewa) secara manual.
                    </p>
                  </div>

                  {/* Spatial layout map grid */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl select-none shadow-sm">
                    <div className="grid grid-cols-5 gap-2.5">
                      {selectedEvent.slots.map((slot) => {
                        const isTaken = slot.s === 1;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleToggleSlot(selectedEvent.id, slot.id)}
                            className={`aspect-square rounded-xl border text-[10px] font-extrabold cursor-pointer transition-all flex items-center justify-center ${isTaken
                              ? "bg-rose-50 border-rose-220 text-rose-600 font-bold hover:bg-rose-100"
                              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                              }`}
                          >
                            {slot.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <AppFooter />
                </div>
              </div>
            )}


          </div> {/* Closes Main App Container */}
        </div> {/* Closes Main Content Area Wrapper */}
      </div>
    </div>
  );
}

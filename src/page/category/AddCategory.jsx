import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { addCategory } from "@/services/category";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const iconSections = [
  {
    title: "Makanan & Minuman",
    icons: [
      { icon: "restaurant", label: "Restoran" },
      { icon: "bakery_dining", label: "Roti" },
      { icon: "local_bar", label: "Bar" },
      { icon: "icecream", label: "Es Krim" },
      { icon: "egg_alt", label: "Telur" },
      { icon: "local_pizza", label: "Pizza" },
      { icon: "fastfood", label: "Fast Food" },
      { icon: "coffee", label: "Kopi" },
      { icon: "ramen_dining", label: "Ramen" },
      { icon: "lunch_dining", label: "Makan Siang" },
      { icon: "dinner_dining", label: "Makan Malam" },
      { icon: "breakfast_dining", label: "Sarapan" },
      { icon: "cake", label: "Kue" },
      { icon: "cookie", label: "Kukis" },
      // { icon: "candy", label: "Permen" },
      { icon: "takeout_dining", label: "Bungkus" },
      { icon: "set_meal", label: "Paket" },
      { icon: "tapas", label: "Tapas" },
      { icon: "soup_kitchen", label: "Sup" },
      { icon: "water_drop", label: "Air" },
      { icon: "liquor", label: "Minuman" },
      { icon: "wine_bar", label: "Anggur" },
      { icon: "local_cafe", label: "Kafe" },
      { icon: "kitchen", label: "Dapur" }
    ]
  },
  {
    title: "Ritel & Belanja",
    icons: [
      { icon: "storefront", label: "Toko" },
      { icon: "sell", label: "Jual" },
      { icon: "local_mall", label: "Mal" },
      { icon: "payments", label: "Bayar" },
      { icon: "shopping_bag", label: "Tas" },
      { icon: "shopping_cart", label: "Keranjang" },
      { icon: "point_of_sale", label: "POS" },
      { icon: "receipt_long", label: "Struk" },
      { icon: "price_check", label: "Harga" },
      // { icon: "discount", label: "Diskon" },
      { icon: "card_giftcard", label: "Hadiah" },
      { icon: "shopping_basket", label: "Belanja" },
      { icon: "inventory_2", label: "Inventori" },
      { icon: "barcode", label: "Barcode" },
      { icon: "qr_code", label: "QR" },
      { icon: "wallet", label: "Dompet" },
      { icon: "account_balance", label: "Bank" },
      { icon: "currency_exchange", label: "Tukar" }
    ]
  },
  {
    title: "Elektronik",
    icons: [
      { icon: "computer", label: "Komputer" },
      { icon: "smartphone", label: "HP" },
      { icon: "headphones", label: "Headset" },
      { icon: "watch", label: "Jam" },
      { icon: "laptop_mac", label: "Laptop" },
      { icon: "tablet", label: "Tablet" },
      { icon: "tv", label: "TV" },
      { icon: "camera_alt", label: "Kamera" },
      { icon: "speaker", label: "Speaker" },
      { icon: "memory", label: "Memori" },
      { icon: "keyboard", label: "Keyboard" },
      { icon: "mouse", label: "Mouse" },
      { icon: "print", label: "Printer" },
      { icon: "scanner", label: "Scanner" },
      { icon: "monitor", label: "Monitor" },
      { icon: "power", label: "Daya" },
      { icon: "battery_charging_full", label: "Baterai" },
      { icon: "cable", label: "Kabel" },
      { icon: "router", label: "Router" },
      { icon: "devices", label: "Perangkat" }
    ]
  },
  {
    title: "Fashion & Aksesoris",
    icons: [
      { icon: "checkroom", label: "Pakaian" },
      { icon: "dry_cleaning", label: "Laundry" },
      { icon: "laundry", label: "Cuci" },
      { icon: "styler", label: "Styler" },
      { icon: "diamond", label: "Berlian" },
      { icon: "watch", label: "Jam" },
      { icon: "wallet", label: "Dompet" },
      { icon: "backpack", label: "Tas" },
      { icon: "luggage", label: "Koper" },
      { icon: "diamond", label: "Aksesoris" },
      { icon: "umbrella", label: "Payung" }
      // { icon: "glasses", label: "Kacamata" }
    ]
  },
  {
    title: "Rumah & Kebun",
    icons: [
      { icon: "home", label: "Rumah" },
      { icon: "chair", label: "Kursi" },
      { icon: "bed", label: "Tidur" },
      { icon: "light", label: "Lampu" },
      { icon: "potted_plant", label: "Tanaman" },
      { icon: "local_florist", label: "Bunga" },
      { icon: "yard", label: "Halaman" },
      { icon: "grass", label: "Rumput" },
      { icon: "deck", label: "Dek" },
      { icon: "fence", label: "Pagar" },
      { icon: "roofing", label: "Atap" },
      { icon: "window", label: "Jendela" },
      { icon: "door_front", label: "Pintu" },
      { icon: "garage", label: "Garasi" },
      { icon: "vacuum", label: "Sapu" },
      { icon: "kitchen", label: "Dapur" },
      { icon: "bathtub", label: "Bath" },
      { icon: "shower", label: "Shower" }
    ]
  },
  {
    title: "Olahraga & Kebugaran",
    icons: [
      { icon: "fitness_center", label: "Gym" },
      { icon: "sports_soccer", label: "Sepak Bola" },
      { icon: "sports_basketball", label: "Basket" },
      { icon: "sports_tennis", label: "Tenis" },
      { icon: "sports_volleyball", label: "Voli" },
      { icon: "sports_baseball", label: "Baseball" },
      { icon: "sports_golf", label: "Golf" },
      { icon: "sports_esports", label: "Game" },
      { icon: "sports_kabaddi", label: "Beladiri" },
      { icon: "sports_hockey", label: "Hoki" },
      { icon: "sports_cricket", label: "Kriket" },
      { icon: "snowboarding", label: "Snow" },
      { icon: "skateboarding", label: "Skate" },
      { icon: "directions_run", label: "Lari" },
      { icon: "directions_bike", label: "Bike" },
      { icon: "pool", label: "Renang" },
      { icon: "hiking", label: "Hiking" }
    ]
  },
  {
    title: "Kesehatan & Kecantikan",
    icons: [
      { icon: "health_and_safety", label: "Sehat" },
      { icon: "medical_services", label: "Medis" },
      { icon: "local_hospital", label: "RS" },
      // { icon: "pharmacy", label: "Apotek" },
      { icon: "vaccines", label: "Vaksin" },
      { icon: "pill", label: "Obat" },
      { icon: "stethoscope", label: "Stetoskop" },
      { icon: "biotech", label: "Bio" },
      { icon: "face", label: "Wajah" },
      { icon: "spa", label: "Spa" },
      { icon: "soap", label: "Sabun" },
      // { icon: "cosmetics", label: "Kosmetik" },
      { icon: "massage", label: "Pijat" }
      // { icon: "razor", label: "Cukur" }
    ]
  },
  {
    title: "Hiburan & Media",
    icons: [
      { icon: "theater_comedy", label: "Teater" },
      { icon: "celebration", label: "Pesta" },
      { icon: "auto_stories", label: "Buku" },
      { icon: "brush", label: "Seni" },
      { icon: "music_note", label: "Musik" },
      { icon: "movie", label: "Film" },
      { icon: "videogame_asset", label: "Game" },
      { icon: "piano", label: "Piano" },
      { icon: "palette", label: "Lukis" },
      { icon: "mic", label: "Mikrofon" },
      { icon: "album", label: "Album" },
      { icon: "live_tv", label: "TV" },
      { icon: "podcasts", label: "Podcast" },
      { icon: "library_music", label: "Musik" },
      { icon: "party_mode", label: "Pesta" },
      { icon: "sports_esports", label: "Game" }
    ]
  },
  {
    title: "Transportasi",
    icons: [
      { icon: "directions_car", label: "Mobil" },
      { icon: "local_shipping", label: "Kirim" },
      { icon: "airport_shuttle", label: "Shuttle" },
      { icon: "two_wheeler", label: "Motor" },
      { icon: "pedal_bike", label: "Sepeda" },
      { icon: "flight", label: "Pesawat" },
      { icon: "directions_boat", label: "Kapal" },
      { icon: "train", label: "Kereta" },
      { icon: "bus_alert", label: "Bus" },
      { icon: "taxi_alert", label: "Taksi" },
      { icon: "ev_station", label: "Charger" },
      { icon: "local_gas_station", label: "Bensin" },
      // { icon: "parking", label: "Parkir" },
      { icon: "toll", label: "Tol" },
      { icon: "car_rental", label: "Sewa" }
    ]
  },
  {
    title: "Bisnis & Keuangan",
    icons: [
      { icon: "account_balance", label: "Bank" },
      { icon: "payments", label: "Bayar" },
      { icon: "currency_exchange", label: "Tukar" },
      { icon: "analytics", label: "Analitik" },
      { icon: "bar_chart", label: "Grafik" },
      { icon: "monitoring", label: "Monitor" },
      { icon: "receipt", label: "Nota" },
      { icon: "request_quote", label: "Invoice" },
      { icon: "savings", label: "Tabung" },
      { icon: "account_balance_wallet", label: "Dompet" },
      { icon: "paid", label: "Dana" },
      { icon: "trending_up", label: "Naik" },
      { icon: "trending_down", label: "Turun" },
      { icon: "business", label: "Bisnis" },
      { icon: "corporate_fare", label: "Kantor" },
      { icon: "real_estate_agent", label: "Properti" }
    ]
  },
  {
    title: "Pendidikan & Seni",
    icons: [
      { icon: "school", label: "Sekolah" },
      { icon: "auto_stories", label: "Buku" },
      { icon: "brush", label: "Lukis" },
      { icon: "palette", label: "Palet" },
      { icon: "music_note", label: "Musik" },
      { icon: "piano", label: "Piano" },
      { icon: "theater_comedy", label: "Teater" },
      { icon: "stadia_controller", label: "Game" },
      { icon: "architecture", label: "Arsitek" },
      { icon: "calculate", label: "Hitung" },
      { icon: "science", label: "Sains" },
      { icon: "biotech", label: "Bio" },
      { icon: "menu_book", label: "Buku" },
      { icon: "history", label: "Sejarah" },
      { icon: "translate", label: "Bahasa" },
      { icon: "draw", label: "Gambar" }
    ]
  },
  {
    title: "Hewan & Alam",
    icons: [
      { icon: "pets", label: "Hewan" },
      { icon: "park", label: "Taman" },
      { icon: "forest", label: "Hutan" },
      { icon: "local_florist", label: "Bunga" },
      { icon: "potted_plant", label: "Tanaman" },
      { icon: "grass", label: "Rumput" },
      { icon: "yard", label: "Halaman" },
      { icon: "water_drop", label: "Air" },
      { icon: "beach_access", label: "Pantai" },
      { icon: "landscape", label: "Alam" },
      { icon: "sunny", label: "Cerah" },
      { icon: "ac_unit", label: "Dingin" },
      { icon: "whatshot", label: "Panas" },
      { icon: "thunderstorm", label: "Badai" }
    ]
  },
  {
    title: "Peralatan & Konstruksi",
    icons: [
      { icon: "construction", label: "Bangun" },
      { icon: "hardware", label: "Hardware" },
      { icon: "plumbing", label: "Pipa" },
      { icon: "electrical_services", label: "Listrik" },
      { icon: "handyman", label: "Tukang" },
      { icon: "build", label: "Buat" },
      { icon: "hardware", label: "Alat" },
      { icon: "key", label: "Kunci" },
      // { icon: "paint", label: "Cat" },
      { icon: "roofing", label: "Atap" },
      { icon: "fence", label: "Pagar" }
    ]
  },
  {
    title: "Layanan & Profesi",
    icons: [
      { icon: "support_agent", label: "CS" },
      { icon: "room_service", label: "Servis" },
      { icon: "cleaning_services", label: "Bersih" },
      { icon: "laundry", label: "Cuci" },
      { icon: "dry_cleaning", label: "Kering" },
      { icon: "security", label: "Aman" },
      { icon: "gavel", label: "Hukum" },
      { icon: "account_balance", label: "Bank" },
      { icon: "real_estate_agent", label: "Properti" },
      // { icon: "travel_agency", label: "Wisata" },
      { icon: "flight_takeoff", label: "Terbang" },
      { icon: "hotel", label: "Hotel" },
      { icon: "local_hospital", label: "RS" },
      { icon: "local_fire_department", label: "Damkar" },
      { icon: "local_police", label: "Polisi" },
      { icon: "elderly", label: "Lansia" },
      { icon: "child_care", label: "Anak" }
    ]
  }
];

const quickIcons = [
  "fastfood",
  "coffee",
  "shopping_bag",
  "devices",
  "checkroom",
  "home",
  "restaurant",
  "more_horiz",
  "memory",
  "health_and_safety",
  "fitness_center",
  "toys",
  "directions_car",
  "construction",
  "cloud_download",
  "menu_book"
];

const allIconsFlat = iconSections.flatMap((s) => s.icons);

const AddCategory = () => {
  const navigate = useNavigate();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    storeId: "",
    name: "",
    description: "",
    value: "",
    isActive: true
  });

  const { data: locationsData } = useQuery(["locations-all"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const createMutation = useMutation(addCategory, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIcon = (icon) => {
    setSelectedIcon(icon);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedIcon("");
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.storeId) {
      toast.error("Validation", { description: "Pilih toko terkait" });
      return;
    }
    if (!form.name.trim()) {
      toast.error("Validation", { description: "Nama kategori wajib diisi" });
      return;
    }
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("store", form.storeId);
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("value", form.value);
    payload.append("isActive", form.isActive);
    if (selectedIcon) payload.append("icon", selectedIcon);
    if (selectedImage) payload.append("image", selectedImage);
    createMutation.mutate(payload);
  };

  const filteredIconSections = iconSearch.trim() ? null : iconSections;

  const searchedIcons = iconSearch.trim()
    ? allIconsFlat.filter(
        (ic) =>
          ic.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
          ic.icon.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : [];

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Admin Console</span>
            <span>/</span>
            <button
              onClick={() => navigate("/category-list")}
              className="hover:text-primary transition-colors">
              Kelola Kategori
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">Tambah Kategori Baru</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Tambah Kategori Baru
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Definisikan kelompok produk baru untuk memudahkan pengelolaan inventaris Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Daftar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan Kategori
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">Informasi Kategori</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pilih Toko
                </label>
                <div className="relative">
                  <select
                    name="storeId"
                    value={form.storeId}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all appearance-none bg-background text-sm">
                    <option value="">Pilih Toko Terkait</option>
                    {locations.map((loc) => (
                      <option key={loc.id || loc._id} value={loc.id || loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nama Kategori
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                  placeholder="Misal: Minuman Dingin, Elektronik, Pakaian"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm resize-none"
                  placeholder="Berikan deskripsi singkat mengenai kategori ini..."
                  rows={5}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </label>
                <input
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                  placeholder="Masukkan nilai/slug kategori (e.g. food-beverage)"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">Status Kategori</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aktifkan untuk menampilkan kategori di toko.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </form>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setCancelModal(true)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Simpan Kategori
            </Button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">Ikon & Gambar</h3>
            <div className="space-y-6">
              <div
                onClick={() => {
                  if (!imagePreview && !selectedIcon) fileInputRef.current?.click();
                }}
                className={`aspect-square w-full rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center transition-all overflow-hidden ${
                  !imagePreview && !selectedIcon ? "group cursor-pointer hover:bg-accent" : ""
                }`}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : selectedIcon ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-6xl">{selectedIcon}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Ikon Terpilih</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">image_search</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Klik untuk Unggah</p>
                    <p className="text-xs text-muted-foreground mt-2">Format: JPG, PNG, WEBP</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {selectedIcon && !imagePreview && (
                <button
                  onClick={() => setSelectedIcon("")}
                  className="text-xs text-destructive hover:underline">
                  Hapus ikon
                </button>
              )}
              {imagePreview && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-destructive hover:underline">
                  Hapus gambar
                </button>
              )}

              <div className={imagePreview ? "pointer-events-none opacity-40" : ""}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Ikon Cepat
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {quickIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleSelectIcon(icon)}
                      className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:bg-primary hover:text-white"
                      }`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIconSearch("");
                    setIconPickerOpen(true);
                  }}
                  className="mt-4 w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">menu_book</span>
                  Lihat Semua Ikon
                </button>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              <span className="text-sm font-semibold text-primary">Tips Penamaan</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gunakan nama kategori yang singkat dan jelas agar mudah ditemukan oleh pelanggan.
              Gunakan deskripsi untuk menjelaskan cakupan produk dalam kategori tersebut.
            </p>
          </div>
        </div>
      </div>

      {iconPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIconPickerOpen(false)} />
          <div className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">category</span>
                <h3 className="text-base font-semibold text-foreground">Pilih Ikon Kategori</h3>
              </div>
              <button
                onClick={() => setIconPickerOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-8 py-4 border-b border-border">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  search
                </span>
                <input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
                  placeholder="Cari nama ikon..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {iconSearch.trim() ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {searchedIcons.map((ic) => (
                    <button
                      key={ic.icon}
                      type="button"
                      onClick={() => {
                        handleSelectIcon(ic.icon);
                        setIconPickerOpen(false);
                      }}
                      className="flex flex-col items-center gap-2 group">
                      <div
                        className={`aspect-square w-full rounded-xl border flex items-center justify-center transition-all ${
                          selectedIcon === ic.icon
                            ? "bg-primary text-white border-primary"
                            : "bg-card border-border text-muted-foreground group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                        <span className="material-symbols-outlined text-2xl">{ic.icon}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                        {ic.label}
                      </span>
                    </button>
                  ))}
                  {searchedIcons.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">
                        search_off
                      </span>
                      Tidak ada ikon ditemukan
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredIconSections.map((section) => (
                    <section key={section.title}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        {section.title}
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {section.icons.map((ic) => (
                          <button
                            key={ic.icon}
                            type="button"
                            onClick={() => {
                              handleSelectIcon(ic.icon);
                              setIconPickerOpen(false);
                            }}
                            className="flex flex-col items-center gap-2 group">
                            <div
                              className={`aspect-square w-full rounded-xl border flex items-center justify-center transition-all ${
                                selectedIcon === ic.icon
                                  ? "bg-primary text-white border-primary"
                                  : "bg-card border-border text-muted-foreground group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary"
                              }`}>
                              <span className="material-symbols-outlined text-2xl">{ic.icon}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                              {ic.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-border bg-muted/30 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIconPickerOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  if (selectedIcon) setIconPickerOpen(false);
                }}
                disabled={!selectedIcon}>
                Pilih Ikon
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Data Berhasil Ditambahkan"
        onConfirm={() => navigate("/category-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/category-list")}
      />
    </div>
  );
};

export default AddCategory;

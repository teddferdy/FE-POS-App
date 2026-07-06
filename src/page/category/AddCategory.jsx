import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { addCategory } from "@/services/category";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import StoreSelectCard from "@/components/organism/StoreSelectCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";

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
      { icon: "vaccines", label: "Vaksin" },
      { icon: "pill", label: "Obat" },
      { icon: "stethoscope", label: "Stetoskop" },
      { icon: "biotech", label: "Bio" },
      { icon: "face", label: "Wajah" },
      { icon: "spa", label: "Spa" },
      { icon: "soap", label: "Sabun" },
      { icon: "massage", label: "Pijat" }
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
  "more_horiz"
];

const allIconsFlat = [
  ...new Map(iconSections.flatMap((s) => s.icons).map((ic) => [ic.icon, ic])).values()
];

const AddCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState([]);
  const [allStores, setAllStores] = useState(false);
  const fileInputRef = useRef(null);
  const role = user?.roleType || "";

  const isSuperAdmin = role === "super_admin";

  const { data: locationsData } = useQuery(["allLocations"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, "Nama kategori wajib diisi"),
      description: z.string().optional().or(z.literal("")),
      isActive: z.boolean().default(true),
      store: z.string().optional()
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      store: ""
    }
  });

  const { handleSubmit, confirmModal } = useConfirmSubmit(form, onSubmit);

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

  const onSubmit = (values, saveAsDraft = false) => {
    if (isSuperAdmin && !allStores && selectedStore.length === 0 && !saveAsDraft) {
      form.setError("store", { message: "Pilih toko terlebih dahulu" });
      return;
    }
    form.clearErrors("store");
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("name", values.name);
    payload.append("description", values.description || "");
    payload.append("status", saveAsDraft ? "draft" : values.isActive ? "active" : "inactive");
    payload.append("store", JSON.stringify(selectedStore));
    if (selectedIcon) {
      payload.append("image", selectedIcon);
    } else if (selectedImage) {
      payload.append("image", selectedImage);
    }
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
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { label: t("breadcrumb.adminConsole") },
              { label: t("breadcrumb.category"), href: "/category-list" },
              { label: t("page.category.add.title") }
            ]}
            title={t("page.category.add.title")}
            description={t("page.category.add.description")}>
            <UserGuide guideKey="add-category" />
          </PageHeader>
        </div>
      </div>

      <div>
        <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
          <Form {...form}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="store"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <StoreSelectCard
                            locations={locations}
                            selectedStores={selectedStore}
                            onChange={(stores) => {
                              setSelectedStore(stores);
                              form.clearErrors("store");
                            }}
                            isSuperAdmin={isSuperAdmin}
                            user={user}
                            t={t}
                            title={t("page.category.form.storeSection.title")}
                            description={t("page.category.form.storeSection.desc")}
                            noStoreLabel={t("page.category.form.storeSection.noStore")}
                            addStoreLabel={t("page.category.form.storeSection.addStore")}
                            storeInfoLabel={t("page.category.form.storeInfo")}
                            allStores={allStores}
                            onAllStoresChange={(val) => {
                              setAllStores(val);
                              form.clearErrors("store");
                            }}
                            navigate={navigate}
                            mandatory={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.category.form.info")}
                    </h3>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.category.form.name")}{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              placeholder={t("page.category.form.namePlaceholder")}
                              className="h-12"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.category.form.description")}
                            </FormLabel>
                            <Textarea
                              {...field}
                              placeholder={t("page.category.form.descPlaceholder")}
                              className="resize-none"
                              rows={5}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem>
                            <div
                              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                field.value
                                  ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                                  : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                              }`}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    field.value
                                      ? "bg-green-600 text-white"
                                      : "bg-destructive/10 text-destructive"
                                  }`}>
                                  <span className="material-symbols-outlined text-lg">
                                    {field.value ? "check" : "close"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {field.value
                                      ? t("page.category.form.statusActive")
                                      : t("page.category.form.statusInactive")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.value
                                      ? t("page.category.form.activeDesc")
                                      : t("page.category.form.inactiveDesc")}
                                  </p>
                                </div>
                              </div>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-base">info</span>
                      <span className="text-sm font-semibold text-primary">
                        {t("page.category.form.namingTip")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("page.category.form.namingTipDesc")}
                    </p>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.category.form.iconSection")}
                    </h3>
                    <div className="space-y-6">
                      <div
                        onClick={() => {
                          if (!imagePreview && !selectedIcon) fileInputRef.current?.click();
                        }}
                        className={`aspect-square w-full rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center transition-all overflow-hidden ${
                          !imagePreview && !selectedIcon
                            ? "group cursor-pointer hover:bg-accent"
                            : ""
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
                              <span className="material-symbols-outlined text-6xl">
                                {selectedIcon}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {t("page.category.form.iconSelected")}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-3xl">
                                image_search
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {t("page.category.form.clickToUpload")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {t("page.category.form.imageFormat")}
                            </p>
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
                          {t("page.category.form.removeIcon")}
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
                          {t("page.category.form.removeImage")}
                        </button>
                      )}

                      <div className={imagePreview ? "pointer-events-none opacity-40" : ""}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          {t("page.category.form.quickIcons")}
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
                          className="mt-4 py-2 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center gap-2 ml-auto">
                          <span className="material-symbols-outlined text-base">menu_book</span>
                          {t("page.category.form.viewAllIcons")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
                  {t("common.cancel")}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftModal(true)}
                    disabled={isSubmitting}>
                    Simpan sebagai Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (isSuperAdmin && !allStores && selectedStore.length === 0) {
                        form.setError("store", { message: "Pilih toko terlebih dahulu" });
                        return;
                      }
                      form.clearErrors("store");
                      form.handleSubmit((v) => onSubmit(v, false))();
                    }}
                    disabled={isSubmitting}>
                    {t("page.category.button.save")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <Modal type="confirm" {...confirmModal()} />

          {iconPickerOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="absolute inset-0" onClick={() => setIconPickerOpen(false)} />
              <div className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">category</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.category.iconPicker.title")}
                    </h3>
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
                      placeholder={t("page.category.iconPicker.search")}
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
                          {t("page.category.iconPicker.empty")}
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
                                  <span className="material-symbols-outlined text-2xl">
                                    {ic.icon}
                                  </span>
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
                    {t("page.category.iconPicker.cancel")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedIcon) setIconPickerOpen(false);
                    }}
                    disabled={!selectedIcon}>
                    {t("page.category.iconPicker.select")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.category.modal.successAdd")}
          onConfirm={() => {
            queryClient.invalidateQueries(["categories"]);
            navigate("/category-list");
          }}
        />
        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.category.modal.cancelTitle")}
          confirmText={t("page.category.modal.confirmCancel")}
          onConfirm={() => navigate("/category-list")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title="Simpan sebagai Draft?"
          description="Data yang belum lengkap bisa dilengkapi nanti"
          confirmText="Ya, Simpan Draft"
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            onSubmit(values, true);
          }}
        />
      </div>
    </div>
  );
};

export default AddCategory;

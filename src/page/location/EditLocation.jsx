/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Save,
  MapPin,
  Phone,
  CloudUpload,
  Info,
  ShieldCheck,
  Check,
  History,
  X,
  Clock,
  ChevronDown,
  User,
  Building2,
  Globe,
  Mail,
  Plus,
  Trash2,
  Search,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import Modal from "@/components/organism/modal";
import LocationMapPicker from "@/components/ui/location-map-picker";
import { Combobox } from "@/components/ui/combobox";
import { editLocation, getLocationById } from "@/services/location";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalCode
} from "@/services/general";
import { reverseGeocode, forwardGeocode } from "@/services/geocoding";
import { getAllEmployee } from "@/services/employee";

const days = [
  { id: "monday", label: "Senin" },
  { id: "tuesday", label: "Selasa" },
  { id: "wednesday", label: "Rabu" },
  { id: "thursday", label: "Kamis" },
  { id: "friday", label: "Jumat" },
  { id: "saturday", label: "Sabtu" },
  { id: "sunday", label: "Minggu" }
];

const categoryOptions = [
  { value: "Main Branch", label: "Main Branch" },
  { value: "Branch", label: "Branch" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Office", label: "Office" }
];

const EditLocation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef(null);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerFetchSearch, setManagerFetchSearch] = useState("");
  const [managerPage, setManagerPage] = useState(1);
  const limit = 10;

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const provincesRef = useRef(provinces);
  const citiesRef = useRef(cities);
  const districtsRef = useRef(districts);
  const villagesRef = useRef(villages);

  useEffect(() => {
    provincesRef.current = provinces;
  }, [provinces]);
  useEffect(() => {
    citiesRef.current = cities;
  }, [cities]);
  useEffect(() => {
    districtsRef.current = districts;
  }, [districts]);
  useEffect(() => {
    villagesRef.current = villages;
  }, [villages]);

  const [showOperasional, setShowOperasional] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);

  const addSocialRow = () => setSocialLinks([...socialLinks, { platform: "", account: "" }]);
  const updateSocial = (idx, field, val) => {
    const updated = [...socialLinks];
    updated[idx] = { ...updated[idx], [field]: val };
    setSocialLinks(updated);
  };
  const removeSocial = (idx) => {
    if (socialLinks.length <= 1) return;
    setSocialLinks(socialLinks.filter((_, i) => i !== idx));
  };

  const { data: managerEmployeesData } = useQuery(
    ["employees-manager-picker", managerFetchSearch, managerPage],
    () => getAllEmployee({ search: managerFetchSearch, limit, page: managerPage }),
    { enabled: managerModalOpen }
  );
  const managerEmployees = managerEmployeesData?.data || managerEmployeesData?.employees || [];
  const managerTotal = managerEmployeesData?.total || managerEmployeesData?.pagination?.total || 0;
  const managerTotalPages = Math.ceil(managerTotal / limit) || 1;

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(2, "Nama toko minimal 2 karakter"),
      storeId: z.string().optional(),
      locationId: z.string().optional(),
      phoneNumber: z
        .string()
        .regex(/^\d+$/, "Nomor telepon hanya boleh angka")
        .min(8, "Nomor telepon minimal 8 digit")
        .max(14, "Nomor telepon maksimal 14 digit"),
      email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
      address: z.string().min(5, "Alamat minimal 5 karakter"),
      detailLocation: z.string().optional(),
      location: z.string().optional(),
      city: z.string().min(1, "Kota/Kabupaten wajib dipilih"),
      province: z.string().min(1, "Provinsi wajib dipilih"),
      district: z.string().min(1, "Kecamatan wajib dipilih"),
      village: z.string().min(1, "Kelurahan/Desa wajib dipilih"),
      postalCode: z.string().min(1, "Kode pos wajib diisi"),
      isActive: z.boolean().default(true),
      category: z.string().optional(),
      managerName: z.string().optional(),
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
      openingHours: z.array(
        z.object({
          day: z.string(),
          open: z.string().nullable(),
          close: z.string().nullable(),
          isOpen: z.boolean().default(true)
        })
      )
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      storeId: "",
      locationId: "",
      phoneNumber: "",
      email: "",
      address: "",
      detailLocation: "",
      location: "",
      city: "",
      province: "",
      district: "",
      village: "",
      postalCode: "",
      isActive: true,
      category: "Branch",
      managerName: "",
      latitude: -6.2088,
      longitude: 106.8456,
      openingHours: days.map((day) => ({
        day: day.id,
        open: "09:00",
        close: "21:00",
        isOpen: true
      }))
    }
  });

  const { data: locationData, isLoading: locationLoading } = useQuery(
    ["location-edit", editId],
    () => getLocationById({ id: editId }),
    { enabled: !!editId }
  );

  const location = locationData?.data || locationData?.location || locationData;

  const { data: provincesData } = useQuery(["provinces"], getProvinces, {
    enabled: true
  });

  useEffect(() => {
    if (provincesData) {
      setProvinces(provincesData);
    }
  }, [provincesData]);

  useEffect(() => {
    if (!location) return;

    setExistingImage(location.image || null);
    if (location.socialMedia && Array.isArray(location.socialMedia)) {
      setSocialLinks(location.socialMedia);
    }

    form.reset({
      name: location.name || "",
      storeId: location.storeId || "",
      locationId: location.id || location.locationId || "",
      phoneNumber: location.phoneNumber || "",
      email: location.email || "",
      address: location.address || "",
      detailLocation: location.detailLocation || "",
      location: "",
      city: location.city || "",
      province: location.province || "",
      district: location.district || "",
      village: location.village || "",
      postalCode: location.postalCode || "",
      isActive: location.isActive ?? location.status === "active" ?? true,
      category: location.category || "Branch",
      managerName: location.managerName || "",
      latitude: location.latitude ?? location.coordinates?.lat ?? -6.2088,
      longitude: location.longitude ?? location.coordinates?.lng ?? 106.8456,
      openingHours:
        location.openingHours && location.openingHours.length > 0
          ? location.openingHours.map((oh) => ({
              day: oh.day,
              open: oh.open,
              close: oh.close,
              isOpen: !!oh.open
            }))
          : days.map((day) => ({
              day: day.id,
              open: "09:00",
              close: "21:00",
              isOpen: true
            }))
    });

    const fetchRegions = async () => {
      if (location.province) {
        setCitiesLoading(true);
        try {
          const citiesResponse = await getCities(location.province);
          setCities(citiesResponse || []);
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setCitiesLoading(false);
        }

        if (location.city) {
          setDistrictsLoading(true);
          try {
            const districtsResponse = await getDistricts(location.city);
            setDistricts(districtsResponse || []);
          } catch (error) {
            console.error("Error fetching districts:", error);
          } finally {
            setDistrictsLoading(false);
          }

          if (location.district) {
            setVillagesLoading(true);
            try {
              const villagesResponse = await getVillages(location.district);
              setVillages(villagesResponse || []);
            } catch (error) {
              console.error("Error fetching villages:", error);
            } finally {
              setVillagesLoading(false);
            }
          }
        }
      }
    };

    fetchRegions();
  }, [location]);

  const editMutation = useMutation(editLocation, {
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      queryClient.invalidateQueries(["location-edit"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (values) => {
    if (!imageFile && (!existingImage || imageRemoved)) {
      toast.error("Gagal", { description: "Foto toko wajib diupload" });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    const openingHoursFormatted = (values.openingHours || []).map((h) => ({
      day: h.day,
      open: h.isOpen ? h.open : null,
      close: h.isOpen ? h.close : null
    }));
    const { latitude, longitude, category, ...rest } = values;
    const payload = {
      ...rest,
      storeId: values.storeId,
      locationId: values.locationId,
      mainBranch: category === "Main Branch",
      coordinates: {
        lat: latitude,
        lng: longitude
      },
      openingHours: openingHoursFormatted,
      socialMedia: socialLinks.filter((s) => s.platform && s.account),
      id: editId
    };

    const fd = new FormData();
    if (imageFile) {
      fd.append("image", imageFile);
    } else {
      fd.append("image", imageRemoved ? null : existingImage);
    }
    fd.append("data", JSON.stringify(payload));
    editMutation.mutate(fd);
  };

  const updateOpeningHours = (dayId, field, value) => {
    const currentHours = form.getValues("openingHours") || [];
    const updatedHours = currentHours.map((h) => (h.day === dayId ? { ...h, [field]: value } : h));
    form.setValue("openingHours", updatedHours);
  };

  const toggleDay = (dayId) => {
    const currentHours = form.getValues("openingHours") || [];
    const day = currentHours.find((h) => h.day === dayId);
    if (day) {
      const newIsOpen = !day.isOpen;
      const updatedHours = currentHours.map((h) =>
        h.day === dayId
          ? {
              ...h,
              isOpen: newIsOpen,
              open: newIsOpen ? "09:00" : null,
              close: newIsOpen ? "21:00" : null
            }
          : h
      );
      form.setValue("openingHours", updatedHours);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageRemoved(false);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    setImageFile(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAreaSelect = async () => {
    const provCode = form.getValues("province");
    const cityCode = form.getValues("city");
    const districtCode = form.getValues("district");
    const villageCode = form.getValues("village");

    if (!provCode) return;

    const provName =
      provincesRef.current.find((p) => p.kode_prov === provCode)?.nama_provinsi || "";
    const cityName = citiesRef.current.find((c) => c.kode_kab === cityCode)?.nama_kabupaten || "";
    const districtName =
      districtsRef.current.find((d) => d.kode_kec === districtCode)?.nama_kecamatan || "";
    const villageName =
      villagesRef.current.find((v) => v.kode_desa === villageCode)?.nama_desa || "";

    const query = [villageName, districtName, cityName, provName, "Indonesia"]
      .filter(Boolean)
      .join(", ");

    setGeoLoading(true);
    try {
      const result = await forwardGeocode(query);
      if (result) {
        form.setValue("latitude", parseFloat(result.lat));
        form.setValue("longitude", parseFloat(result.lon));
      }
    } catch (error) {
      console.error("Forward geocoding error:", error);
    } finally {
      setGeoLoading(false);
    }
  };

  if (!editId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <MapPin size={40} />
        <p>ID toko tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/location-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Building2 size={40} />
        <p>Toko tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/location-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          {
            label: t("page.location.list.title"),
            href: "/location-list",
            i18nKey: "page.location.list.title"
          },
          { label: t("page.location.edit.title"), i18nKey: "page.location.edit.title" }
        ]}
        title={t("page.location.edit.title")}
        description={t("page.location.edit.description")}>
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t("breadcrumb.back")}
        </Button>
      </PageHeader>

      {/* Form Card */}
      <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Section: Informasi Toko */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <MapPin className="text-primary" size={20} />
                    <h3 className="text-base font-semibold text-foreground">Informasi Toko</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Nama Toko <span className="text-destructive">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Contoh: Kinetic Coffee - Sudirman"
                            className="h-12"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            ID Toko
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Otomatis dari sistem"
                            disabled
                            className="font-mono h-12 bg-muted/50"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Nomor Telepon <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            {...field}
                            placeholder="62821000000"
                            className="pl-9"
                            inputMode="numeric"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                              field.onChange(value);
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maksimal 14 nomor, hanya angka
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Alamat Lengkap <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                        <Textarea
                          {...field}
                          placeholder="Masukkan alamat lengkap toko..."
                          className="pl-9 min-h-[80px] resize-none"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Detail Location */}
                <FormField
                  control={form.control}
                  name="detailLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Detail Lokasi (Patokan)
                      </FormLabel>
                      <Input {...field} placeholder="Lantai 2, Samping lift utara" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Map Picker */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pilih Lokasi di Peta
                      </FormLabel>
                      <LocationMapPicker
                        lat={form.watch("latitude")}
                        lng={form.watch("longitude")}
                        onChange={async (lat, lng) => {
                          form.setValue("latitude", lat);
                          form.setValue("longitude", lng);
                        }}
                        height="500px"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Province, City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Provinsi <span className="text-destructive">*</span>
                        </FormLabel>
                        <Combobox
                          options={provinces.map((p) => ({
                            value: p.kode_prov,
                            label: p.nama_provinsi
                          }))}
                          value={field.value || ""}
                          onChange={async (val) => {
                            field.onChange(val);
                            form.setValue("city", "");
                            form.setValue("district", "");
                            form.setValue("village", "");
                            form.setValue("postalCode", "");
                            setCities([]);
                            setDistricts([]);
                            setVillages([]);

                            if (val) {
                              setCitiesLoading(true);
                              try {
                                const citiesResponse = await getCities(val);
                                setCities(citiesResponse || []);
                              } catch (error) {
                                console.error("Error fetching cities:", error);
                              } finally {
                                setCitiesLoading(false);
                              }
                            }
                            handleAreaSelect();
                          }}
                          placeholder="Pilih Provinsi"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Kota/Kabupaten <span className="text-destructive">*</span>
                        </FormLabel>
                        <Combobox
                          options={cities.map((c) => ({
                            value: c.kode_kab,
                            label: c.nama_kabupaten
                          }))}
                          value={field.value || ""}
                          onChange={async (val) => {
                            field.onChange(val);
                            form.setValue("district", "");
                            form.setValue("village", "");
                            form.setValue("postalCode", "");
                            setDistricts([]);
                            setVillages([]);

                            if (val) {
                              setDistrictsLoading(true);
                              try {
                                const districtsResponse = await getDistricts(val);
                                setDistricts(districtsResponse || []);
                              } catch (error) {
                                console.error("Error fetching districts:", error);
                              } finally {
                                setDistrictsLoading(false);
                              }
                            }
                            handleAreaSelect();
                          }}
                          placeholder="Pilih Kota/Kabupaten"
                          disabled={!cities.length}
                          loading={citiesLoading}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Kecamatan <span className="text-destructive">*</span>
                        </FormLabel>
                        <Combobox
                          options={districts.map((d) => ({
                            value: d.kode_kec,
                            label: d.nama_kecamatan
                          }))}
                          value={field.value || ""}
                          onChange={async (val) => {
                            field.onChange(val);
                            form.setValue("village", "");
                            form.setValue("postalCode", "");
                            setVillages([]);

                            if (val) {
                              setVillagesLoading(true);
                              try {
                                const villagesResponse = await getVillages(val);
                                setVillages(villagesResponse || []);
                              } catch (error) {
                                console.error("Error fetching villages:", error);
                              } finally {
                                setVillagesLoading(false);
                              }
                            }
                            handleAreaSelect();
                          }}
                          placeholder="Pilih Kecamatan"
                          disabled={!districts.length}
                          loading={districtsLoading}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Kelurahan/Desa <span className="text-destructive">*</span>
                        </FormLabel>
                        <Combobox
                          options={villages.map((v) => ({
                            value: v.kode_desa,
                            label: v.nama_desa
                          }))}
                          value={field.value || ""}
                          onChange={async (val) => {
                            field.onChange(val);
                            form.setValue("postalCode", "");

                            if (val) {
                              try {
                                const postalData = await getPostalCode(val);
                                if (postalData && postalData.length > 0) {
                                  form.setValue("postalCode", postalData[0].kode_pos);
                                }
                              } catch (error) {
                                console.error("Error fetching postal code:", error);
                              }
                            }
                            handleAreaSelect();
                          }}
                          placeholder="Pilih Kelurahan/Desa"
                          disabled={!villages.length}
                          loading={villagesLoading}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Kode Pos <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="Otomatis terisi"
                          disabled
                          className="bg-muted/50"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Kategori
                        </FormLabel>
                        <select
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Manager Name */}
                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Nama Manager
                      </FormLabel>
                      <div className="relative">
                        <div className="cursor-pointer" onClick={() => setManagerModalOpen(true)}>
                          <User
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            {...field}
                            placeholder="Klik untuk pilih manager"
                            className="pl-9 pr-10 cursor-pointer"
                            readOnly
                          />
                        </div>
                        {field.value && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue("managerName", "");
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          {...field}
                          placeholder="toko@email.com"
                          className="pl-9"
                          type="email"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Operasional Toggle */}
                <div
                  className="flex items-center justify-between bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowOperasional(!showOperasional)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600/10 text-amber-600 rounded-lg flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Jam Operasional</p>
                      <p className="text-xs text-muted-foreground">
                        Atur jadwal operasional toko mingguan
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition-transform ${showOperasional ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Operasional Panel */}
                {showOperasional && (
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <div className="space-y-2">
                      {days.map((day) => {
                        const dayData = form
                          .watch("openingHours")
                          ?.find((h) => h.day === day.id) || {
                          day: day.id,
                          open: "09:00",
                          close: "21:00",
                          isOpen: true
                        };
                        return (
                          <div key={day.id} className="grid grid-cols-12 gap-2 items-center py-2">
                            <div className="col-span-2 text-sm font-medium">{day.label}</div>
                            <div className="col-span-3">
                              <input
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-background"
                                type="time"
                                value={dayData.open || ""}
                                disabled={!dayData.isOpen}
                                onChange={(e) => updateOpeningHours(day.id, "open", e.target.value)}
                              />
                            </div>
                            <div className="col-span-1 text-center text-xs text-muted-foreground">
                              s/d
                            </div>
                            <div className="col-span-3">
                              <input
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-background"
                                type="time"
                                value={dayData.close || ""}
                                disabled={!dayData.isOpen}
                                onChange={(e) =>
                                  updateOpeningHours(day.id, "close", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-span-2 flex justify-end items-center gap-2">
                              <span
                                className={`text-xs ${dayData.isOpen ? "text-green-600 dark:text-green-400" : "text-destructive dark:text-red-400"}`}>
                                {dayData.isOpen ? "Buka" : "Tutup"}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={dayData.isOpen}
                                  onChange={() => toggleDay(day.id)}
                                />
                                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500" />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                <div
                  className="flex items-center justify-between bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowSocialMedia(!showSocialMedia)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sosial Media</p>
                      <p className="text-xs text-muted-foreground">
                        Tambahkan akun media sosial untuk ditampilkan di invoice
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition-transform ${showSocialMedia ? "rotate-180" : ""}`}
                  />
                </div>

                {showSocialMedia && (
                  <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                    {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="Platform (IG, FB, WA)"
                          value={link.platform}
                          onChange={(e) => updateSocial(idx, "platform", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Akun / URL"
                          value={link.account}
                          onChange={(e) => updateSocial(idx, "account", e.target.value)}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocial(idx)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialRow}
                      className="gap-1">
                      <Plus size={14} />
                      Tambah Sosial Media
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Status Toggle */}
                <div className="pt-2 flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        form.watch("isActive")
                          ? "bg-green-600 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                      {form.watch("isActive") ? (
                        <Check size={20} />
                      ) : (
                        <span className="text-lg font-bold">⏻</span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Status Operasional</p>
                      <p className="text-xs text-muted-foreground">
                        Tentukan apakah toko langsung aktif atau non-aktif.
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                </div>
                {/* Foto Toko Card */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <h3 className="text-base font-semibold text-foreground">
                      Foto Toko <span className="text-destructive">*</span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Format: JPG, PNG. Maksimal 2MB.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div
                    onClick={handleImageClick}
                    className="relative rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group">
                    {!imageRemoved && (previewImage || location?.image) ? (
                      <>
                        <img
                          src={previewImage || location?.image}
                          alt={location?.name || "Preview"}
                          className="w-full h-auto max-h-[500px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          className="absolute top-2 right-2 z-10 p-2 bg-background/90 rounded-full text-muted-foreground hover:text-foreground shadow-md">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors p-8 min-h-[300px] justify-center">
                        <CloudUpload size={64} className="mb-4" />
                        <span className="text-base font-semibold text-center">
                          Klik atau Tarik Foto
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Help Cards */}
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
                    <Info size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Validasi Data
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sistem akan melakukan pengecekan ID Toko duplikat secara otomatis.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck size={18} className="text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Keamanan
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Data hanya dapat diubah oleh pemilik atau super admin.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
                    <History size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Audit Trail
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Setiap perubahan akan tercatat dalam log sistem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setCancelModal(true)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
                <Save size={18} />
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Dialog open={managerModalOpen} onOpenChange={setManagerModalOpen}>
        <DialogContent className="sm:max-w-2xl min-w-[800px] p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-lg">Pilih Manager</DialogTitle>
              <DialogDescription>
                Pilih karyawan yang akan menjadi manager toko ini.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Cari karyawan..."
                  value={managerSearch}
                  onChange={(e) => {
                    setManagerSearch(e.target.value);
                    setManagerPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setManagerFetchSearch(managerSearch);
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setManagerFetchSearch(managerSearch)}>Cari</Button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "60vh" }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="bg-muted/20">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Foto
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Departemen
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Toko
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {managerEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <User size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Tidak ada karyawan ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  managerEmployees.map((emp) => (
                    <tr
                      key={emp.id || emp._id}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => {
                        form.setValue("managerName", emp.fullName);
                        setManagerModalOpen(false);
                      }}>
                      <td className="px-4 py-3 text-sm font-mono">{emp.employeeID || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-full bg-muted overflow-hidden">
                          {emp.image ? (
                            <img
                              src={emp.image}
                              alt={emp.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-muted-foreground bg-muted">
                              {(emp.fullName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{emp.fullName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {emp.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{emp.department || "-"}</td>
                      <td className="px-4 py-3 text-sm">{emp.storeData?.name || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={managerPage <= 1}
                onClick={() => setManagerPage((p) => Math.max(1, p - 1))}
                className="h-8">
                Prev
              </Button>
              <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                {managerPage} / {managerTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={managerPage >= managerTotalPages}
                onClick={() => setManagerPage((p) => p + 1)}
                className="h-8">
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setManagerModalOpen(false);
                  navigate("/add-employee");
                }}
                className="h-8 gap-1.5">
                <UserPlus size={14} />
                Tambah Karyawan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManagerModalOpen(false)}
                className="h-8">
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Data Berhasil Diubah"
        onConfirm={() => navigate("/location-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/location-list")}
      />
    </div>
  );
};

export default EditLocation;

/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  CloudUpload,
  Info,
  ShieldCheck,
  Check,
  History,
  Map,
  X,
  Clock,
  ChevronDown,
  User,
  Building2,
  Globe,
  Mail
} from "lucide-react";
import { toast } from "sonner";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
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

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(2, "Nama toko minimal 2 karakter"),
      storeId: z.string().optional(),
      locationId: z.string().optional(),
      phoneNumber: z.string().min(8, "Nomor telepon minimal 8 karakter"),
      email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
      address: z.string().min(5, "Alamat minimal 5 karakter"),
      detailLocation: z.string().optional(),
      location: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      village: z.string().optional(),
      postalCode: z.string().optional(),
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/location-list")}
          className="font-medium hover:text-primary transition-colors">
          Kelola Toko
        </button>
        <span className="text-xs">/</span>
        <span className="font-semibold text-foreground">Edit Toko</span>
      </nav>

      {/* Form Card */}
      <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setCancelModal(true)}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Map size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Edit Lokasi Toko</h2>
              <p className="text-sm text-muted-foreground">Perbarui informasi detail unit toko.</p>
            </div>
          </div>
        </div>

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
                          <Input {...field} placeholder="+62 821 0000 0000" className="pl-9" />
                        </div>
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
                          setGeoLoading(true);
                          try {
                            const result = await reverseGeocode(lat, lng);
                            const address = result?.address;
                            const displayName = (result?.display_name || "").toLowerCase();

                            if (!address?.state) {
                              console.warn("Reverse geocode: no state found", result);
                              return;
                            }

                            const curProvinces = provincesRef.current;
                            if (curProvinces.length === 0) {
                              console.warn("Reverse geocode: provinces data not loaded yet");
                              return;
                            }

                            form.setValue("city", "");
                            form.setValue("district", "");
                            form.setValue("village", "");
                            form.setValue("postalCode", "");
                            setCities([]);
                            setDistricts([]);
                            setVillages([]);

                            const stateLower = address.state.toLowerCase();
                            const matchProvince = curProvinces.find(
                              (p) =>
                                p.nama_provinsi.toLowerCase() === stateLower ||
                                stateLower.includes(p.nama_provinsi.toLowerCase()) ||
                                p.nama_provinsi.toLowerCase().includes(stateLower)
                            );
                            if (!matchProvince) {
                              console.warn(
                                "Reverse geocode: province not matched",
                                address.state,
                                curProvinces.map((p) => p.nama_provinsi)
                              );
                              return;
                            }

                            form.setValue("province", matchProvince.kode_prov);

                            const citiesData = await getCities(matchProvince.kode_prov);
                            const curCities = citiesData || [];
                            setCities(curCities);

                            const rawCity =
                              address.county || address.city || address.municipality || "";
                            const rawCityLower = rawCity.toLowerCase();
                            const matchCity = curCities.find((c) => {
                              const namaKab = c.nama_kabupaten.toLowerCase();
                              return (
                                namaKab === rawCityLower ||
                                displayName.includes(namaKab) ||
                                rawCityLower.includes(namaKab) ||
                                namaKab.includes(rawCityLower) ||
                                rawCityLower.includes(namaKab.split(" ").pop())
                              );
                            });

                            if (matchCity) {
                              form.setValue("city", matchCity.kode_kab);

                              const districtsData = await getDistricts(matchCity.kode_kab);
                              const curDistricts = districtsData || [];
                              setDistricts(curDistricts);

                              const rawDistrict =
                                address.city_district ||
                                address.municipality ||
                                address.county ||
                                "";
                              const rawDistrictClean = rawDistrict
                                .toLowerCase()
                                .replace(/^kecamatan\s+/i, "")
                                .replace(/^kec\.?\s+/i, "")
                                .trim();
                              const matchDistrict = curDistricts.find((d) => {
                                const namaKec = d.nama_kecamatan.toLowerCase();
                                return (
                                  namaKec === rawDistrictClean ||
                                  displayName.includes(namaKec) ||
                                  rawDistrictClean.includes(namaKec) ||
                                  namaKec.includes(rawDistrictClean)
                                );
                              });

                              if (matchDistrict) {
                                form.setValue("district", matchDistrict.kode_kec);

                                const villagesData = await getVillages(matchDistrict.kode_kec);
                                const curVillages = villagesData || [];
                                setVillages(curVillages);

                                const rawVillage =
                                  address.village ||
                                  address.neighbourhood ||
                                  address.suburb ||
                                  address.hamlet ||
                                  "";
                                const rawVillageClean = rawVillage
                                  .toLowerCase()
                                  .replace(/^kelurahan\s+/i, "")
                                  .replace(/^desa\s+/i, "")
                                  .replace(/^kel\.?\s+/i, "")
                                  .trim();
                                const matchVillage = curVillages.find((v) => {
                                  const namaDesa = v.nama_desa.toLowerCase();
                                  return (
                                    namaDesa === rawVillageClean ||
                                    displayName.includes(namaDesa) ||
                                    rawVillageClean.includes(namaDesa) ||
                                    namaDesa.includes(rawVillageClean)
                                  );
                                });

                                if (matchVillage) {
                                  form.setValue("village", matchVillage.kode_desa);
                                  const postalData = await getPostalCode(matchVillage.kode_desa);
                                  if (postalData?.length > 0) {
                                    form.setValue("postalCode", postalData[0].kode_pos);
                                  }
                                } else {
                                  console.warn(
                                    "Reverse geocode: village not matched, skipping",
                                    rawVillage,
                                    curVillages.map((v) => v.nama_desa)
                                  );
                                }
                              } else {
                                console.warn(
                                  "Reverse geocode: district not matched, skipping",
                                  rawDistrict,
                                  curDistricts.map((d) => d.nama_kecamatan)
                                );
                              }
                            } else {
                              console.warn(
                                "Reverse geocode: city not matched, skipping",
                                rawCity,
                                curCities.map((c) => c.nama_kabupaten)
                              );
                            }
                          } catch (error) {
                            console.error("Reverse geocoding error:", error);
                          } finally {
                            setGeoLoading(false);
                          }
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
                          Provinsi
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
                          Kota/Kabupaten
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
                          Kecamatan
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
                          Kelurahan/Desa
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
                          Kode Pos
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
                        <User
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input {...field} placeholder="Nama manager toko" className="pl-9" />
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
                        Email
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
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm"
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
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm"
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
                                className={`text-xs ${dayData.isOpen ? "text-green-600" : "text-destructive"}`}>
                                {dayData.isOpen ? "Buka" : "Tutup"}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={dayData.isOpen}
                                  onChange={() => toggleDay(day.id)}
                                />
                                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                    <h3 className="text-base font-semibold text-foreground">Foto Toko</h3>
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

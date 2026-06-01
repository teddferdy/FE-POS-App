import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CloudUpload,
  X,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMonths, format } from "date-fns";
import { toast } from "sonner";
import { editEmployee, getEmployeeById } from "@/services/employee";
import { getShiftDropdown } from "@/services/shift";
import { getAllLocation } from "@/services/location";
import { getAllPosition } from "@/services/position";
import { getAllDepartment } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PageHeader from "@/components/ui/PageHeader";

const EditEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("id");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [deletedDocs, setDeletedDocs] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const formSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
      userName: z.string().min(1, "Username wajib diisi"),
      email: z.string().email("Format email tidak valid"),
      password: z.string().optional().or(z.literal("")),
      phoneNumber: z
        .string()
        .regex(/^\d+$/, "Nomor telepon hanya boleh angka")
        .min(8, "Minimal 8 digit")
        .max(14, "Maksimal 14 digit"),
      placeOfBirth: z.string().min(2, "Tempat lahir minimal 2 karakter"),
      address: z.string().min(5, "Alamat minimal 5 karakter"),
      gender: z.string().min(1, "Pilih jenis kelamin"),
      dateOfBirth: z.string().min(1, "Pilih tanggal lahir"),
      employeeId: z.string().min(1, "ID Karyawan harus diisi"),
      department: z.string().optional().or(z.literal("")),
      position: z.string().optional().or(z.literal("")),
      store: z.string().optional().or(z.literal("")),
      employmentType: z.string().optional().or(z.literal("")),
      contractDuration: z.string().optional().or(z.literal("")),
      endDate: z.string().optional().or(z.literal("")),
      shift: z.string().optional().or(z.literal("")),
      startDate: z.string().optional().or(z.literal("")),
      isActive: z.boolean().default(true),
      roleId: z.string().optional().or(z.literal("")),
      accessMenu: z.string().optional().or(z.literal("")),
      monthlySalary: z.coerce.number().min(0, "Tidak boleh negatif").optional().or(z.literal(""))
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      password: "",
      phoneNumber: "",
      placeOfBirth: "",
      address: "",
      gender: "",
      dateOfBirth: "",
      employeeId: "",
      department: "",
      position: "",
      store: "",
      employmentType: "",
      contractDuration: "",
      endDate: "",
      shift: "",
      startDate: "",
      isActive: true,
      roleId: "",
      accessMenu: "",
      monthlySalary: ""
    }
  });

  const { data: employeeData, isLoading: isEmployeeLoading } = useQuery(
    ["employee-edit", employeeId],
    () => getEmployeeById({ id: employeeId }),
    { enabled: !!employeeId }
  );

  const employee = employeeData?.data || employeeData?.employee || {};

  useEffect(() => {
    if (!employee.id) return;

    setExistingImageUrl(employee.image || null);
    if (employee.image) {
      setPreviewImage(employee.image);
    }
    const raw =
      typeof employee.documents === "string"
        ? JSON.parse(employee.documents)
        : employee.documents || [];
    setExistingDocuments(raw.map(normalizeDoc));

    const durationMap = {
      "1 year": "12",
      "2 years": "24",
      "3 years": "36",
      "4 years": "48",
      "5 years": "60",
      "3 bulan": "3",
      "6 bulan": "6",
      "9 bulan": "9",
      "12 bulan": "12",
      "1 tahun": "12"
    };

    const normalizeDuration = (val) => {
      if (!val) return "";
      const lower = String(val).toLowerCase();
      if (durationMap[lower]) return durationMap[lower];
      const num = parseInt(val);
      if (!isNaN(num)) return String(num);
      return String(val);
    };

    const genderMap = {
      male: "Laki-laki",
      female: "Perempuan",
      "laki-laki": "Laki-laki",
      perempuan: "Perempuan"
    };
    const employmentTypeMap = { fulltime: "full-time", parttime: "part-time" };

    form.reset({
      fullName: employee.fullName || "",
      userName: employee.userName || "",
      email: employee.email || "",
      password: "",
      phoneNumber: employee.phoneNumber || "",
      placeOfBirth: employee.placeOfBirth || "",
      address: employee.address || "",
      gender: genderMap[employee.gender?.toLowerCase()] || employee.gender || "",
      dateOfBirth: employee.dateOfBirth || "",
      employeeId: String(employee.employeeID || ""),
      department: employee.department || "",
      position: String(employee.position || employee.positionData?.id || ""),
      store: String(employee.store || employee.storeData?.id || ""),
      employmentType:
        employmentTypeMap[employee.employmentType?.toLowerCase()] || employee.employmentType || "",
      contractDuration: normalizeDuration(employee.contractDuration),
      endDate: employee.endDate || "",
      shift: String(employee.shift || ""),
      startDate: employee.startDate || "",
      isActive: employee.statusActive === true,
      roleId:
        employee.roleId !== null && employee.roleId !== undefined ? String(employee.roleId) : "",
      accessMenu: employee.accessMenu || "",
      monthlySalary: employee.monthlySalary || ""
    });
  }, [employee, form]);

  const employmentType = form.watch("employmentType");
  const startDate = form.watch("startDate");
  const contractDuration = form.watch("contractDuration");

  const contractDurations = [
    { value: "3", label: "3 Bulan" },
    { value: "6", label: "6 Bulan" },
    { value: "9", label: "9 Bulan" },
    { value: "12", label: "12 Bulan / 1 Tahun" },
    { value: "24", label: "2 Tahun" },
    { value: "36", label: "3 Tahun" },
    { value: "48", label: "4 Tahun" },
    { value: "60", label: "5 Tahun" }
  ];

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const monthlySalary = form.watch("monthlySalary");
  const daysInMonth = getDaysInMonth();
  const dailySalary = monthlySalary
    ? Math.round((Number(monthlySalary) / daysInMonth) * 100) / 100
    : 0;

  useEffect(() => {
    if (startDate && contractDuration && ["contract", "internship"].includes(employmentType)) {
      const start = new Date(startDate);
      const months = parseInt(contractDuration);
      if (!isNaN(months)) {
        const end = addMonths(start, months);
        form.setValue("endDate", end.toISOString());
      }
    } else {
      form.setValue("endDate", "");
    }
  }, [startDate, contractDuration, employmentType, form]);

  const { data: locationsData } = useQuery(["locations-all"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const { data: positionsData } = useQuery(["positions-all"], () => getAllPosition(), {
    staleTime: 5 * 60 * 1000
  });
  const positions = positionsData?.data || positionsData?.positions || [];

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  const selectedStore = form.watch("store");

  const { data: shiftsData } = useQuery(
    ["shifts-all", selectedStore],
    () => getShiftDropdown({ store: selectedStore, statusShift: "active" }),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!selectedStore
    }
  );
  const shifts = shiftsData?.data || shiftsData?.shifts || [];

  const updateMutation = useMutation(editEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employee-edit"]);
      queryClient.invalidateQueries(["employee-detail"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const normalizeDoc = (doc) => {
    if (typeof doc === "string") {
      const fileName = doc.split("/").pop() || doc;
      const ext = fileName.split(".").pop()?.toLowerCase();
      return {
        fileUrl: doc,
        fileName,
        mimeType:
          ext === "pdf"
            ? "application/pdf"
            : ext === "docx"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : ext === "jpg" || ext === "jpeg"
                ? "image/jpeg"
                : ext === "png"
                  ? "image/png"
                  : undefined
      };
    }
    return doc;
  };

  const getFileIcon = (type, name) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (type?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return <FileImage size={20} className="text-blue-500 shrink-0" />;
    if (["pdf"].includes(ext)) return <FileText size={20} className="text-red-500 shrink-0" />;
    if (["xls", "xlsx", "csv"].includes(ext))
      return <FileSpreadsheet size={20} className="text-green-600 shrink-0" />;
    if (["doc", "docx"].includes(ext))
      return <FileText size={20} className="text-blue-700 shrink-0" />;
    return <FileIcon size={20} className="text-muted-foreground shrink-0" />;
  };

  const handleDocumentSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const removeDocument = (index) => {
    setDocuments((prev) => {
      const doc = prev[index];
      if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingDocument = (index) => {
    setExistingDocuments((prev) => {
      const doc = prev[index];
      setDeletedDocs((d) => [...d, doc.fileUrl || doc]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePreviewDocument = (doc) => {
    if (doc.previewUrl) {
      window.open(doc.previewUrl, "_blank");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreviewImage(existingImageUrl || null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values) => {
    if (documents.length === 0 && existingDocuments.length === 0) {
      toast.error("Gagal", { description: "Dokumen karyawan wajib diupload minimal 1 file" });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    const payload = { ...values, id: employeeId };
    if (imageFile) {
      payload.image = imageFile;
    }
    if (deletedDocs.length > 0) {
      payload.deletedDocuments = JSON.stringify(deletedDocs);
    }
    if (documents.length > 0) {
      payload.documents = documents.map((d) => d.file);
    }
    if (values.monthlySalary) {
      payload.monthlySalary = Number(values.monthlySalary);
      payload.dailySalary = dailySalary;
    }
    if (!payload.password) {
      delete payload.password;
    }
    if (!payload.roleId) {
      delete payload.roleId;
    }
    updateMutation.mutate(payload);
  };

  if (isEmployeeLoading) {
    return <Loading fullscreen size="lg" label="Memuat data karyawan..." />;
  }

  if (!employeeId || !employee.id) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-muted-foreground">badge</span>
        <p className="text-muted-foreground">Karyawan tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/employee-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Manajemen SDM" },
          { label: "Kelola Karyawan", href: "/employee-list" },
          { label: "Detail Karyawan", href: `/detail-employee?employeeID=${employee.employeeID}` },
          { label: "Edit Karyawan" }
        ]}
        title="Edit Karyawan"
        description="Perbarui data karyawan yang sudah ada."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Section 1: Informasi Pribadi */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h4 className="text-base font-semibold text-foreground">Informasi Pribadi</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Foto
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div
                      onClick={handleImageClick}
                      className="relative w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group">
                      {previewImage ? (
                        <>
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-background/90 rounded-full text-muted-foreground hover:text-foreground shadow-md">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors p-4">
                          <CloudUpload size={36} className="mb-2" />
                          <span className="text-xs font-semibold text-center">Upload Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">JPG, PNG. Maks 2MB.</p>
                  </div>

                  <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nama Lengkap <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} placeholder="Contoh: Budi Santoso" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Email <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} type="email" placeholder="email@domain.com" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nomor Telepon <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="0812-xxxx-xxxx"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                                field.onChange(value);
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Jenis Kelamin <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tempat Lahir <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} placeholder="Contoh: Jakarta" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tanggal Lahir <span className="text-destructive">*</span>
                            </FormLabel>
                            <DatePicker
                              date={field.value ? new Date(field.value) : undefined}
                              setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Alamat <span className="text-destructive">*</span>
                          </FormLabel>
                          <Textarea
                            {...field}
                            rows={3}
                            className="resize-none"
                            placeholder="Alamat lengkap"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Informasi Pekerjaan */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">work</span>
                  <h4 className="text-base font-semibold text-foreground">Informasi Pekerjaan</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          ID Karyawan <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          {...field}
                          disabled
                          className="font-mono bg-muted/50"
                          placeholder="ID Karyawan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Department
                        </FormLabel>
                        {departments.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            <span className="material-symbols-outlined text-3xl text-muted-foreground">
                              domain
                            </span>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Belum ada departemen
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Tambah departemen terlebih dahulu
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/add-department")}
                              className="gap-2">
                              <span className="material-symbols-outlined text-base">add</span>
                              Tambah Departemen
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Departemen" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.name}>
                                      {d.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() => navigate("/add-department")}
                              title="Tambah Departemen Baru">
                              <span className="material-symbols-outlined text-base">add</span>
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Jabatan
                        </FormLabel>
                        {positions.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            <span className="material-symbols-outlined text-3xl text-muted-foreground">
                              badge
                            </span>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Belum ada jabatan
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Tambah jabatan terlebih dahulu
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/add-position")}
                              className="gap-2">
                              <span className="material-symbols-outlined text-base">add</span>
                              Tambah Jabatan
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Combobox
                                options={(positions || []).map((p) => ({
                                  value: String(p.id),
                                  label: p.name
                                }))}
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Pilih Jabatan"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() => navigate("/add-position")}
                              title="Tambah Jabatan Baru">
                              <span className="material-symbols-outlined text-base">add</span>
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="store"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Penempatan Toko / Cabang
                        </FormLabel>
                        {locations.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            <span className="material-symbols-outlined text-3xl text-muted-foreground">
                              store
                            </span>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Belum ada cabang
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Tambah cabang terlebih dahulu
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/add-location")}
                              className="gap-2">
                              <span className="material-symbols-outlined text-base">add</span>
                              Tambah Cabang
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Combobox
                                options={(locations || []).map((loc) => ({
                                  value: String(loc.id || loc._id),
                                  label: loc.name
                                }))}
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Pilih Cabang"
                                searchPlaceholder="Cari cabang..."
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() => navigate("/add-location")}
                              title="Tambah Cabang Baru">
                              <span className="material-symbols-outlined text-base">add</span>
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tipe Kerja
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Kontrak</SelectItem>
                            <SelectItem value="internship">Magang</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Shift
                        </FormLabel>
                        <Combobox
                          options={(shifts || []).map((s) => ({
                            value: String(s.id),
                            label: s.shiftName || s.name
                          }))}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder={selectedStore ? "Pilih Shift" : "Pilih cabang dulu"}
                          disabled={!selectedStore}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tanggal Mulai Kerja
                        </FormLabel>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {["contract", "internship"].includes(employmentType) && (
                    <>
                      <FormField
                        control={form.control}
                        name="contractDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {employmentType === "internship" ? "Durasi Magang" : "Durasi Kontrak"}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Durasi" />
                              </SelectTrigger>
                              <SelectContent>
                                {contractDurations.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tanggal Berakhir
                            </FormLabel>
                            <div className="flex h-10 w-full items-center rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground">
                              {field.value
                                ? format(new Date(field.value), "dd MMM yyyy")
                                : contractDuration && startDate
                                  ? "Pilih durasi kontrak terlebih dahulu"
                                  : "Pilih tanggal mulai & durasi"}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <div className="flex flex-col gap-1.5 justify-end">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg mt-auto transition-all ${
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
                                Status {field.value ? "Aktif" : "Nonaktif"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {field.value
                                  ? "Karyawan ini aktif dan dapat ditugaskan"
                                  : "Karyawan ini tidak aktif"}
                              </p>
                            </div>
                          </div>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Penggajian */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <h4 className="text-base font-semibold text-foreground">Penggajian</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="monthlySalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Gaji Bulanan
                        </FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            Rp
                          </span>
                          <Input
                            type="text"
                            className="pl-10"
                            placeholder="0"
                            value={field.value ? Number(field.value).toLocaleString("id-ID") : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              field.onChange(raw ? parseInt(raw) : "");
                            }}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Gaji Harian
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        Rp
                      </span>
                      <Input
                        value={dailySalary ? dailySalary.toLocaleString("id-ID") : ""}
                        readOnly
                        className="pl-10 bg-muted/50 text-muted-foreground"
                        placeholder="Otomatis terhitung"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Berdasarkan {daysInMonth} hari (1 - {daysInMonth}) bulan ini
                    </p>
                  </FormItem>
                </div>
              </div>

              {/* Section 3: Akun & Hak Akses */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <h4 className="text-base font-semibold text-foreground">Akun &amp; Hak Akses</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Username <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input {...field} placeholder="Username unik untuk login" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Password
                        </FormLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            placeholder="Kosongkan jika tidak diubah"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
                            <span className="material-symbols-outlined text-base">
                              {showPassword ? "visibility" : "visibility_off"}
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kosongkan jika tidak ingin mengubah password.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Pilih Peran (Role)
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Default: User" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Super Admin</SelectItem>
                            <SelectItem value="2">Admin</SelectItem>
                            <SelectItem value="3">User</SelectItem>
                            <SelectItem value="4">Kasir</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accessMenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Permission Tambahan
                        </FormLabel>
                        <Input {...field} placeholder="Opsional: export_laporan, dsb." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 5: Dokumen */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <h4 className="text-base font-semibold text-foreground">Dokumen Karyawan</h4>
                </div>

                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  onChange={handleDocumentSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div
                    onClick={() => documentInputRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center py-8 bg-muted/30 cursor-pointer group">
                    <CloudUpload
                      size={40}
                      className="text-muted-foreground group-hover:text-primary transition-colors mb-2"
                    />
                    <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      Klik untuk upload dokumen
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, XLS, JPG, PNG — multiple file
                    </p>
                  </div>

                  {existingDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dokumen Tersimpan
                      </p>
                      {existingDocuments.map((doc, index) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                            {getFileIcon(doc.mimeType || doc.fileType, doc.fileName || doc.name)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {doc.fileName || doc.name}
                              </p>
                            </div>
                            <Download
                              size={16}
                              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                            />
                          </a>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(index)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dokumen Baru
                      </p>
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                          {getFileIcon(doc.file?.type, doc.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {doc.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument(doc)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Lihat file">
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <div className="bg-primary/10 text-primary-foreground p-6 rounded-xl shadow-sm border border-primary/20 overflow-hidden relative">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-3xl text-primary mb-3">
                    badge
                  </span>
                  <h3 className="text-base font-semibold text-primary mb-2">Panduan Pengisian</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pastikan data yang dimasukkan sesuai dengan dokumen resmi karyawan.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>
                        Field dengan tanda <span className="text-destructive">*</span> wajib diisi.
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>Kosongkan password jika tidak ingin mengubahnya.</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>Role default adalah User jika tidak dipilih.</span>
                    </li>
                  </ul>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <span className="material-symbols-outlined text-[200px] text-primary">
                    admin_panel_settings
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-12">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setCancelModal(true)}>
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
                  <span className="material-symbols-outlined text-lg">save</span>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Karyawan Berhasil Diperbarui"
        description="Data karyawan telah berhasil diperbarui."
        onConfirm={() => navigate("/employee-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/employee-list")}
      />
    </div>
  );
};

export default EditEmployee;

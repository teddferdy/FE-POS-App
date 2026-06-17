import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CloudUpload,
  X,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMonths, format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { addEmployee, generateEmployeeId } from "@/services/employee";
import { getShiftDropdown } from "@/services/shift";
import { getAllLocation } from "@/services/location";
import { getAllPosition } from "@/services/position";
import { getAllDepartment } from "@/services/department";
import { getAllRole, getRoleById } from "@/services/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import AccessMenuModal from "@/components/organism/AccessMenuModal";
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
import UserGuide from "@/components/organism/UserGuide";
import { motion } from "framer-motion";


const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [accessMenuModalOpen, setAccessMenuModalOpen] = useState(false);
  const { t } = useTranslation();

  const formSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(2, t("page.employee.form.fullNameMin")),
      userName: z.string().min(1, t("page.employee.form.userNameRequired")),
      email: z.string().email(t("page.employee.form.emailInvalid")),
      password: z.string().min(6, t("page.employee.form.passwordMin")),
      phoneNumber: z
        .string()
        .regex(/^\d+$/, t("page.employee.form.phoneOnlyNumbers"))
        .min(8, t("page.employee.form.phoneMinDigits"))
        .max(14, t("page.employee.form.phoneMaxDigits")),
      placeOfBirth: z.string().min(2, t("page.employee.form.placeOfBirthMin")),
      address: z.string().min(5, t("page.employee.form.addressMin")),
      gender: z.string().min(1, t("page.employee.form.genderRequired")),
      dateOfBirth: z.string().min(1, t("page.employee.form.dateOfBirthRequired")),
      employeeId: z.string().min(1, t("page.employee.form.employeeIdRequired")),
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
      monthlySalary: z.coerce
        .number()
        .min(0, t("page.employee.form.salaryNegative"))
        .optional()
        .or(z.literal(""))
    });
  }, [t]);

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

  const employmentType = form.watch("employmentType");
  const startDate = form.watch("startDate");
  const contractDuration = form.watch("contractDuration");

  const contractDurations = [
    { value: "3", label: t("page.employee.form.contractDuration.3months") },
    { value: "6", label: t("page.employee.form.contractDuration.6months") },
    { value: "9", label: t("page.employee.form.contractDuration.9months") },
    { value: "12", label: t("page.employee.form.contractDuration.12months") },
    { value: "24", label: t("page.employee.form.contractDuration.2years") },
    { value: "36", label: t("page.employee.form.contractDuration.3years") },
    { value: "48", label: t("page.employee.form.contractDuration.4years") },
    { value: "60", label: t("page.employee.form.contractDuration.5years") }
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

  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await generateEmployeeId();
        const empId = res?.data?.employeeId || res?.employeeId || "";
        form.setValue("employeeId", String(empId));
      } catch {
        // silently fail
      }
    };
    fetchId();
  }, []);

  const { data: locationsData } = useQuery(["allLocations"], getAllLocation);
  const locations = locationsData?.data || locationsData?.locations || [];

  const { data: positionsData } = useQuery(["positions-all"], () => getAllPosition(), {
    staleTime: 5 * 60 * 1000
  });
  const positions = positionsData?.data || positionsData?.positions || [];

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  const { data: rolesData } = useQuery(["roles"], getAllRole, {
    staleTime: 5 * 60 * 1000
  });
  const roles = rolesData?.data || rolesData?.roles || [];

  const selectedRoleIdForAccess = form.watch("roleId") && accessMenuModalOpen ? form.watch("roleId") : null;

  const { data: selectedRoleData } = useQuery(
    ["role-detail", selectedRoleIdForAccess],
    () => getRoleById(selectedRoleIdForAccess),
    {
      enabled: !!selectedRoleIdForAccess,
      staleTime: 5 * 60 * 1000
    }
  );
  const selectedRoleAccessMenu = selectedRoleData?.data?.accessMenu || selectedRoleData?.accessMenu || {};

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

  const createMutation = useMutation(addEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.employee.add.toast.error"), { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

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
    setPreviewImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handlePreviewDocument = (doc) => {
    if (doc.previewUrl) {
      window.open(doc.previewUrl, "_blank");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit = (values, saveAsDraft = false) => {
    if (documents.length === 0) {
      toast.error(t("page.employee.add.toast.error"), { description: t("page.employee.add.toast.documentRequired") });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    const payload = {
      ...values,
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    };
    if (imageFile) {
      payload.image = imageFile;
    }
    if (documents.length > 0) {
      payload.documents = documents.map((d) => d.file);
    }
    if (values.monthlySalary) {
      payload.monthlySalary = Number(values.monthlySalary);
      payload.dailySalary = dailySalary;
    }
    if (!payload.employeeId) {
      delete payload.employeeId;
    }
    if (!payload.roleId) {
      delete payload.roleId;
    }
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
    <motion.div variants={container} initial="hidden" animate="show">
    <motion.div variants={item}>
      <PageHeader
        breadcrumbs={[
          { i18nKey: "sidebar.karyawan" },
          { i18nKey: "page.employee.list.title", href: "/employee-list" },
          { i18nKey: "page.employee.add.title" }
        ]}
        title={t("page.employee.add.title")}
        description={t("page.employee.add.description")}>
        <UserGuide guideKey="add-employee" />
      </PageHeader>
    </motion.div>
    </motion.div>
    <motion.div variants={container} initial="hidden" animate="show">
    <motion.div variants={item}>

      <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Section 1: Informasi Pribadi */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <h4 className="text-base font-semibold text-foreground">{t("page.employee.add.personalInfo")}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col items-center gap-3">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Foto <span className="text-destructive">*</span>
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
                            <span className="text-xs font-semibold text-center">{t("page.employee.add.uploadPhoto")}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        JPG, PNG. Maks 2MB.
                      </p>
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
                              <Input
                                {...field}
                                placeholder={t("page.employee.form.fullNamePlaceholder")}
                              />
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
                              <Input
                                {...field}
                                type="email"
                                placeholder={t("page.employee.form.emailPlaceholder")}
                              />
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
                                placeholder={t("page.employee.form.phonePlaceholder")}
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
                                  <SelectItem value="Laki-laki">{t("page.employee.add.male")}</SelectItem>
                                  <SelectItem value="Perempuan">{t("page.employee.add.female")}</SelectItem>
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
                              <Input {...field} placeholder={t("page.employee.add.placeOfBirthPlaceholder")} />
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
                              placeholder={t("page.employee.add.addressPlaceholder")}
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
                    <h4 className="text-base font-semibold text-foreground">{t("page.employee.add.jobInfo")}</h4>
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
                            placeholder={t("page.employee.add.loading")}
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
                                    <SelectValue placeholder={t("page.employee.add.departmentPlaceholder")} />
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
                                title={t("page.employee.add.addDepartment")}>
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
                                  placeholder={t("page.employee.add.positionPlaceholder")}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => navigate("/add-position")}
                                title={t("page.employee.add.addPosition")}>
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
                                  placeholder={t("page.employee.add.storePlaceholder")}
                                  searchPlaceholder="Cari cabang..."
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => navigate("/add-location")}
                                title={t("page.employee.add.addStore")}>
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
                              <SelectValue placeholder={t("page.employee.add.employmentTypePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">{t("page.employee.add.fullTime")}</SelectItem>
                              <SelectItem value="part-time">{t("page.employee.add.partTime")}</SelectItem>
                              <SelectItem value="contract">{t("page.employee.add.contract")}</SelectItem>
                              <SelectItem value="internship">{t("page.employee.add.internship")}</SelectItem>
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
        {t("page.employee.form.shift")}
      </FormLabel>
      <Combobox
        options={(shifts || []).map((s) => ({
          value: String(s.id),
          label: s.shiftName || s.name
        }))}
        value={field.value || ""}
        onChange={field.onChange}
        placeholder={
          selectedStore
            ? t("page.employee.form.shiftPlaceholder")
            : t("page.employee.form.shiftSelectStoreFirst")
        }
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
                                {employmentType === "internship"
                                  ? "Durasi Magang"
                                  : "Durasi Kontrak"}
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("page.employee.add.durationPlaceholder")} />
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

                {/* Section 3: Penggajian */}
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
                          placeholder={t("page.employee.add.autoCalculated")}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Berdasarkan {daysInMonth} hari (1 - {daysInMonth}) bulan ini
                      </p>
                    </FormItem>
                  </div>
                </div>

                {/* Section 4: Akun & Hak Akses */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    <h4 className="text-base font-semibold text-foreground">
                      Akun &amp; Hak Akses
                    </h4>
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
                            <Input {...field} placeholder={t("page.employee.add.usernamePlaceholder")} />
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
                            Password <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pr-10"
                              placeholder="••••••••"
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
        {t("page.employee.form.roleSelect")}
      </FormLabel>
      <Select onValueChange={field.onChange} value={String(field.value || "")}>
        <SelectTrigger>
          <SelectValue placeholder={t("page.employee.form.rolePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id || role._id} value={String(role.id || role._id)}>
              {role.name || role.role}
            </SelectItem>
          ))}
        </SelectContent>
        <FormMessage />
      </Select>
    </FormItem>
  )}
/>
                    <FormField
                      control={form.control}
                      name="accessMenu"
                      render={({ field }) => {
                        let permCount = 0;
                        try {
                          const parsed = field.value ? JSON.parse(field.value) : [];
                          if (Array.isArray(parsed)) permCount = parsed.length;
                        } catch { permCount = 0; }
                        const selectedRoleId = form.watch("roleId");
                        const disableAccess = !selectedRoleId;
                        return (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.employee.form.accessMenu")}
                            </FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={disableAccess}
                              onClick={() => setAccessMenuModalOpen(true)}
                            >
                              {disableAccess
                                ? t("page.employee.add.selectRoleFirst")
                                : permCount > 0
                                  ? t("page.employee.form.accessMenuCount", { count: permCount })
                                  : t("page.employee.form.accessMenuButton")}
                            </Button>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <AccessMenuModal
                  open={accessMenuModalOpen}
                  onOpenChange={setAccessMenuModalOpen}
                  value={form.watch("accessMenu")}
                  roleAccessMenu={selectedRoleAccessMenu}
                  onSave={(json) => form.setValue("accessMenu", json)}
                />

                {/* Section 5: Dokumen */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h4 className="text-base font-semibold text-foreground">{t("page.employee.add.documents")}</h4>
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
                        {t("page.employee.add.clickToUpload")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("page.employee.add.documentTypes")}
                      </p>
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                            {getFileIcon(doc.file?.type, doc.name)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePreviewDocument(doc)}
                              className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title={t("page.employee.add.viewFile")}>
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
                    <h3 className="text-base font-semibold text-primary mb-2">{t("page.employee.add.guidance")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pastikan data yang dimasukkan sesuai dengan dokumen resmi karyawan.
                    </p>
<ul className="space-y-3">
                       <li className="flex items-center gap-3 text-sm text-foreground">
                         <span className="material-symbols-outlined text-primary text-base">
                           check_circle
                         </span>
                         <span>{t("page.employee.edit.guidanceRequired")}</span>
                       </li>
                       <li className="flex items-center gap-3 text-sm text-foreground">
                         <span className="material-symbols-outlined text-primary text-base">
                           check_circle
                         </span>
                         <span>{t("page.employee.add.guidanceOptional")}</span>
                       </li>
                       <li className="flex items-center gap-3 text-sm text-foreground">
                         <span className="material-symbols-outlined text-primary text-base">
                           check_circle
                         </span>
                         <span>{t("page.employee.edit.guidanceRole")}</span>
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setCancelModal(true)}>
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Batal
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
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto gap-2">
                      <span className="material-symbols-outlined text-lg">save</span>
                      Simpan Karyawan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

    </motion.div>
    </motion.div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.employee.add.successTitle")}
        onConfirm={() => navigate("/employee-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.employee.add.cancelTitle")}
        confirmText={t("page.employee.add.cancelConfirm")}
        onConfirm={() => navigate("/employee-list")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.employee.add.draftTitle")}
        description={t("page.employee.add.draftDescription")}
        confirmText={t("page.employee.add.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default AddEmployee;

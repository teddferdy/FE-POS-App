/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { addInvoiceSocialMedia } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";

const AddSocialMedia = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.store;

  const [platformName, setPlatformName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const addMutation = useMutation(addInvoiceSocialMedia, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!platformName.trim()) {
      toast.error("Failed", { description: "Platform name is required" });
      return;
    }
    if (!url.trim()) {
      toast.error("Failed", { description: "URL is required" });
      return;
    }
    setIsSubmitting(true);
    addMutation.mutate({
      store,
      platformName: platformName.trim(),
      url: url.trim(),
      icon: icon.trim(),
      isActive
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Social Media Invoice", href: "/social-media-invoice-list" },
          { label: "Add Social Media" }
        ]}
        title="Add Social Media"
        description="Add a new social media link for invoices.">
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to List
        </Button>
      </PageHeader>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-card rounded-xl border border-border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Store
                </label>
                <Input value={store || ""} disabled className="bg-muted/50" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Platform Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="e.g. Instagram, Facebook, Twitter"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  URL <span className="text-destructive">*</span>
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://instagram.com/yourstore"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Icon
                </label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. instagram, facebook, twitter (Material Symbol name)"
                />
                {icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Preview:</span>
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Active
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${isActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Saving..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Social Media Added"
        onConfirm={() => navigate("/social-media-invoice-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Discard Changes?"
        confirmText="Yes, Discard"
        onConfirm={() => navigate("/social-media-invoice-list")}
      />
    </div>
  );
};

export default AddSocialMedia;

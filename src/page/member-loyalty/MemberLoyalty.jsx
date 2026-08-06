import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Award, Gift, Plus, Edit, Trash, RefreshCw, Eye } from "lucide-react";
import {
  getAllMemberTier,
  addMemberTier,
  editMemberTier,
  deleteMemberTier,
  updateAllMemberTiers
} from "@/services/member-tier";
import { getAllMember, addMemberPoints } from "@/services/member";
import { getAllLocation } from "@/services/location";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AbortController from "@/components/organism/abort-controller";
import TableActionLegend from "@/components/ui/TableActionLegend";

const MemberLoyalty = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [store, setStore] = useState("");
  const [activeTab, setActiveTab] = useState("tiers");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState("");

  const { data: locData } = useQuery(["locations-loyalty"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const locations = locData?.data || [];
  const storeId = store || cookie?.activeStore;

  const {
    data: tiersData,
    isLoading: tiersLoading,
    isError: tiersError,
    refetch: refetchTiers
  } = useQuery(["member-tiers", storeId], () => getAllMemberTier({ store: storeId }), {
    enabled: !!storeId
  });
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
    refetch: refetchMembers
  } = useQuery(
    ["members-loyalty", storeId, search],
    () => getAllMember({ store: storeId, nameMember: search, page: 1, limit: 20 }),
    { enabled: !!storeId }
  );
  const members = membersData?.data || [];

  const deleteTierMutation = useMutation({
    mutationFn: deleteMemberTier,
    onSuccess: () => {
      toast.success("Tier berhasil dihapus");
      queryClient.invalidateQueries(["member-tiers"]);
    },
    onError: (err) => toast.error(err?.message || "Gagal menghapus tier")
  });

  const updateTiersMutation = useMutation({
    mutationFn: updateAllMemberTiers,
    onSuccess: (data) => {
      toast.success(`Berhasil update ${data.data.updated} member tier`);
      queryClient.invalidateQueries(["member-tiers"]);
      queryClient.invalidateQueries(["members-loyalty"]);
    },
    onError: (err) => toast.error(err?.message || "Gagal update tier member")
  });

  const redeemMutation = useMutation({
    mutationFn: ({ phoneNumber, points }) =>
      addMemberPoints(phoneNumber, { points: -Math.abs(points) }),
    onSuccess: () => {
      toast.success("Poin berhasil diredeem");
      queryClient.invalidateQueries(["members-loyalty"]);
      queryClient.invalidateQueries(["member-detail-loyalty"]);
      setRedeemPoints("");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || err?.message || "Gagal meredeem poin")
  });

  const handleRedeemPoints = (memberId) => {
    const points = Number(redeemPoints);
    if (!points || points <= 0) {
      toast.error("Jumlah poin harus lebih dari 0");
      return;
    }
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    if (points > (member.totalPoints || 0)) {
      toast.error("Poin tidak cukup");
      return;
    }
    redeemMutation.mutate({ phoneNumber: member.phoneNumber, points });
  };

  const getTierBadge = (tier) => {
    if (!tier) return <Badge variant="secondary">No Tier</Badge>;
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    return <Badge className={colors[tier.status] || colors.active}>{tier.name}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("page.memberLoyalty.title")}</h1>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => updateTiersMutation.mutate()}
            disabled={updateTiersMutation.isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${updateTiersMutation.isLoading ? "animate-spin" : ""}`}
            />
            Update All Tiers
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tiers">{t("page.memberLoyalty.tabs.tiers")}</TabsTrigger>
          <TabsTrigger value="members">{t("page.memberLoyalty.tabs.members")}</TabsTrigger>
          <TabsTrigger value="redeem">{t("page.memberLoyalty.tabs.redeem")}</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          {tiersError ? (
            <AbortController refetch={refetchTiers} />
          ) : tiersLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Member Tiers</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member Tier</DialogTitle>
                    </DialogHeader>
                    <AddTierForm
                      onSuccess={() => queryClient.invalidateQueries(["member-tiers"])}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tiers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Tidak ada tier</p>
                ) : (
                  <div className="space-y-4">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: tier.color || "#00000020" }}>
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tier.minPoints} - {tier.maxPoints ?? "∞"} poin |{" "}
                              {tier.discountPercent}% diskon
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tier.memberCount || 0} member
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tier.status === "active" ? "default" : "secondary"}>
                            {tier.status}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Tier</DialogTitle>
                              </DialogHeader>
                              <EditTierForm
                                tier={tier}
                                onSuccess={() => queryClient.invalidateQueries(["member-tiers"])}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTierMutation.mutate({ id: tier.id })}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members">
          {membersError ? (
            <AbortController refetch={refetchMembers} />
          ) : membersLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Members</CardTitle>
                  <Input
                    placeholder="Cari member..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Tidak ada member</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Poin</TableHead>
                          <TableHead>Total Belanja</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.phoneNumber}</TableCell>
                            <TableCell>{getTierBadge(member.tierData)}</TableCell>
                            <TableCell>{formatNumber(member.totalPoints || 0)}</TableCell>
                            <TableCell>{formatCurrency(member.totalSpent || 0)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/member/detail/${member.id}`)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="redeem">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="redeem-member">Member</Label>
                    <Select onValueChange={(val) => setSelectedMember(Number(val))}>
                      <SelectTrigger id="redeem-member">
                        <SelectValue placeholder="Pilih member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name} ({m.totalPoints || 0} poin)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="redeem-points">Poin yang Diredeem</Label>
                    <Input
                      id="redeem-points"
                      type="number"
                      min={1}
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                      placeholder="Jumlah poin"
                    />
                  </div>
                  <Button onClick={() => selectedMember && handleRedeemPoints(selectedMember)}>
                    <Gift className="w-4 h-4 mr-2" />
                    Redeem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TableActionLegend
        className="mt-4"
        items={[
          { icon: Eye, label: t("common.view") },
          { icon: Edit, label: t("common.edit") },
          { icon: Trash, label: t("common.delete") }
        ]}
      />
    </div>
  );
};

const AddTierForm = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [minPoints, setMinPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [color, setColor] = useState("#000000");
  const [status, setStatus] = useState("active");
  const addTier = useMutation({
    mutationFn: (payload) => addMemberTier(payload),
    onSuccess: () => {
      toast.success("Tier berhasil ditambahkan");
      onSuccess();
    },
    onError: (err) => toast.error(err?.message || "Gagal menambahkan tier")
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    addTier.mutate({ name, minPoints, maxPoints, discountPercent, color, status });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nama Tier</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Points</Label>
          <Input
            type="number"
            value={minPoints}
            onChange={(e) => setMinPoints(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Max Points</Label>
          <Input
            type="number"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Discount %</Label>
          <Input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Color</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={addTier.isLoading}>
        {addTier.isLoading ? "Saving..." : "Add Tier"}
      </Button>
    </form>
  );
};

const EditTierForm = ({ tier, onSuccess }) => {
  const [name, setName] = useState(tier.name || "");
  const [minPoints, setMinPoints] = useState(tier.minPoints || 0);
  const [maxPoints, setMaxPoints] = useState(tier.maxPoints ?? 0);
  const [discountPercent, setDiscountPercent] = useState(tier.discountPercent || 0);
  const [color, setColor] = useState(tier.color || "#000000");
  const [status, setStatus] = useState(tier.status || "active");
  const editTier = useMutation({
    mutationFn: (payload) => editMemberTier({ id: tier.id, ...payload }),
    onSuccess: () => {
      toast.success("Tier berhasil diperbarui");
      onSuccess();
    },
    onError: (err) => toast.error(err?.message || "Gagal memperbarui tier")
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    editTier.mutate({ name, minPoints, maxPoints, discountPercent, color, status });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nama Tier</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Points</Label>
          <Input
            type="number"
            value={minPoints}
            onChange={(e) => setMinPoints(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Max Points</Label>
          <Input
            type="number"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Discount %</Label>
          <Input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Color</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={editTier.isLoading}>
        {editTier.isLoading ? "Saving..." : "Update Tier"}
      </Button>
    </form>
  );
};

AddTierForm.propTypes = {
  onSuccess: PropTypes.func
};

EditTierForm.propTypes = {
  tier: PropTypes.object,
  onSuccess: PropTypes.func
};

export default MemberLoyalty;

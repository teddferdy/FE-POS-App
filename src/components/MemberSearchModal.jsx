import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import { getAllMember } from "@/services/member";
import { useCookies } from "react-cookie";

export default function MemberSearchModal({ open, onClose, onSelect }) {
  const [cookie] = useCookies();
  const [memberNumber, setMemberNumber] = useState("");
  const [memberName, setMemberName] = useState("");
  const [searchParams, setSearchParams] = useState(null);
  const store = cookie?.activeStore || cookie?.user?.store || "";

  const { data, isLoading, isError, refetch } = useQuery(
    ["member-search", searchParams],
    () => getAllMember({ ...searchParams, store, page: 1, limit: 10 }),
    { enabled: !!searchParams }
  );

  const handleSearch = () => {
    if (!memberNumber.trim() && !memberName.trim()) return;
    setSearchParams({
      phoneNumber: memberNumber.trim(),
      nameMember: memberName.trim()
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") onClose();
  };

  const members = data?.data || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border/50">
          <DialogTitle>Cari Member</DialogTitle>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Member</label>
              <Input
                placeholder="Nomor HP / Member"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <Input
                placeholder="Nama member"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Search size={16} className="mr-2" />
              )}
              Search
            </Button>
          </div>

          {!searchParams && !isLoading && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Silakan cari member.
            </div>
          )}
          {isLoading && (
            <div className="text-center py-4 text-sm text-muted-foreground">Mencari member...</div>
          )}
          {isError && (
            <div className="text-center py-4 text-sm text-destructive">
              Gagal mencari member.{" "}
              <button onClick={() => refetch()} className="underline">
                Coba Lagi
              </button>
            </div>
          )}
          {searchParams && !isLoading && !isError && members.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Member tidak ditemukan.
            </div>
          )}
          {members.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Member</th>
                    <th className="px-3 py-2 text-left font-medium">Nama</th>
                    <th className="px-3 py-2 text-right font-medium">Poin</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => {
                        onSelect(m);
                        onClose();
                      }}
                      className="hover:bg-accent cursor-pointer border-t border-border/50"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onSelect(m);
                          onClose();
                        }
                      }}>
                      <td className="px-3 py-2 font-mono text-xs">
                        {m.phoneNumber || m.phone || "-"}
                      </td>
                      <td className="px-3 py-2">{m.name || m.nameMember || "-"}</td>
                      <td className="px-3 py-2 text-right">
                        {Number(m.point || m.totalPoints || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                          {m.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

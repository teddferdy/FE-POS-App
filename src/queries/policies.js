// ponytail: kebijakan freshness per jenis data. Default app (src/index.jsx)
// tetap refetchOnMount "always" untuk list operasional; data referensi
// memakai REFERENCE supaya tidak di-fetch ulang tiap komponen mount.
//
// REFERENCE — jarang berubah (toko, kategori, pajak, metode bayar): cache
// 5 menit, refetch saat mount hanya bila stale. Perubahan dari app sendiri
// tetap langsung terlihat karena mutasinya meng-invalidate qk.*.all().
export const REFERENCE = {
  staleTime: 5 * 60 * 1000,
  refetchOnMount: true
};

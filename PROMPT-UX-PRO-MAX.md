# Prompt untuk Claude — Improve UI/UX Frontend dengan Skill UI/UX Pro Max

Salin dan tempel blok di bawah ini ke Claude (yang punya akses skill `ui-ux-pro-max`) di dalam repo ini.

---

## A. Audit UI/UX Seluruh Aplikasi (semua halaman)

```
Gunakan skill `ui-ux-pro-max`.

Aku punya aplikasi **POS web "Bisa Nota"** (Point of Sale untuk restaurant/kafe):
- Stack: React 18 + Vite + shadcn/ui (Radix) + Tailwind CSS 3 + Zustand + React Query + Recharts + i18next (EN/ID/JP) + Vazir/socket для real-time.
- Rute: 64+ modul (cashier, dashboard, product, inventory, sales-return, member-loyalty, report, accounting, dsb). Lihat `src/page/`.

Tugas: **Audit UI/UX komprehensif seluruh aplikasi** dan beri daftar perbaikan yang diprioritaskan.

Langkah:
1. Jalankan `--design-system` untuk menentukan arah visual yang koheren (POS/cashier, data-dense dashboard).
2. Buat design system persistence via `--design-system --persist -p "Bisa Nota" --output-dir .` bila belum ada.
3. Review pakai checklist Quick Reference §1–§10 terutama:
   - §1 Accessibility (contrast 4.5:1, focus states, alt text, aria)
   - §2 Touch & Interaction (min 44px, loading feedback, cursor-pointer)
   - §5 Layout & Responsive (mobile-first, breakpoint, no horizontal scroll)
   - §6 Typography & Color (semantic tokens, base 16px)
   - §8 Forms & Feedback (label, error placement, empty states, loading)
   - §10 Charts & Data (Recharts: legend, tooltip, empty state)
4. Untuk tiap temuan: beri `file:line`, masalah, dan perbaikan konkrit (kode).
5. Prioritaskan: CRITICAL → HIGH → MEDIUM.

Tidak perlu mengubah kode dulu — cukup laporan audit yang jelas dan actionable.
```

---

## B. Fokus Satu Halaman (contoh: Cashier / Dashboard / Form)

```
Gunakan skill `ui-ux-pro-max`.

Halaman: [CASHIER | DASHBOARD | PRODUCT LIST | FORM PEMESANAN] di `src/page/<nama>/`.

Stack: React 18 + Vite + shadcn (Radix) + Tailwind 3 + Zustand + React Query + Recharts.

Baca `design-system/Bisa-Nota/MASTER.md` (dan `pages/<nama>.md` jika ada).
Jika file page override ada, utamakan aturannya; selain itu gunakan MASTER.

Tugas:
1. Review halaman ini terhadap Quick Reference §1–§10 (fokus pada masalah yang relevan dengan halaman ini).
2. Identifikasi: touch-target <44px, contrast rendah, loading/empty state yang kurang, layout yang rusak di 375px, aksesibilitas form, chart tanpa legend/tooltip, dsb.
3. Berikan perbaikan konkret dengan kode yang mengikuti konvensi repo (lucide-react untuk SVG icon, shadcn components di `src/components/ui/`, token warna Tailwind yang sudah ada).
4. Jangan pakai emoji sebagai icon.
5. Verifikasi dengan `npm run lint` setelah perubahan.

Sekaligus jalankan juga pencarian mendetail:
- `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "pos cashier touch target" --domain ux`
- `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "loading empty state table" --domain ux`
- `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "data dense dashboard" --stack react`
```

---

## C. Konsistensi Design System & Tokens

```
Gunakan skill `ui-ux-pro-max`.

Tujuan: menstandarkan design tokens dan konsistensi visual di seluruh aplikasi POS "Bisa Nota".

Stack: React 18 + Vite + shadcn (Radix) + Tailwind 3.

Langkah:
1. Jalankan `--design-system --persist -p "Bisa Nota" --output-dir .` untuk membuat MASTER.md (jika belum ada), pastikan vektor warna/font/effect sesuai.
2. Audit `tailwind.config.js`, `src/index.css`, dan file style agar semua pakai semantic color tokens, bukan raw hex di dalam component.
3. Audit penggunaan icon: pastikan semua pakai lucide-react (bukan emoji), stroke konsisten, ukuran pakai token (icon-sm/md/lg).
4. Audit spacing: gunakan skala 4/8px konsisten; pastikan tiap layar cuma 1 primary CTA.
5. Standarkan durasi/easing animasi via token global; hormati `prefers-reduced-motion`.
6. Beri laporan file:line + kode perbaikan.
```

---

## D. Mobile-First & Responsive

```
Gunakan skill `ui-ux-pro-max`.

Tujuan: buat halaman POS "Bisa Nota" responsif mobile-first (375px → 1440px), tanpa horizontal scroll.

Fokus: [CashierPage | Dashboard | Table/Pelanggan].

Stack: React 18 + Vite + shadcn (Radix) + Tailwind 3.

Langkah:
1. Review pakai Quick Reference §5 (mobile-first, breakpoint-consistency 375/768/1024/1440, readable-font-size ≥16px, line-length, container-width, horizontal-scroll against).
2. Uji tiap komponen di 375px dan landscape.
3. Perbaiki layout yang memaksa `overflow-x`, fixed px width, atau konten terpotong.
4. Untuk navigasi: sesuai §9, layar ≥1024px pakai sidebar, layar kecil pakai bottom-nav/top.
5. Runtime visual stability: hindari layout shift (reserve space, aspect-ratio).
6. Beri kode perbaikan + tes manual di 375px/768px/1024px/1440px.
```

---

## E. Aksesibilitas (WCAG AA)

```
Gunakan skill `ui-ux-pro-max`.

Tujuan: tingkatkan aksesibilitas halaman [X] di POS "Bisa Nota" ke level WCAG 2.2 AA.

Stack: React 18 + Vite + shadcn (Radix) + Tailwind 3.

Langkah:
1. Review pakai Quick Reference §1 Accessibility + §8 Forms (focus rings, contrast 4.5:1, aria-label untuk icon-only button, alt text, keyboard-nav order sama visual, error placement + aria-describedby, skip-links, heading hierarchy).
2. Periksa label input/jangan placeholder-only, required indicators, error summary + focus ke field pertama saat submit gagal.
3. Cek focus-not-obscured (sticky UI/overlay tidak menutupi kontrol yang kena fokus).
4. Pastikan toasts pakai aria-live="polite" dan tidak mencuri focus.
5. Untuk chart: pastikan legend, tooltip keyboard-reachable, text summary/screen-reader.
6. Beri kode perbaikan bernilai-nilai, hindari regresi visual.
```

---

### Catatan Penggunaan
- Jalankan audit menyeluruh (A) dulu sebelum fokus satu halaman (B–E).
- Gunakan mode fokus (B) bila ingin hasil cepat & tidak menyentuh banyak file.
- Design system (MASTER.md) hanya dibuat sekali via `--persist`; halaman baru cukup pakai mode B.
- Selalu minta verifikasi `npm run lint` (dan `npm test` bila ada) setelah perubahan kode.

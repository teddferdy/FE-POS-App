export const resolveKaryawan = (karyawan, employees) => {
  const map = {};
  (employees || []).forEach((e) => {
    const key = String(e.id || e._id);
    if (!map[key]) map[key] = e;
  });

  const rows = [];
  const seen = new Set();
  (karyawan || []).forEach((k) => {
    const rawId = typeof k === "object" && k !== null ? k?.id || k?._id : k;
    if (rawId === undefined || rawId === null || String(rawId) === "undefined") return;
    const key = String(rawId);
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ key, id: rawId, emp: map[key] || null });
  });
  return rows;
};

export const splitKaryawanByStore = (memberRows, shiftStore) => {
  if (shiftStore === undefined || shiftStore === null || shiftStore === "") {
    return { matching: memberRows, mismatch: [] };
  }
  const matching = [];
  const mismatch = [];
  memberRows.forEach((row) => {
    const empStore = row.emp?.store;
    if (row.emp && empStore !== undefined && empStore !== null) {
      if (String(empStore) === String(shiftStore)) matching.push(row);
      else mismatch.push(row);
    } else {
      mismatch.push(row);
    }
  });
  return { matching, mismatch };
};

export const groupKaryawanByStore = (memberRows) => {
  const order = [];
  const byKey = {};
  memberRows.forEach((row) => {
    const emp = row.emp;
    const key = emp ? String(emp.store ?? "no-store") : "__missing__";
    if (!byKey[key]) {
      byKey[key] = { key, label: null, members: [] };
      order.push(byKey[key]);
    }
    byKey[key].members.push(row);
  });

  return order.map((g) => {
    const first = g.members[0]?.emp;
    let label = "";
    let storeId = null;
    let iconType = "store";
    if (g.key === "__missing__") {
      label = "Tidak ditemukan";
      iconType = "missing";
    } else if (g.key === "no-store") {
      label = "Tanpa Toko";
    } else {
      label = first?.storeData?.name || `Toko #${first.store}`;
      storeId = first?.store;
    }
    return { ...g, label, storeId, iconType };
  });
};

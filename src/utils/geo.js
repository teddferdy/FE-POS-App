export const MAX_ACCURACY_M = 150;
export const FAS_INACCURATE_ACCURACY_M = 50;
const ORIGIN_EPSILON = 1 / 1000000;

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const SAMPLES = 3;
const SAMPLE_GAP_MS = 900;
const MAX_JUMP_M = 3000;
const STALE_MS = 10000;

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);

const validationError = (sample) => {
  const { latitude, longitude, accuracy, timestamp } = sample;
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return "badcoords";
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (Math.abs(latitude) < ORIGIN_EPSILON && Math.abs(longitude) < ORIGIN_EPSILON)
  )
    return "origin";
  if (!isFiniteNumber(accuracy) || accuracy <= 0) return "accuracy-zero";
  if (accuracy > MAX_ACCURACY_M) return "accuracy";
  if (Date.now() - timestamp > STALE_MS) return "stale";
  return null;
};

const pickBestSample = (samples) =>
  samples.reduce((best, s) => (s.accuracy < best.accuracy ? s : best), samples[0]);

function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }),
      (err) => {
        if (err && err.code === 1) {
          const e = new Error("Izin lokasi ditolak");
          e.code = "denied";
          reject(e);
        } else if (err && err.code === 2) {
          const e = new Error("Posisi tidak ditemukan");
          e.code = "unavailable";
          reject(e);
        } else {
          const e = new Error("Waktu mendapatkan lokasi habis");
          e.code = "timeout";
          reject(e);
        }
      },
      options
    );
  });
}

export const getTrustedLocation = async ({ timeout = 8000 } = {}) => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    const e = new Error("Perangkat/browser tidak mendukung GPS");
    e.code = "unavailable";
    throw e;
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout
  };

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const perm = await navigator.permissions.query({ name: "geolocation" });
      if (perm.state === "denied") {
        const e = new Error("Izin lokasi ditolak");
        e.code = "denied";
        throw e;
      }
    }
  } catch {
    // perms API tidak selalu tersedia / boleh gagal, lanjutkan
  }

  const samples = [];
  for (let i = 0; i < SAMPLES; i += 1) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, SAMPLE_GAP_MS));
    }
    const pos = await getPosition(options);

    const err = validationError(pos);
    if (err) {
      const e = new Error(`Lokasi tidak dapat dipercaya (${err})`);
      e.code = "unreliable";
      e.reason = err;
      throw e;
    }

    if (samples.length > 0) {
      const prev = samples[samples.length - 1];
      const dist = haversineDistance(prev.latitude, prev.longitude, pos.latitude, pos.longitude);
      if (dist > MAX_JUMP_M) {
        const e = new Error("Lokasi tidak dapat dipercaya (pergerakan tidak wajar)");
        e.code = "unreliable";
        e.reason = "jump";
        throw e;
      }
    }

    samples.push(pos);
  }

  const best = pickBestSample(samples);
  return {
    latitude: best.latitude,
    longitude: best.longitude,
    accuracy: best.accuracy,
    timestamp: best.timestamp,
    samples: samples.length,
    verified: true
  };
};

export const getAccuracyLevel = (accuracy) => {
  if (!isFiniteNumber(accuracy) || accuracy <= 0) return "poor";
  if (accuracy <= 25) return "good";
  if (accuracy <= FAS_INACCURATE_ACCURACY_M) return "ok";
  return "poor";
};

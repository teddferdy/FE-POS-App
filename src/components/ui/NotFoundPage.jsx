import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-7xl font-bold text-muted-foreground/30">404</p>
      <p className="text-lg font-semibold text-muted-foreground">Halaman tidak ditemukan</p>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft size={16} /> Kembali
      </button>
    </div>
  );
};

export default NotFoundPage;

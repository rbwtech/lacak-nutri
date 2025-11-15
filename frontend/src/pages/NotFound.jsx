import { Link } from "react-router-dom";
import { MainLayout } from "../components/layouts";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-h2 font-bold text-text-primary mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-base text-text-secondary mb-8 max-w-md">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
          <Link to="/">
            <Button size="lg">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;

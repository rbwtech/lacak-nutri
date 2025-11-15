import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">LN</span>
              </div>
              <span className="text-h4 font-bold text-text-primary">
                LacakNutri
              </span>
            </div>
            <p className="text-label text-text-secondary">
              Platform analisis nutrisi dan validasi BPOM untuk hidup lebih
              sehat.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3">Fitur</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Cari Produk
                </Link>
              </li>
              <li>
                <Link
                  to="/scanner"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Scanner
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Artikel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3">Informasi</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Tentang
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Privasi
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-label text-text-secondary hover:text-primary"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-label text-text-secondary">
            © 2025 LacakNutri. Built for UINIC 7.0 Web Development Competition.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

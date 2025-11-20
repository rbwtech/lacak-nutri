import { MainLayout } from "../components/layouts";
import Card from "../components/ui/Card";

// --- About Page ---
export const About = () => (
  <MainLayout>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Tentang LacakNutri
        </h1>
        <p className="text-lg text-text-secondary">
          Solusi cerdas untuk memantau asupan nutrisi dan keamanan pangan Anda.
        </p>
      </div>
      <Card className="mb-8">
        <div className="prose prose-lg max-w-none text-text-primary">
          <p>
            LacakNutri adalah platform inovatif yang dikembangkan untuk membantu
            masyarakat Indonesia memahami apa yang mereka konsumsi. Dengan
            teknologi OCR dan integrasi data BPOM, kami memberikan transparansi
            informasi nutrisi yang akurat.
          </p>
          <h3>Misi Kami</h3>
          <ul>
            <li>Meningkatkan kesadaran gizi masyarakat.</li>
            <li>
              Menyediakan akses mudah ke informasi keamanan produk pangan.
            </li>
            <li>Mendukung gaya hidup sehat melalui teknologi.</li>
          </ul>
        </div>
      </Card>
    </div>
  </MainLayout>
);

// --- FAQ Page ---
export const FAQ = () => (
  <MainLayout>
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
        Pertanyaan Umum
      </h1>
      <div className="space-y-4">
        {[
          {
            q: "Bagaimana cara kerja scanner?",
            a: "Scanner kami menggunakan teknologi OCR untuk membaca teks pada kemasan dan mencocokkannya dengan database nutrisi kami.",
          },
          {
            q: "Apakah data BPOM akurat?",
            a: "Ya, kami terhubung langsung dengan data publik registrasi BPOM untuk memverifikasi legalitas produk.",
          },
          {
            q: "Apakah aplikasi ini gratis?",
            a: "LacakNutri dapat digunakan secara gratis dengan fitur dasar yang lengkap.",
          },
        ].map((item, idx) => (
          <Card
            key={idx}
            padding={true}
            className="hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-lg text-text-primary mb-2">
              {item.q}
            </h3>
            <p className="text-text-secondary">{item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  </MainLayout>
);

// --- Contact Page ---
export const Contact = () => (
  <MainLayout>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
        Hubungi Kami
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Info Kontak">
          <div className="space-y-4 text-text-secondary">
            <p>
              <strong>Email:</strong> support@lacaknutri.com
            </p>
            <p>
              <strong>Telepon:</strong> +62 812-3456-7890
            </p>
            <p>
              <strong>Alamat:</strong> UIN Sunan Kalijaga, Yogyakarta
            </p>
          </div>
        </Card>
        <Card title="Kirim Pesan">
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nama"
              className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <textarea
              rows="4"
              placeholder="Pesan Anda"
              className="w-full p-3 rounded-xl border border-border bg-bg-base focus:ring-2 focus:ring-primary/20 outline-none"
            ></textarea>
            <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-hover transition-colors">
              Kirim
            </button>
          </form>
        </Card>
      </div>
    </div>
  </MainLayout>
);

// --- Privacy Policy ---
export const Privacy = () => (
  <MainLayout>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">
        Kebijakan Privasi
      </h1>
      <Card>
        <div className="prose max-w-none text-text-secondary">
          <p>Terakhir diperbarui: November 2025</p>
          <p>
            Kami di LacakNutri menghargai privasi Anda. Kebijakan ini
            menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi
            informasi pribadi Anda.
          </p>
          <h4>1. Informasi yang Kami Kumpulkan</h4>
          <p>
            Kami mengumpulkan informasi yang Anda berikan saat mendaftar,
            seperti nama, email, dan data fisik untuk perhitungan BMI.
          </p>
          <h4>2. Penggunaan Informasi</h4>
          <p>
            Data digunakan untuk memberikan rekomendasi nutrisi yang personal
            dan meningkatkan layanan kami.
          </p>
        </div>
      </Card>
    </div>
  </MainLayout>
);

// --- Terms ---
export const Terms = () => (
  <MainLayout>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">
        Syarat & Ketentuan
      </h1>
      <Card>
        <div className="prose max-w-none text-text-secondary">
          <p>
            Dengan menggunakan LacakNutri, Anda menyetujui syarat dan ketentuan
            berikut:
          </p>
          <ul>
            <li>
              Anda bertanggung jawab atas keakuratan data yang Anda masukkan.
            </li>
            <li>
              Informasi kesehatan yang disediakan hanya untuk tujuan edukasi,
              bukan pengganti saran medis profesional.
            </li>
            <li>Dilarang menyalahgunakan layanan untuk tujuan ilegal.</li>
          </ul>
        </div>
      </Card>
    </div>
  </MainLayout>
);

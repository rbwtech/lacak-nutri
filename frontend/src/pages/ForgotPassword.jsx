import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary">
            Lupa Password?
          </h1>
          <p className="text-text-secondary mt-2">
            Masukkan email Anda untuk mereset kata sandi
          </p>
        </div>

        <div className="bg-bg-surface rounded-3xl border border-border p-8 shadow-soft">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Kirim Link Reset
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Cek Email Anda
              </h3>
              <p className="text-text-secondary mb-6">
                Kami telah mengirimkan instruksi reset password ke{" "}
                <strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSubmitted(false)}
              >
                Kirim Ulang
              </Button>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-text-secondary text-sm">
          Kembali ke{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Halaman Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

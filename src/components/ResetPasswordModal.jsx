import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authApi } from "../api/auth";

const RESEND_SECONDS = 60;

// Raqamni +998XXXXXXXXX ko'rinishida formatlash
function formatPhone(raw) {
  const digits = String(raw).replace(/\D/g, "");
  const local = digits.startsWith("998") ? digits.slice(3) : digits;
  return `+998${local}`;
}

// Login ustida ochiladigan parolni tiklash modali.
// Bosqichlar: 1) telefon -> send-otp, 2) otp -> verify-otp, 3) yangi parol -> change-password
export default function ResetPasswordModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: "4px" } };

  // Step 2'da qayta yuborish sanog'i
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const reset = () => {
    setStep(1);
    setPhone("");
    setOtp("");
    setPassword("");
    setPassword2("");
    setShowPassword(false);
    setLoading(false);
    setErrorMsg("");
    setCountdown(0);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const sendOtp = async () => {
    await authApi.sendOtp({ phone: phone.trim() });
    setCountdown(RESEND_SECONDS);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!phone.trim()) {
      setErrorMsg("Telefon raqamini kiriting");
      return;
    }
    setLoading(true);
    try {
      await sendOtp();
      setStep(2);
    } catch (err) {
      setErrorMsg(err?.message || "OTP yuborib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setErrorMsg("");
    setLoading(true);
    try {
      await sendOtp();
    } catch (err) {
      setErrorMsg(err?.message || "Kodni qayta yuborib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!otp.trim()) {
      setErrorMsg("Kodni kiriting");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp({ phone: phone.trim(), otp: otp.trim() });
      setStep(3);
    } catch (err) {
      setErrorMsg(err?.message || "Kod noto'g'ri yoki muddati tugagan");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 4) {
      setErrorMsg("Parol kamida 4 ta belgidan iborat bo'lsin");
      return;
    }
    if (password !== password2) {
      setErrorMsg("Parollar mos kelmadi");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ phone: phone.trim(), password });
      reset();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.message || "Parolni o'zgartirib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === 2
      ? "SMS kodni tasdiqlash"
      : step === 3
        ? "Yangi parol o'rnatish"
        : "Parolni tiklash";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogContent sx={{ p: 4, position: "relative" }}>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: "absolute", top: 12, right: 12, color: "gray" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <h2 className="text-[#1a2b5e] font-bold text-xl mb-2">{title}</h2>

        {/* ── Step 1: telefon ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 -mt-1 leading-snug">
              Tizimda ro'yxatdan o'tgan telefon raqamingizni kiriting. Biz sizga
              tasdiqlash kodini yuboramiz.
            </p>
            <TextField
              fullWidth
              label="Telefon raqami"
              placeholder="Masalan: 975661099"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              size="small"
              variant="outlined"
              autoFocus
              sx={inputSx}
            />
            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: "4px" }}>
                {errorMsg}
              </Alert>
            )}
            <SubmitButton loading={loading} label="Kodni yuborish" />
          </form>
        )}

        {/* ── Step 2: SMS kod ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="-mt-1">
              <p className="text-sm text-gray-600">
                Tasdiqlash kodi quyidagi raqamga yuborildi:{" "}
                <span className="font-medium text-gray-800">
                  {formatPhone(phone)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setOtp("");
                  setCountdown(0);
                  setStep(1);
                }}
                className="text-sm text-[#1a2b5e] hover:underline cursor-pointer"
              >
                O'zgartirish
              </button>
            </div>

            <TextField
              fullWidth
              placeholder="SMS Kod"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              size="small"
              variant="outlined"
              autoFocus
              sx={inputSx}
            />

            <p className="text-sm text-gray-600">
              {countdown > 0 ? (
                <>
                  Kodni qayta yuborish:{" "}
                  <span className="font-semibold">{countdown} soniya</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[#1a2b5e] hover:underline cursor-pointer disabled:opacity-50"
                >
                  Kodni qayta yuborish
                </button>
              )}
            </p>

            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: "4px" }}>
                {errorMsg}
              </Alert>
            )}

            <div className="flex justify-end items-center gap-2 mt-1">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                sx={{
                  color: "#555",
                  textTransform: "none",
                  fontSize: "15px",
                }}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#1a2b5e",
                  "&:hover": { backgroundColor: "#14225a" },
                  borderRadius: "4px",
                  textTransform: "none",
                  fontSize: "15px",
                  px: 2.5,
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Kodni tasdiqlash"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 3: yangi parol ── */}
        {step === 3 && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 -mt-1">
              Hisobingiz uchun yangi xavfsiz parol kiriting.
            </p>
            <TextField
              fullWidth
              placeholder="Yangi parol"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              variant="outlined"
              autoFocus
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
            <TextField
              fullWidth
              placeholder="Parolni tasdiqlash"
              type={showPassword ? "text" : "password"}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              size="small"
              variant="outlined"
              sx={inputSx}
            />
            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: "4px" }}>
                {errorMsg}
              </Alert>
            )}
            <div className="flex justify-end items-center gap-2 mt-1">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                sx={{ color: "#555", textTransform: "none", fontSize: "15px" }}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#1a2b5e",
                  "&:hover": { backgroundColor: "#14225a" },
                  borderRadius: "4px",
                  textTransform: "none",
                  fontSize: "15px",
                  px: 2.5,
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Parolni yangilash"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      disabled={loading}
      sx={{
        backgroundColor: "#1a2b5e",
        "&:hover": { backgroundColor: "#14225a" },
        borderRadius: "4px",
        textTransform: "none",
        fontSize: "15px",
        py: 1.1,
      }}
    >
      {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : label}
    </Button>
  );
}

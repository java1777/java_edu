import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import studyImg from "../assets/study.svg";
import logoImg from "../assets/logo-md.png";
import { authApi } from "../api/auth";
import ResetPasswordModal from "../components/ResetPasswordModal";
import {
  saveToken,
  saveRole,
  extractRole,
  getRole,
  getHomePathForRole,
} from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetDoneOpen, setResetDoneOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await authApi.login({ phone, password });
      const token =
        data?.token ??
        data?.access_token ??
        data?.accessToken ??
        data?.data?.token ??
        data?.data?.access_token;
      if (token) saveToken(token);

      // Ismni login javobidan olamiz (maydon olib tashlandi)
      const userName =
        data?.user?.name ??
        data?.user?.full_name ??
        data?.user?.firstName ??
        data?.name ??
        data?.full_name ??
        data?.data?.user?.name ??
        null;
      if (userName) localStorage.setItem("user_name", String(userName));

      // role'ni avval response body'dan, bo'lmasa JWT token ichidan aniqlaymiz
      const role = extractRole(data) ?? getRole();
      saveRole(role);

      // Diagnostika: role aniqlanmasa backend javobini ko'rish uchun
      if (!role) {
        let jwtPayload = null;
        try {
          jwtPayload = token ? JSON.parse(atob(token.split(".")[1])) : null;
        } catch {
          jwtPayload = "(token JWT emas)";
        }
        console.warn(
          "[Login] Role aniqlanmadi — admin paneliga yo'naltirilmoqda.",
          { loginResponse: data, jwtPayload },
        );
      }

      setSuccessOpen(true);
      navigate(getHomePathForRole(role));
    } catch (err) {
      setErrorMsg(err?.message || "Telefon yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left side - illustration */}
      <div className="hidden md:flex w-1/2 bg-[#1a2b5e] items-center justify-center">
        <img
          src={studyImg}
          alt="Study illustration"
          className="w-4/5 max-w-lg"
        />
      </div>

      {/* Right side - form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center bg-white px-8 relative">
        {/* University logo and name */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-[10px] text-center text-gray-500 uppercase tracking-wide leading-tight mb-3">
            MUHAMMAD AL-XORAZMIY NOMIDAGI
            <br />
            TOSHKENT AXBOROT TEXNOLOGIYALARI
            <br />
            UNIVERSITETI
          </p>
          <img
            src={logoImg}
            alt="University logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-[#1a2b5e] font-bold text-lg tracking-widest mb-8 uppercase">
          Learning Management System
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-5"
        >
          <div>
            <label className="block text-sm text-gray-700 mb-1">Telefon</label>
            <TextField
              fullWidth
              placeholder="998XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              size="small"
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Parol</label>
            <TextField
              fullWidth
              placeholder="Parolni kiriting"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              variant="outlined"
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="text-xs text-[#1a2b5e] hover:underline cursor-pointer"
              >
                Parolni unutdingizmi?
              </button>
            </div>
          </div>

          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: "4px" }}>
              {errorMsg}
            </Alert>
          )}

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
              fontSize: "16px",
              py: 1.2,
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Kirish"
            )}
          </Button>
        </form>

        {/* Copyright */}
        <p className="absolute bottom-6 text-xs text-gray-400">
          Copyright © 2021 of Tashkent University of Information Technologies
        </p>
      </div>

      <Snackbar
        open={successOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Muvaffaqiyatli kirildi! Yo'naltirilmoqda...
        </Alert>
      </Snackbar>

      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onSuccess={() => setResetDoneOpen(true)}
      />

      <Snackbar
        open={resetDoneOpen}
        autoHideDuration={4000}
        onClose={() => setResetDoneOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Parol o'zgartirildi! Endi yangi parol bilan kiring.
        </Alert>
      </Snackbar>
    </div>
  );
}

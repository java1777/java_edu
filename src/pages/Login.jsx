import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import studyImg from "../assets/study.svg";
import logoImg from "../assets/logo-md.png";

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlertOpen(true);
    setTimeout(() => {
      setAlertOpen(false);
      navigate("/dashboard");
    }, 2000);
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
            <label className="block text-sm text-gray-700 mb-1">Login</label>
            <TextField
              fullWidth
              placeholder="Loginni kiriting"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              size="small"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                },
              }}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
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
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                },
              }}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#1a2b5e",
              "&:hover": { backgroundColor: "#14225a" },
              borderRadius: "4px",
              textTransform: "none",
              fontSize: "16px",
              py: 1.2,
            }}
          >
            Kirish
          </Button>
        </form>

        {/* Copyright */}
        <p className="absolute bottom-6 text-xs text-gray-400">
          Copyright © 2021 of Tashkent University of Information Technologies
        </p>
      </div>

      {/* MUI Snackbar Alert */}
      <Snackbar
        open={alertOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Muvaffaqiyatli kirildi! Dashboard ga o'tilmoqda...
        </Alert>
      </Snackbar>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function useAutoLock() {
  const navigate = useNavigate();
  const { lockVault, isUnlocked, token } = useAuthStore();

  useEffect(() => {
    const handleLock = (reason) => {
      console.log("LOCK TRIGGERED:", reason);
      if (token && isUnlocked) {
        lockVault();
        if (window.location.pathname !== '/lock') {
          navigate("/lock");
        }
      }
    };

    // TAB CHANGE
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleLock("TAB CHANGE");
      }
    };

    // WINDOW BLUR
    const handleBlur = () => {
      handleLock("WINDOW BLUR");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [token, isUnlocked, lockVault, navigate]);
}

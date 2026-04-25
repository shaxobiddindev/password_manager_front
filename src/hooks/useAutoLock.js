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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, isUnlocked, lockVault, navigate]);
}

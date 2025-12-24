"use client";

import { useEffect } from "react";
import { onAuthChange } from "@/lib/firebase/auth";
import { getUserData } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserData, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);

      if (user) {
        // 유저 데이터 가져오기
        const userData = await getUserData(user.uid);
        setUserData(userData);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserData, setLoading]);

  return <>{children}</>;
}

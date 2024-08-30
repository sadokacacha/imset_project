"use client";

import { useContext, useState, useEffect, ChangeEvent, FormEvent } from "react";
import AuthContext, { AuthContextType } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Image from "next/image";

interface Credentials {
  email: string;
  password: string;
}

const HomePage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authContext?.user) {
      const userRole = authContext.user.role;
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "teacher") {
        router.push("/teacher/dashboard");
      } else if (userRole === "student") {
        router.push("/student/dashboard");
      }
    }
  }, [authContext?.user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (authContext) {
      try {
        await authContext.login(credentials);
      } catch (error: any) {
        setError(error.response?.data?.detail || "Login failed");
      }
    } else {
      setError("Auth context is not available");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}></div>
      <div className={styles.redelement}></div>

      <div className={styles.formSection}>
        <Image
          src="/images/download.png"
          alt="My Image"
          className={styles.absoluteImage} // Apply absolute positioning
          width={500}  // Original width of the image
          height={300} // Original height of the image
          layout="respansive" // Maintain original width and height
        />

        <h2 className={styles.title}>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.signInButton}>
            Sign in
          </button>
          <button type="button" className={styles.connectButton}>
            Connect With Myu
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;

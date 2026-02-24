import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import { useToast } from "../hooks/useToast.tsx";
import { ApiRequestError } from "../api/client.ts";
import Button from "../components/ui/Button.tsx";
import Input from "../components/ui/Input.tsx";

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      addToast("success", "Вы вошли в систему");
      navigate(redirect ?? "/app/wishlists", { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.code === "UNAUTHORIZED" ? "Неверный email или пароль" : err.message);
      } else {
        setError("Ошибка соединения");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-semibold">Вход</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Пароль"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        <Button type="submit" isLoading={loading}>
          Войти
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Нет аккаунта?{" "}
        <Link
          to={`/auth/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-primary hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
};

export default Login;

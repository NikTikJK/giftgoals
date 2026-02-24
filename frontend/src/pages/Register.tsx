import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import { useToast } from "../hooks/useToast.tsx";
import { ApiRequestError } from "../api/client.ts";
import Button from "../components/ui/Button.tsx";
import Input from "../components/ui/Input.tsx";

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
      addToast("success", "Регистрация прошла успешно");
      navigate(redirect ?? "/app/wishlists", { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(
          err.code === "CONFLICT"
            ? "Пользователь с таким email уже существует"
            : err.message,
        );
      } else {
        setError("Ошибка соединения");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-semibold">Регистрация</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Имя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
        />
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
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        <Button type="submit" isLoading={loading}>
          Зарегистрироваться
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Уже есть аккаунт?{" "}
        <Link
          to={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="text-primary hover:underline"
        >
          Войти
        </Link>
      </p>
    </div>
  );
};

export default Register;

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useToast } from "../hooks/useToast.tsx";
import { api } from "../api/client.ts";
import Button from "../components/ui/Button.tsx";
import Input from "../components/ui/Input.tsx";

interface ProfileData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  hasGoogle: boolean;
}

const Profile = () => {
  const { refresh } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    api.get<{ user: ProfileData }>("/users/profile").then(({ user }) => {
      setProfile(user);
      setDisplayName(user.displayName);
    });
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/profile", { displayName });
      addToast("success", "Профиль обновлён");
      refresh();
    } catch {
      addToast("error", "Не удалось обновить");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.post("/users/change-password", { currentPassword, newPassword });
      addToast("success", "Пароль изменён");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      addToast("error", "Неверный текущий пароль");
    } finally {
      setChangingPw(false);
    }
  };

  if (!profile) {
    return <p className="mt-12 text-center text-neutral-400">Загрузка...</p>;
  }

  return (
    <div className="mx-auto max-w-md text-neutral-100">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-50">Профиль</h1>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
        <Input label="Email" value={profile.email} disabled />
        <Input
          label="Имя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
          required
        />
        <Button type="submit" isLoading={saving}>
          Сохранить
        </Button>
      </form>

      <hr className="my-8 border-neutral-800" />

      <h2 className="mb-4 text-lg font-semibold text-neutral-100">Сменить пароль</h2>
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <Input
          label="Текущий пароль"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="Новый пароль"
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" isLoading={changingPw}>
          Изменить пароль
        </Button>
      </form>
    </div>
  );
};

export default Profile;

import { Link } from "react-router-dom";
import { Gift, Users, Share2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth.tsx";
import Button from "../components/ui/Button.tsx";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-2xl bg-primary-soft p-4">
          <Gift size={48} className="text-primary" />
        </div>
      </div>
      <h1 className="mb-4 text-4xl font-semibold text-neutral-900">GiftGoals</h1>
      <p className="mb-8 text-lg text-neutral-500">
        Создавайте вишлисты, делитесь ими с друзьями и получайте желанные подарки
      </p>

      <div className="mb-12 flex justify-center gap-4">
        {user ? (
          <Link to="/app/wishlists">
            <Button>Мои вишлисты</Button>
          </Link>
        ) : (
          <>
            <Link to="/auth/register">
              <Button>Начать</Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="secondary">Войти</Button>
            </Link>
          </>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-6">
          <Gift size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold">Создавайте вишлисты</h3>
          <p className="text-sm text-neutral-500">
            Добавляйте подарки с ценами, ссылками и картинками
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-6">
          <Share2 size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold">Делитесь ссылкой</h3>
          <p className="text-sm text-neutral-500">
            Друзья увидят список без регистрации
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-6">
          <Users size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold">Скидывайтесь вместе</h3>
          <p className="text-sm text-neutral-500">
            Групповой сбор на дорогие подарки
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

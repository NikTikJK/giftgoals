import { Link } from "react-router-dom";
import { Gift, Users, Share2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth.tsx";
import Button from "../components/ui/Button.tsx";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl py-20 text-center text-neutral-100">
      <div className="mb-8 flex justify-center">
        <div className="rounded-full bg-primary-soft/30 p-4 ring-2 ring-primary/40">
          <Gift size={48} className="text-primary" />
        </div>
      </div>
      <h1 className="mb-4 text-5xl font-semibold tracking-tight text-neutral-50">
        GiftGoals
      </h1>
      <p className="mb-10 text-lg text-neutral-300">
        Создавайте вишлисты, делитесь ими с друзьями и получайте желанные подарки
      </p>

      <div className="mb-14 flex justify-center gap-4">
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
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm shadow-black/20">
          <Gift size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold text-neutral-50">Создавайте вишлисты</h3>
          <p className="text-sm text-neutral-400">
            Добавляйте подарки с ценами, ссылками и картинками
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm shadow-black/20">
          <Share2 size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold text-neutral-50">Делитесь ссылкой</h3>
          <p className="text-sm text-neutral-400">
            Друзья увидят список без регистрации
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm shadow-black/20">
          <Users size={28} className="mx-auto mb-3 text-primary" />
          <h3 className="mb-2 font-semibold text-neutral-50">Скидывайтесь вместе</h3>
          <p className="text-sm text-neutral-400">
            Групповой сбор на дорогие подарки
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

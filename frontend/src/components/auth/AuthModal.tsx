import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../ui/Modal.tsx";
import Button from "../ui/Button.tsx";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(`${path}?redirect=${encodeURIComponent(location.pathname)}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Требуется авторизация">
      <p className="mb-6 text-sm text-neutral-300">
        Чтобы зарезервировать подарок или сделать вклад, необходимо войти или
        зарегистрироваться.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" className="flex-1" onClick={() => handleNavigate("/auth/login")}>
          Войти
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => handleNavigate("/auth/register")}
        >
          Регистрация
        </Button>
      </div>
    </Modal>
  );
};

export default AuthModal;

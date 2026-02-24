import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="mt-24 text-center text-neutral-100">
    <h1 className="text-5xl font-bold text-neutral-300">404</h1>
    <p className="mt-4 text-lg text-neutral-400">Страница не найдена</p>
    <Link to="/" className="mt-4 inline-block font-medium text-primary hover:underline">
      На главную
    </Link>
  </div>
);

export default NotFound;

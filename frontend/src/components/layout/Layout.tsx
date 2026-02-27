import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";

const Layout = () => (
  <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 pb-[env(safe-area-inset-bottom)]">
    <Header />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export default Layout;

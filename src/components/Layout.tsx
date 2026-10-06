import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AmbientAudioDock from "./AmbientAudioDock";

export const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <AmbientAudioDock />
  </div>
);

export default Layout;

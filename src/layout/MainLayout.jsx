import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BoshqarishMenu from "./BoshqarishMenu";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const boshqarishRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      const inMenu = menuRef.current?.contains(e.target);
      const inBtn = boshqarishRef.current?.contains(e.target);
      if (!inMenu && !inBtn) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex h-screen bg-gray-100 overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        boshqarishRef={boshqarishRef}
      />

      {/* Dark backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <BoshqarishMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        menuRef={menuRef}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

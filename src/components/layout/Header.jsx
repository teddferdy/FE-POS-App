/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Moon, Sun, Bell, Search, Menu } from "lucide-react";
import { translationSelect } from "@/state/translation";

const Header = ({ onMenuToggle }) => {
  const [cookie] = useCookies();
  const { translation, updateTranslation } = translationSelect();
  const [showSearch, setShowSearch] = useState(false);

  const user = cookie?.user;
  const userName = user?.userName || user?.name || "Admin";

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const languages = [
    { code: "id", label: "ID" },
    { code: "en", label: "EN" },
    { code: "jpn", label: "JP" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground hidden sm:block">SwiftPOS Admin</h1>
          </div>
          <div className="hidden md:flex items-center bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-48 lg:w-64 text-foreground placeholder:text-muted-foreground/60"
              placeholder="Cari data..."
              type="text"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Search size={18} />
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateTranslation(lang.code)}
                className={`px-2 py-1 text-[10px] font-bold tracking-widest rounded-full transition-all duration-200 ${
                  translation === lang.code
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {lang.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Sun size={18} className="hidden dark:block" />
            <Moon size={18} className="block dark:hidden" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-accent text-foreground text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center bg-muted/50 px-3 py-2 rounded-lg border border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-full text-foreground placeholder:text-muted-foreground/60"
              placeholder="Cari data..."
              type="text"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

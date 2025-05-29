// filepath: /home/big_dragoon/coursera/app/Components/NavBar.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ModeToggle } from "./ThemeSwitch";
import SignIn from "./Sigin";
import { useSession } from "next-auth/react";
import Image from "next/image";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link
          href="/"
          className="font-bold text-xl text-primary hover:text-accent transition-colors"
        >
          Coursera
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Courses
          </Link>
          <Link
            href="/about"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Contact
          </Link>
        </div>

        {/* Right section with theme toggle and auth */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <SignIn />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-foreground hover:text-primary transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:text-primary transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className=" flex-col items-center gap-2.5">
              <div className="flex items-center gap-2.5 mb-2.5">
                {/* {console.log(session.user)} */}
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <p>{session?.user?.name}</p>
              </div>
              <SignIn />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

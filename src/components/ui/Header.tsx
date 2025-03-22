"use client";

import Link from "next/link";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { LogoutIcon } from "./Icons";

type HeaderProps = {
  showNav?: boolean;
  showAuthButtons?: boolean;
};

export function Header({ showNav = false, showAuthButtons = false }: HeaderProps) {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const isLoggedIn = !!cookies.authToken;

  const handleLogout = () => {
    removeCookie("authToken", { path: "/" });
    router.push("/");
  };

  return (
    <header className="border-b border-gray-100 bg-white py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Fair Mind
          </Link>
          
          {showNav && (
            <nav className="ml-8 hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-primary-600">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
        
        {showAuthButtons && (
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                icon={<LogoutIcon size={16} />}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

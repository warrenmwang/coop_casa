import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import coopImg from "@app/assets/coopAlt1.svg";
import Bars3Icon from "@app/components/icons/Bars3Icon";
import DefaultUserProfileIcon from "@app/components/icons/DefaultUserProfileIcon";
import UserProfileIcon from "@app/components/icons/UserProfileIcon";
import XMarkIcon from "@app/components/icons/XMarkIcon";
import {
  useGetUserAccountAuth,
  useGetUserAccountDetails,
  useLogoutUser,
} from "@app/hooks/account";
import { APIUserReceived } from "@app/types/Types";
import {
  accountSettingsPageLink,
  apiAuthGoogleOAuthLink,
  communitiesPageLink,
  dashboardPageLink,
  propertiesPageLink,
  usersPageLink,
} from "@app/urls";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import { apiFile2ClientFile } from "@app/utils/utils";

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const TopNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userQuery = useGetUserAccountDetails();
  const authQuery = useGetUserAccountAuth();

  const mutation = useLogoutUser();
  const handleLogout = () =>
    mutation.mutate(undefined, {
      onError: mutationErrorCallbackCreator("Failed to logout"),
    });

  let authenticated: boolean = false;
  if (authQuery.status === "success") {
    const receivedAuth: boolean = authQuery.data;
    authenticated = receivedAuth;
  }

  // Initialize user profile to default profile icon
  let profileImageElement: JSX.Element = (
    <DefaultUserProfileIcon color="white" />
  );
  // Update user profile icon if logged in
  if (authenticated) {
    if (userQuery.status === "success") {
      const receivedUser: APIUserReceived = userQuery.data;
      const avatarFile: File | null = apiFile2ClientFile(
        receivedUser.avatarImageB64,
      );
      if (avatarFile !== null) {
        profileImageElement = (
          <UserProfileIcon userProfileImage={URL.createObjectURL(avatarFile)} />
        );
      }
    }
  }

  const navigation = [
    ...(authenticated
      ? [{ name: "Dashboard", href: dashboardPageLink, current: false }]
      : []),
    { name: "Communities", href: communitiesPageLink, current: false },
    { name: "Properties", href: propertiesPageLink, current: false },
    { name: "Users", href: usersPageLink, current: false },
  ];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden={true} />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden={true} />
              )}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/">
                <img className="h-8 w-auto" src={coopImg} alt="Coop" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium",
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            <div ref={userMenuRef} className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  {profileImageElement}
                </button>
              </div>

              {/* User menu dropdown with transition styling */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-opacity duration-100 ease-in-out"
                  role="menu"
                  aria-orientation="vertical"
                  tabIndex={-1}
                >
                  {/* authed: account settings */}
                  {authenticated && (
                    <div role="menuitem">
                      <Link
                        to={accountSettingsPageLink}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Account Settings
                      </Link>
                    </div>
                  )}

                  {/* login or logout button*/}
                  {authenticated ? (
                    // render logout if user logged in
                    <div role="menuitem">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    // render login otherwise
                    <div role="menuitem">
                      <a
                        href={apiAuthGoogleOAuthLink}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Log in with Google
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view buttons */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium",
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;

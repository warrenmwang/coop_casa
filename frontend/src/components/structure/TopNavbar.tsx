import React, { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import defaultProfileImg from "../../images/profile.jpg"
import coopImg from "../../images/coopAlt1.svg"
import { AuthData } from '../../auth/AuthWrapper'
import { API_HOST, API_PORT } from '../../config'

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const TopNavbar: React.FC = () => {
  const googleOAuthLink = `${API_HOST}:${API_PORT}/auth/google`;
  const accountSettingsLink = "/account-settings";

  const auth = AuthData()
  const { logout } = auth

  const [ authenticated, setAuthenticated ] = useState<boolean>(false)
  const [ profileImg, setProfileImg ] = useState<string>(defaultProfileImg)

  useEffect(() => {
    const { user, authenticated } = auth
    setAuthenticated(authenticated)
    if (user.avatar !== "") {
      setProfileImg(user.avatar)
    }
  },[])

  const navigation = [
    ...(authenticated ? [ { name: 'Dashboard', href: '/dashboard', current: false}] : []),
    { name: 'Communities', href: '/communities', current: false },
    { name: 'Properties', href: '/properties', current: false},
    { name: 'Map', href: '/map', current: false},
  ]

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link
                    to="/" 
                  >
                    <img
                      className="h-8 w-auto"
                      src={coopImg}
                      alt="Your Company"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={profileImg}
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      { /* authed: account settings */}
                      {authenticated &&
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={accountSettingsLink}
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Account Settings
                            </Link>
                          )}
                        </Menu.Item>}

                      {/* login or logout button*/}
                      {authenticated ? (
                        // render logout if user logged in
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout} 
                              className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      ) : (
                        // render login otherwise
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={googleOAuthLink}
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Log in with Google
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      
                      
                    </Menu.Items>
                  </Transition>
                </Menu> 

              </div>
            </div>
          </div>

          {/* Mobile view buttons */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default TopNavbar;
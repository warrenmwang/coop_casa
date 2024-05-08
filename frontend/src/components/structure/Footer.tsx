import React from "react";
import { Link } from "react-router-dom";

const Footer : React.FC = () => {
  return(
    <footer className="mx-auto bg-gray-800 shadow m-4 dark:bg-gray-800">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-white sm:text-center dark:text-gray-400">© 2024 <Link to="/" className="hover:underline">COOP™</Link>. All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white dark:text-gray-400 sm:mt-0">
            <li>
                <Link to="/about" className="hover:underline me-4 md:me-6">About</Link>
            </li>
            <li>
                <Link to="/privacy-policy" className="hover:underline me-4 md:me-6">Privacy Policy</Link>
            </li>
            <li>
                <Link to="/tos" className="hover:underline me-4 md:me-6">Terms of Service</Link>
            </li>
            <li>
                <Link to="/contact" className="hover:underline">Contact</Link>
            </li>
        </ul>
        </div>
    </footer>
  )
}

export default Footer;
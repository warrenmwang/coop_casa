import React from "react";
import { Link } from "react-router-dom";
import {
  homePageLink,
  aboutPageLink,
  privacypolicyPageLink,
  termsOfServicePageLink,
  attributionsPageLink,
  contactPageLink,
} from "../urls";

const Footer: React.FC = () => {
  return (
    <footer className="mx-auto bg-gray-800 shadow m-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-white sm:text-center dark:text-gray-400">
          © 2024{" "}
          <Link
            to={homePageLink}
            className="hover:underline"
            onClick={() => window.scrollTo(0, 0)}
          >
            Coop™
          </Link>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white dark:text-gray-400 sm:mt-0">
          <li>
            <Link
              to={aboutPageLink}
              className="hover:underline me-4 md:me-6"
              onClick={() => window.scrollTo(0, 0)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to={privacypolicyPageLink}
              className="hover:underline me-4 md:me-6"
              onClick={() => window.scrollTo(0, 0)}
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              to={termsOfServicePageLink}
              className="hover:underline me-4 md:me-6"
              onClick={() => window.scrollTo(0, 0)}
            >
              Terms of Service
            </Link>
          </li>
          <li>
            <Link
              to={attributionsPageLink}
              className="hover:underline me-4 md:me-6"
              onClick={() => window.scrollTo(0, 0)}
            >
              Attributions
            </Link>
          </li>
          <li>
            <Link
              to={contactPageLink}
              className="hover:underline"
              onClick={() => window.scrollTo(0, 0)}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;

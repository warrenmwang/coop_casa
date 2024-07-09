import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";

import "../styles/ContentBody.css";

const TermsOfServicePage: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <div className="content-body px-4 py-8">
        <h2 className="h1_custom">Terms of Service</h2>
        <p className="text-sm text-gray-500 mb-8">Last Updated: 06/02/2024</p>

        <h3 className="h3_custom">Introduction</h3>
        <p className="mb-4">
          Welcome to Coop! These Terms of Service ("Terms") govern your use of
          the Coop platform ("Platform"), operated by Coop™ ("we," "our," or
          "us"). By accessing or using the Platform, you agree to be bound by
          these Terms. If you do not agree to these Terms, please do not use the
          Platform.
        </p>

        <h3 className="h3_custom">Eligibility</h3>
        <p className="mb-4">
          You must be at least 18 years old to use the Platform. By using the
          Platform, you represent and warrant that you meet this age
          requirement.
        </p>

        <h3 className="h3_custom">Account Registration</h3>
        <p className="mb-4">
          To use certain features of the Platform, you must create an account.
          You agree to provide accurate, current, and complete information
          during the registration process and to update such information to keep
          it accurate, current, and complete. You are responsible for
          safeguarding your account information and for any activities or
          actions under your account.
        </p>

        <h3 className="h3_custom">Platform Use</h3>
        <p className="mb-4">
          Coop is a platform where users can interact with other users and view
          property listings for potential co-ownership. The Platform facilitates
          connections between users and realtors/brokers for the purpose of
          forming co-ops and purchasing properties together. All interactions
          and transactions on the Platform must comply with applicable laws and
          regulations.
        </p>

        <h3 className="h3_custom">Disclaimer of Liability</h3>
        <ul className="bullet_pt_list_default">
          <li>
            <strong>Financial Loss:</strong> We hold no responsibility for any
            financial loss incurred by users. This includes, but is not limited
            to, losses resulting from deals falling through or users being
            scammed by other users.
          </li>
          <li>
            <strong>Legal Services:</strong> Any legal services provided through
            the Platform are between the individual parties themselves. We take
            no responsibility for the outcome or quality of these services.
          </li>
        </ul>

        <h3 className="h3_custom">Changes to the Platform</h3>
        <p className="mb-4">
          Currently, the Platform is free to use. However, we reserve the right
          to introduce fees for transactions or subscription services in the
          future. We will notify users of any such changes in advance.
        </p>

        <h3 className="h3_custom">User Conduct</h3>
        <p className="mb-4">
          You agree not to use the Platform for any unlawful purpose or in any
          way that might harm, disrupt, or otherwise negatively impact the
          Platform or its users. This includes, but is not limited to, engaging
          in fraudulent activities, harassing other users, or posting
          inappropriate content.
        </p>

        <h3 className="h3_custom">Termination</h3>
        <p className="mb-4">
          We reserve the right to suspend or terminate your account and access
          to the Platform at our sole discretion, without notice, for conduct
          that we believe violates these Terms or is otherwise harmful to the
          Platform or other users.
        </p>

        <h3 className="h3_custom">Changes to Terms</h3>
        <p className="mb-4">
          We may modify these Terms at any time. We will notify you of any
          changes by posting the new Terms on the Platform. Your continued use
          of the Platform after such changes constitutes your acceptance of the
          new Terms.
        </p>

        <h3 className="h3_custom">Governing Law</h3>
        <p className="mb-4">
          These Terms are governed by and construed in accordance with the laws
          of the state of Pennsylvania, without regard to its conflict of law
          principles.
        </p>

        <h3 className="h3_custom">Contact Us</h3>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at
          maametaddo@gmail.com.
        </p>

        <p className="mb-4">
          By using the Coop platform, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default TermsOfServicePage;

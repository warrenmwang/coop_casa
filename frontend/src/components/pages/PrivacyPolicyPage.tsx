import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import "../../styles/font.css"

const PrivacyPolicyPage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <div className="flex-grow container mx-auto px-4 py-8">
      
        <h1 className="h1_custom">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: 05/24/2024</p>

        <section className="mb-8">
          <h2 className="h2_custom">Introduction</h2>
          <p className="mb-4">
            Welcome to Coop App ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal data is handled responsibly. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App"). By using the App, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">1. Information We Collect</h2>
          <h3 className="h3_custom">Personal Data</h3>
          <p className="mb-4">
            We may collect personally identifiable information that you voluntarily provide to us when you register on the App, make a purchase, or interact with various features of the App. This information may include:
          </p>
          <ul className="bullet_pt_list_default">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Payment information</li>
            <li>Any other personal information you provide</li>
          </ul>

          <h3 className="h3_custom">Usage Data</h3>
          <p className="mb-4">
            We may automatically collect information about your use of the App, including:
          </p>
          <ul className="bullet_pt_list_default">
            <li>Device information (e.g., mobile device ID, model, manufacturer)</li>
            <li>IP address</li>
            <li>Operating system</li>
            <li>Browsing history</li>
            <li>App usage statistics</li>
            <li>Geolocation data (if you grant permission)</li>
          </ul>

          <h3 className="h3_custom">Cookies and Tracking Technologies</h3>
          <p className="mb-4">
            We may use cookies, web beacons, and other tracking technologies to collect and store information about your use of the App. You can manage your cookie preferences through your device settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect for various purposes, including:</p>
          <ul className="bullet_pt_list_default">
            <li>Providing, maintaining, and improving the App</li>
            <li>Processing transactions and sending related information</li>
            <li>Responding to your comments, questions, and requests</li>
            <li>Sending you technical notices, updates, security alerts, and support messages</li>
            <li>Communicating with you about products, services, offers, promotions, and events</li>
            <li>Monitoring and analyzing trends, usage, and activities in connection with the App</li>
            <li>Personalizing and improving the App and providing advertisements, content, or features that match user profiles or interests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">3. Sharing Your Information</h2>
          <h3 className="h3_custom">Third-Party Sharing</h3>
          <p className="mb-4">We may share your information with the following types of third parties:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Service Providers :</strong> We share your information with third-party service providers who perform services on our behalf. These services may include payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
            <li><strong>Business Partners :</strong> We may share your information with our business partners to offer you certain products, services, or promotions that may be of interest to you.</li>
            <li><strong>Affiliates :</strong> We may share your information with our affiliates, in which case we will require them to honor this Privacy Policy. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.</li>
            <li><strong>Advertising Partners :</strong> We may share your information with third-party advertising partners to deliver targeted advertisements and measure the effectiveness of advertising campaigns.</li>
          </ul>
        
          <h3 className="h3_custom">Purpose of Sharing</h3>
          <p className="mb-4">The purposes for sharing your data with third parties include:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Service Provision :</strong> To facilitate the services they provide on our behalf, such as processing transactions and providing customer support.</li>
            <li><strong>Marketing and Advertising :</strong> To send you promotional materials, provide personalized content, and conduct marketing analysis.</li>
            <li><strong>Business Operations :</strong> To support our business operations, improve our services, and develop new features.</li>
            <li><strong>Analytics :</strong> To analyze usage and improve the performance and user experience of our app.</li>
          </ul>

          <h3 className="h3_custom">Legal Obligations</h3>
          <p className="mb-4">We may share your information in the following circumstances to comply with legal obligations:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Compliance with Laws :</strong> We may disclose your information where we are legally required to do so in order to comply with applicable laws, regulations, governmental requests, judicial proceedings, court orders, or legal processes.</li>
            <li><strong>Protection of Rights :</strong> We may disclose your information to protect and defend our rights, property, or safety, or the rights, property, and safety of our users or others.</li>
            <li><strong>Fraud Prevention :</strong> We may share your information to investigate, prevent, or take action regarding illegal activities, suspected fraud, situations involving potential threats to the physical safety of any person, or violations of our terms of use.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">4. Security of Information</h2>
          <h3 className="h3_custom">Security Measures</h3>
          <p className="mb-4">We are committed to protecting your personal data and have implemented the following security measures to ensure its confidentiality, integrity, and availability:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Encryption :</strong> We use encryption protocols, such as SSL/TLS, to protect data transmitted between our app and your device.</li>
            <li><strong>Access Controls :</strong> We implement strict access controls to limit access to your personal data to authorized personnel only. Access is granted based on role and necessity.</li>
            <li><strong>Data Minimization :</strong> We collect only the necessary information needed to provide our services and minimize data retention to reduce risk.</li>
            <li><strong>Firewalls and Intrusion Detection :</strong> We use firewalls and intrusion detection systems to prevent unauthorized access to our servers and systems.</li>
            <li><strong>Regular Security Audits :</strong> We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems.</li>
            <li><strong>Security Awareness Training :</strong> Our staff undergoes regular training on best practices for data protection and security.</li>
            <li><strong>Two-Factor Authentication (2FA) :</strong> We offer two-factor authentication to add an extra layer of security to your account.</li>
          </ul>

          <h3 className="h3_custom">User Responsibilities</h3>
          <p className="mb-4">While we take significant measures to protect your data, the security of your personal information also depends on you. Here are some responsibilities you should be aware of:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Strong Passwords :</strong> Use strong, unique passwords for your accounts and avoid sharing your password with others. Consider using a password manager to keep track of your passwords securely.</li>
            <li><strong>Account Security :</strong> Keep your account information confidential and avoid accessing your account from unsecured devices or networks.</li>
            <li><strong>Suspicious Activity :</strong> Be vigilant and report any suspicious activity or security breaches immediately to our support team.</li>
            <li><strong>Software Updates :</strong> Ensure that you regularly update your device’s operating system and apps to protect against the latest security threats.</li>
            <li><strong>Privacy Settings :</strong> Regularly review and adjust your privacy settings within the app to control the visibility and accessibility of your information.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">5. User Rights and Choices</h2>
          <h3 className="h3_custom">Access and Correction</h3>
          <p className="mb-4">You have the right to access the personal data we hold about you and to request corrections if the data is inaccurate or incomplete. You can do this by contacting us at maametaddo@gmail.com. We will respond to your request within a reasonable timeframe.</p>
          <h3 className="h3_custom">Deletion</h3>
          <p className="mb-4">You have the right to request the deletion of your personal data. If you wish to delete your account or any personal data we hold about you, you can do so by contacting us at maametaddo@gmail.com. Please note that we may retain certain information as required by law or for legitimate business purposes.</p>
          <h3 className="h3_custom">Objection and Restriction</h3>
          <p className="mb-4">You have the right to object to the processing of your personal data and to request that we restrict the processing of your personal data in certain circumstances. For example, you can request a restriction on processing if you believe the data we hold is inaccurate or if you believe our processing is unlawful. To exercise these rights, please contact us at maametaddo@gmail.com.</p>
          <h3 className="h3_custom">Data Portability</h3>
          <p className="mb-4">You have the right to request a copy of your personal data in a structured, commonly used, and machine-readable format. This right allows you to obtain and reuse your personal data for your own purposes across different services. To request data portability, please contact us at maametaddo@gmail.com.</p>
          <h3 className="h3_custom">Opt-Out</h3>
          <p className="mb-4">You have the right to opt out of certain uses of your personal data, such as receiving marketing communications from us. You can opt out by:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Email Communications :</strong> Clicking the "unsubscribe" link in any marketing email you receive from us.</li>
            <li><strong>App Settings :</strong> Adjusting your preferences in the app settings to disable marketing communications.</li>
            <li><strong>Contacting Us :</strong> Emailing us at maametaddo@gmail.com to request that we remove you from our marketing lists.</li>
          </ul>
          <p className="mb-4">By exercising these rights, you can manage and control the personal data we hold about you. For any questions or to exercise your rights, please contact us at maametaddo@gmail.com.</p>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">6. Cookies and Tracking Technologies</h2>
          <h3 className="h3_custom">Use of Cookies</h3>
          <p className="mb-4">We, along with our service providers and business partners, use cookies and similar tracking technologies to collect information automatically as you use the app. Cookies are small text files stored on your device that help us recognize your device and remember your preferences. These technologies enable us to:</p>
          
          <ul className="bullet_pt_list_default">
            <li><strong>Authenticate Users :</strong> Verify your account and log you into the app.</li>
            <li><strong>Personalize Content :</strong> Provide you with content and information that matches your interests and preferences.</li>
            <li><strong>Analyze Usage :</strong> Monitor and analyze trends, usage, and activities in connection with our services to improve functionality and performance.- Deliver Advertising : Deliver targeted advertising and measure the effectiveness of advertising campaigns.</li>
            <li><strong>Security :</strong> Help us detect and prevent fraud and ensure the security of our services.</li>
          </ul>

          <h3 className="h3_custom">User Choices</h3>
          <p className="mb-4">You have several options to manage or disable cookies and similar tracking technologies:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Browser Settings :</strong> Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse cookies, delete cookies, or alert you when cookies are being sent. Please note that if you disable cookies, some parts of our app may not function properly.</li>
            <li><strong>Mobile Device Settings :</strong> Your mobile device may offer settings that enable you to control the collection and use of location data or other information from your mobile device. You can adjust these settings to limit tracking.</li>
            <li><strong>Opt-Out Tools :</strong> We participate in industry-standard opt-out tools that allow you to opt-out of receiving targeted advertisements. You can visit the Network Advertising Initiative’s (NAI) opt-out page or the Digital Advertising Alliance’s (DAA) opt-out page for more information on how to opt out of targeted advertising.</li>
            <li><strong>In-App Controls :</strong> We provide you with the ability to manage your cookie preferences directly within the app. You can adjust your settings to enable or disable certain types of cookies and tracking technologies. </li>
          </ul>
          <p className="mb-4">By using these options, you can manage how cookies and similar technologies are used on your device and control the information we collect through these technologies. For more detailed information on the use of cookies and how to manage your preferences, please contact us at warren.wang2020@gmail.com.</p>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">7. Data Retention</h2>
          <h3 className="h3_custom">Retention Period</h3>
          <p className="mb-4">We retain your personal data for as long as necessary to provide you with our services and to fulfill the purposes described in this Privacy Policy. This generally means that we will keep your personal data for the duration of your account's active status and as long as you use our app. Additionally, we may retain your personal data for a period afterward to comply with our legal obligations, resolve disputes, enforce our agreements, and for legitimate business purposes.</p>
          <h3 className="h3_custom">Deletion Policies</h3>
          <p className="mb-4">When your personal data is no longer needed for the purposes for which it was collected, or if you request its deletion, we will securely delete or anonymize your personal data. Our deletion policies include:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Account Closure :</strong> When you close your account, we will delete or anonymize your personal data within a reasonable timeframe, except where we need to retain certain information for legitimate business purposes or to comply with legal obligations. For example, we may retain certain data to resolve disputes, troubleshoot problems, or comply with audits and legal requirements.</li>
            <li><strong>Inactive Accounts :</strong> If your account becomes inactive (e.g., you do not log in for an extended period), we may delete your personal data after a specified period of inactivity. Before doing so, we will attempt to notify you using the contact information associated with your account.</li>
            <li><strong>Legal Obligations :</strong> We may retain personal data for longer periods if required to do so by law. This includes data retention for regulatory compliance, tax purposes, or legal claims.</li>
            <li><strong>Data Minimization :</strong> We regularly review the personal data we collect and store to ensure that we retain only what is necessary. Data that is no longer needed is securely deleted or anonymized. </li>
          </ul>

          By implementing these policies, we aim to ensure that personal data is retained only for as long as it is needed and is securely deleted when no longer required. If you have any questions about our data retention practices or wish to request the deletion of your personal data, please contact us at maametaddo@gmail.com.
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">8. International Data Transfers</h2>
          <h3 className="h3_custom">Cross-Border Transfers</h3>
          <p className="mb-4">Currently, we do not transfer your personal data across borders to other countries. All data processing activities are conducted within the country where you reside, and we do not share your personal data with international entities.</p>
          <p className="mb-4">If in the future our data processing activities involve cross-border transfers, we will ensure that appropriate safeguards are in place to protect your personal data in accordance with applicable data protection laws. These safeguards may include implementing standard contractual clauses, obtaining your explicit consent, or ensuring that the recipient country provides an adequate level of data protection.</p>
          <p className="mb-4">If you have any questions about our data transfer practices or require further information, please contact us at maametaddo@gmail.com.</p>
        </section>

        <section className="mb-8">
          <h2 className="h2_custom">9. Changes to the Privacy Policy</h2>
          <h3 className="h3_custom">Policy Updates</h3>
          <p className="mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or for other operational, legal, or regulatory reasons. When we make changes to this Privacy Policy, we will update the "Last Updated" date at the top of this document to indicate when the changes were made.</p>
          <h3 className="h3_custom">Notification of Changes</h3>
          <p className="mb-4">We are committed to keeping you informed about how we protect your personal data. For any significant changes to this Privacy Policy, we will provide you with notice in a manner that is reasonably designed to reach you. This may include:</p>
          <ul className="bullet_pt_list_default">
            <li><strong>Email Notification :</strong> Sending an email to the address associated with your account.</li>
            <li><strong>In-App Notification :</strong> Displaying a prominent notice within the app.</li>
            <li><strong>Website Notification :</strong> Posting a notice on our website. We encourage you to review this Privacy Policy periodically to stay informed about our data protection practices. Your continued use of the app after any modifications indicates your acceptance of the updated Privacy Policy.</li>
          </ul>

          <p className="mb-4">If you have any questions or concerns about changes to this Privacy Policy, please contact us at maametaddo@gmail.com.</p>
        </section>

        <section>
        <h2 className="h2_custom">10. Contact Information</h2>
        <p className="mb-4">If you have any questions or concerns about this Privacy Policy, or if you wish to exercise any of your rights, please contact us at:</p>
        <p className="mb-4">Email: maametaddo@gmail.com</p>
        <p className="mb-4">Phone: +1 (570) 535-9709</p>
        </section>

        <p className="mb-4">Thank you for using the Coop App. We are committed to protecting your privacy and ensuring the security of your personal data.</p>

      </div>
      <Footer></Footer>
    </div>
  )
}

export default PrivacyPolicyPage;
import React, { useState } from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";
import Modal from "../structure/Modal";
import { AuthData } from "../../auth/AuthWrapper";
import { accountDelete } from "../../api/api";
import { useNavigate } from "react-router-dom";

const AccountSettingsPage : React.FC = () => {

  const auth = AuthData();
  const { user } = auth;
  const email = user.email;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      // Ping backend
      await accountDelete();
      // Redirect to home after account deletion
      navigate("/");
      // Refresh window
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return(
    <div>
      <TopNavbar></TopNavbar>
        <Title title="Account Settings" description={`Settings for account with email: ${email}`}></Title>

        {/* Show current user details, allowing them to change values here */}

        {/* Save changes button */}

        {/* Danger Zone Warning */}

        {/* Account Deletion Option */}
        {/* Should prompt the user with a popup to confirm that they want to really delete their account, and another button
            to let them confirm or cancel operation.
        */}
        <div className="mt-8 p-4 border-t border-red-500">
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
          <p className="text-red-600">Deleting your account is irreversible. Please be certain.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>

        {/* Account Deletion Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirm Account Deletion"
        >
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="mt-4">
            <button
              onClick={handleDeleteAccount}
              className="mr-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </Modal>

      <Footer></Footer>
    </div>
  )
}

export default AccountSettingsPage;
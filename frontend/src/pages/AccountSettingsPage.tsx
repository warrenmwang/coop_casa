import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import Modal from "../components/Modal";
import AccountSettingsForm from "../form/AccountSettingsForm";
import { useNavigate } from "react-router-dom";
import { homePageLink } from "../urls";
import TextSkeleton from "../skeleton/TextSkeleton";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useDeleteUserAccount, useGetUserAccountAuth } from "../hooks/account";

// Authenticated Endpoint
const AccountSettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const authQuery = useGetUserAccountAuth();

  const mutation = useDeleteUserAccount();
  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error: Error | AxiosError) => {
        let errMsg: string = error.message;
        if (axios.isAxiosError(error)) {
          errMsg = `${(error as AxiosError).response?.data}`;
        }
        toast.error(
          `Something went wrong in deleting the account: ${errMsg}. Try again.`,
        );
      },
    });
  };

  let authenticated: boolean = false;
  if (authQuery.status === "success") {
    authenticated = authQuery.data as boolean;
  }
  const ready: boolean = authQuery.isFetched;

  useEffect(() => {
    if (ready && !authenticated) {
      navigate(homePageLink);
    }
  }, [ready, authenticated]);

  if (!ready) {
    return <TextSkeleton />;
  }

  return (
    <div className="content-body">
      <Title
        title="Account Settings"
        description="All your account information in one place."
      ></Title>

      <div className="justify-center items-center mx-auto">
        <AccountSettingsForm />

        {/* Danger Zone Warning */}

        {/* Account Deletion Option */}
        <div className="mt-8 p-4 border-t border-red-500">
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
          <p className="text-red-600">
            Deleting your account is irreversible. If you have listed any
            properties, they will be removed from public listings as well. If
            you are the admin of any communities, you will not be able to delete
            your account until you transfer those communities to another user.
            Please migrate them to another lister if you wish to keep them
            present on the platform. Please be certain.
          </p>
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
          <p>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="mt-4">
            <button
              onClick={handleDelete}
              className="mr-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {mutation.isIdle && "Confirm"}
              {mutation.isPending && "Deleting..."}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AccountSettingsPage;

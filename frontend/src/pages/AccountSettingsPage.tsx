import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import Modal from "../components/Modal";
import AccountSettingsForm from "../form/AccountSettingsForm";
import { useNavigate } from "react-router-dom";
import { dashboardPageLink, homePageLink } from "../urls";
import TextSkeleton from "../skeleton/TextSkeleton";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import {
  useDeleteUserAccount,
  useGetUserAccountAuth,
  useGetUserAccountDetails,
  useGetUserAccountRole,
  useGetUserOwnedCommunitiesIDs,
  useGetUserOwnedPropertiesIDs,
} from "../hooks/account";

// Authenticated Endpoint
const AccountSettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const authQuery = useGetUserAccountAuth();
  const roleQuery = useGetUserAccountRole();
  const propertiesQuery = useGetUserOwnedPropertiesIDs();
  const communitiesQuery = useGetUserOwnedCommunitiesIDs();

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
    authenticated = authQuery.data;
  }

  let role: string = "";
  if (roleQuery.status === "success") {
    role = roleQuery.data;
  }

  let numProperties = 0;
  let numCommunities = 0;
  if (propertiesQuery.status === "success") {
    numProperties = propertiesQuery.data.length;
  }
  if (communitiesQuery.status === "success") {
    numCommunities = communitiesQuery.data.length;
  }

  const ready: boolean =
    authQuery.isFetched &&
    roleQuery.isFetched &&
    communitiesQuery.isFetched &&
    propertiesQuery.isFetched;

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
          <div className="">
            <p className="text-lg">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>

            {role !== "regular" && (
              <div className="flex gap-2 items-center">
                <p>
                  NOTE: Any properties ({numProperties}) or communities (
                  {numCommunities}) that you have listed will be automatically
                  taken down, unless you transfer the listing ownership or admin
                  owner of them to another verified lister. If you want to
                  transfer them, head over to the dashboard.
                </p>
                <button
                  onClick={() => navigate(dashboardPageLink)}
                  className="button__gray"
                >
                  Dashboard
                </button>
              </div>
            )}
            <button
              onClick={handleDelete}
              className="mt-3 mr-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

import React, { useEffect, useState } from "react";
import Title from "components/Title";
import Modal from "components/Modal";
import UpdateAccountDetailsForm from "components/form/UpdateAccountDetailsForm";
import { useNavigate } from "react-router-dom";
import { dashboardPageLink, homePageLink } from "urls";
import TextSkeleton from "components/skeleton/TextSkeleton";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import {
  useDeleteUserAccount,
  useGetUserAccountAuth,
  useGetUserAccountRole,
  useGetUserOwnedCommunitiesIDs,
  useGetUserOwnedPropertiesIDs,
} from "hooks/account";
import UpdateAccountStatusForm from "components/form/UpdateAccountStatusForm";
import WizardNavigationButtons from "components/buttons/WizardNavigationButtons";

// Authenticated Endpoint
const AccountSettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const sections = ["Details", "Status", "Delete"];
  const [currentSection, setCurrentSection] = useState<string>(sections[0]);

  const authQuery = useGetUserAccountAuth(); // for loading account is logged in
  const roleQuery = useGetUserAccountRole(); // for delete note for listers

  // for delete note for listers
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCurrentSection(e.currentTarget.textContent as string);
  };

  const ready: boolean =
    authQuery.isFetched &&
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

      <WizardNavigationButtons
        sections={sections}
        currentSection={currentSection}
        handleClick={handleClick}
      />

      <div className="justify-center items-center mx-auto">
        {currentSection === "Details" && <UpdateAccountDetailsForm />}
        {currentSection === "Status" && <UpdateAccountStatusForm />}

        {currentSection === "Delete" && (
          <>
            {/* Danger zone notice */}
            <div className="mt-8 p-4 border-t border-red-500">
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-red-600">
                Deleting your account is irreversible. If you have listed any
                properties, they will be removed from public listings as well.
                If you are the admin of any communities, you will not be able to
                delete your account until you transfer those communities to
                another user. Please migrate them to another lister if you wish
                to keep them present on the platform. Please be certain.
              </p>
              <br />

              {/* Communities and properties notice*/}
              <p>
                You current have <b>{numProperties}</b> properties listed and{" "}
                <b>{numCommunities}</b> communities where you are the admin on
                Coop. Any properties or communities that you have listed will be
                automatically taken down. Properties can be transferred to
                another lister. Communities' admin position can be transferred
                to any other user on Coop. If you want to transfer any of these
                now, head over to the
                <button
                  onClick={() => navigate(dashboardPageLink)}
                  className="button__gray"
                >
                  Dashboard
                </button>
                .
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
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>

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
          </>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;

import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import Modal from "../components/Modal";
import AccountSettingsForm from "../form/AccountSettingsForm";
import { apiAccountDelete, apiGetUserAuth, apiGetUserRole } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { homePageLink } from "../urls";
import TextSkeleton from "../skeleton/TextSkeleton";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import "../styles/contentBody.css";

// Authenticated Endpoint
const AccountSettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const authQuery = useQuery({
    queryKey: ["user", "auth"],
    queryFn: apiGetUserAuth,
  });

  const roleQuery = useQuery({
    queryKey: ["user", "role"],
    queryFn: apiGetUserRole,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: apiAccountDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
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

  let userRole: string = "";
  if (roleQuery.status === "success") {
    userRole = roleQuery.data;
  }

  let authenticated: boolean = false;
  if (authQuery.status === "success") {
    authenticated = authQuery.data as boolean;
  }

  const ready: boolean = authQuery.isFetched && roleQuery.isFetched;

  useEffect(() => {
    if (authQuery.isFetched) {
      if (!authenticated) {
        navigate(homePageLink);
      }
    }
  }, [authQuery]);

  return (
    <div className="content-body">
      {ready ? (
        <>
          <Title
            title="Account Settings"
            description={`All your account information in one place. Your account role is "${userRole}"`}
          ></Title>

          <div className="justify-center items-center mx-auto">
            <AccountSettingsForm />

            {/* Danger Zone Warning */}

            {/* Account Deletion Option */}
            <div className="mt-8 p-4 border-t border-red-500">
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-red-600">
                Deleting your account is irreversible. If you have listed any
                properties, they will be removed from public listings as well.
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
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => mutation.mutate()}
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
        </>
      ) : (
        <TextSkeleton />
      )}
    </div>
  );
};

export default AccountSettingsPage;

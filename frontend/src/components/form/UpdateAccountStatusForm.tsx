import SubmitButton from "components/buttons/SubmitButton";
import FetchErrorText from "components/FetchErrorText";
import TextSkeleton from "components/skeleton/TextSkeleton";
import Title from "components/Title";
import { useGetAccountStatus, useUpdateAccountStatus } from "hooks/account";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { mutationErrorCallbackCreator } from "utils/callbacks";

// add account status and conditional text of a comment if the account status was set by an admin
// a popup should show up on the screen the next time an account flagged logs in tho.
// in other cases the user should be able to update their own status if its normal
// for example, they can private their account and their profile should be hidden from other users, that will
// require more modifications to the other endpoints and how users are filtered by the backend handlers, after
// fetching each user's status from the db...
const UpdateAccountStatusForm: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const accountStatusQuery = useGetAccountStatus();

  const updateStatusMutation = useUpdateAccountStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountStatusQuery.data?.userStatus.status === status) return; // no change, do nothing

    setIsSubmitting(true);
    updateStatusMutation.mutate(
      { status },
      {
        onSuccess: () => toast.success("Account status updated."),
        onError: mutationErrorCallbackCreator("Failed to update"),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  useEffect(() => {
    if (accountStatusQuery.status === "success") {
      setStatus(accountStatusQuery.data.userStatus.status);
    }
  }, [accountStatusQuery.status]);

  if (accountStatusQuery.status === "pending") {
    return <TextSkeleton />;
  }

  if (accountStatusQuery.status === "error") {
    return (
      <FetchErrorText>
        Sorry we were unable to fetch your account status at this time.{" "}
      </FetchErrorText>
    );
  }

  return (
    <>
      <Title title="Account status" />

      {accountStatusQuery.data.userStatus.status === "flagged" ? (
        <h1 className="h1_custom">
          Your account has been flagged and forcibly privated by the admin for
          the following reason:{" "}
          <span className="text-red-500">
            {accountStatusQuery.data.userStatus.comment}
          </span>
          . Resolve those issues and the admin will review your account as soon
          as they can to unflag your account. Your account acts as if it were
          privated when flagged.
        </h1>
      ) : (
        <>
          {accountStatusQuery.data.userStatus.comment && (
            <h2 className="label__text_input_gray">
              Status Comment: {accountStatusQuery.data.userStatus.comment}
            </h2>
          )}

          <form onSubmit={handleSubmit}>
            <label className="label__text_input_gray" htmlFor="accountStatus">
              Your Account Status
            </label>
            <select
              id="accountStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input__text_gray_box"
              required
            >
              <option value="normal">
                Public -- Normal default status of all accounts. Your profile is
                visible to anyone.
              </option>
              <option value="private">
                Private -- Hides your account profile to other users.
              </option>
            </select>

            <SubmitButton isSubmitting={isSubmitting} />
          </form>
        </>
      )}
    </>
  );
};

export default UpdateAccountStatusForm;

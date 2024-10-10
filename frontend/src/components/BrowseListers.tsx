import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiListerGetPageOfListersDetails } from "../api/lister";
import { useGetSetOfListers } from "../hooks/lister";
import TextSkeleton from "../skeleton/TextSkeleton";
import SubmitButton from "./buttons/SubmitButton";
import FetchErrorText from "./FetchErrorText";

const BrowseListers: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameFilter(name);
    setSubmitting(true);
  };

  const listersQuery = useGetSetOfListers(9, page, nameFilter);

  useEffect(() => {
    if (submitting) {
      listersQuery.refetch().then(() => {
        setSubmitting(false);
      });
    }
  }, [submitting]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col">
        <h1 className="h1_custom">Find other listers on Coop!</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="lister_name" className="label__text_input_gray">
            Lister Name
          </label>
          <input
            id="lister_name"
            type="text"
            value={name}
            placeholder="E.g. John Smith"
            onChange={(e) => setName(e.target.value)}
            className="input__text_gray_box"
          />
          <SubmitButton isSubmitting={submitting} />
        </form>
        {listersQuery.isFetching && <TextSkeleton />}
        {listersQuery.isSuccess && (
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="table__row">User ID</th>
                <th className="table__row">Email</th>
                <th className="table__row">First Name</th>
                <th className="table__row">Last Name</th>
              </tr>
            </thead>
            <tbody>
              {listersQuery.data &&
                listersQuery.data.map((data) => (
                  <tr className="bg-gray-100">
                    <th className="table__row">{data.userId}</th>
                    <th className="table__row">{data.email}</th>
                    <th className="table__row">{data.firstName}</th>
                    <th className="table__row">{data.lastName}</th>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrowseListers;

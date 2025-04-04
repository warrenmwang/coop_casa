import React, { useEffect, useState } from "react";

import FetchErrorText from "@app/components/FetchErrorText";
import PaginationButtons from "@app/components/PaginationButtons";
import SubmitButton from "@app/components/buttons/SubmitButton";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import { useGetSetOfListers } from "@app/hooks/lister";

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

  const handleNavPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = e.target as HTMLElement;
    const pageToGoTo = Number(element.innerHTML) - 1;
    setPage(pageToGoTo);
  };

  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setPage((prev) => prev + 1);
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
        {listersQuery.isError && (
          <FetchErrorText>
            Sorry, but we couldn&apos;t fetch any listers at this moment.{" "}
          </FetchErrorText>
        )}
        {listersQuery.isSuccess && listersQuery.data && (
          <>
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="table__col">User ID</th>
                  <th className="table__col">Email</th>
                  <th className="table__col">First Name</th>
                  <th className="table__col">Last Name</th>
                </tr>
              </thead>
              <tbody>
                {listersQuery.data.map((data) => (
                  <tr key={data.userId} className="bg-gray-100">
                    <th className="table__col">{data.userId}</th>
                    <th className="table__col">{data.email}</th>
                    <th className="table__col">{data.firstName}</th>
                    <th className="table__col">{data.lastName}</th>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationButtons
              currentPage={page}
              currentPageSize={listersQuery.data.length}
              setSize={9}
              handleNavPage={handleNavPage}
              handleNextPage={handleNextPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseListers;

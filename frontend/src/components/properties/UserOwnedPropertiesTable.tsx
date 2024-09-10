import * as React from "react";
import { useGetUserOwnedPropertiesIDs } from "../../hooks/account";
import TextSkeleton from "../../skeleton/TextSkeleton";
import FetchErrorText from "../FetchErrorText";
import { useGetProperties } from "../../hooks/properties";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "../../utils/property";

const Table: React.FC<{ propertyIDs: string[] }> = ({ propertyIDs }) => {
  if (propertyIDs === null) {
    propertyIDs = [];
  }
  const queries = useGetProperties(propertyIDs);

  return (
    <table>
      <thead>
        <tr>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            PropertyID
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            Address
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {queries.map((query) => {
          if (query.data) {
            const addressString = constructAddressString(query.data.details);

            const costString = costNumsToPresentableString(
              query.data.details.costDollars,
              query.data.details.costCents,
            );

            return (
              <tr key={query.data.details.propertyId}>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.details.propertyId}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {addressString}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {costString}
                </th>
              </tr>
            );
          } else if (query.isFetching) {
            <tr>
              <th>Loading...</th>
            </tr>;
          } else if (query.isError) {
            <tr>
              <th>Error.</th>
            </tr>;
          } else {
            return <tr></tr>;
          }
        })}
      </tbody>
    </table>
  );
};

const UserOwnedPropertiesTable: React.FC = () => {
  const query = useGetUserOwnedPropertiesIDs();

  if (query.isFetching) {
    return <TextSkeleton />;
  }
  if (query.isError) {
    return (
      <FetchErrorText>
        Unable to fetch your communities at the moment.
      </FetchErrorText>
    );
  }

  const propertyIDs = query.data as string[];

  return (
    <>
      <h1 className="h1_custom">Your Properties</h1>
      <h4 className="h4_custom">If you don't see any, try creating one!</h4>
      <Table propertyIDs={propertyIDs} />
    </>
  );
};
export default UserOwnedPropertiesTable;

import React, { useState, useEffect } from "react";
import ManagePropertiesDashboard from "./ManagePropertiesDashboard";
import { User } from "../../types/User";
import { api_admin_users_Link, api_admin_users_roles_Link } from "../../urls";
import { checkFetch } from "../../api/api";
import AdminManageUserRoles from "./AdminManageUserRoles";


const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cache, setCache] = useState<{ [key: number]: User[] }>({});
  const [page, setPage] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<{ [key: string]: string}>({});

  const limit = 10;
  
  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      if (cache[page]) {
        setUsers(cache[page])
      } else {
        let users : User[];
        // fetch users
        try {
          const response =  await fetch(`${api_admin_users_Link}?limit=${limit}&offset=${page * limit}`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
            credentials: "include",
          })
          
          if (!response.ok) {
            throw new Error(`got response not ok: ${response.statusText}`)
          }
          // convert from json string to User[] type
          users = await response.json();

          if (users === null) {
            // list is empty, meaning we've reached the end
            setLastPage(page);
            alert("No more users to show");
            return;
          }
          setUsers(users);
          setCache({ ...cache, [page]: users });

          // construct a list of user ids
          const userIds_for_roles = users.map(user => user.userId);

          // fetch user roles
          const tmp = `${api_admin_users_roles_Link}?userIds=${userIds_for_roles}`
          fetch(tmp, {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
            credentials: "include",
          })
            .then(checkFetch)
            .then(response => response.json())
            .then(data => {
              const roles = data as string[];
              // construct a dictionary of user id to role
              const rolesDict: { [key: string]: string } = {};
              for (let i = 0; i < userIds_for_roles.length; i++) {
                rolesDict[userIds_for_roles[i]] = roles[i];
              }
              setUserRoles(rolesDict);
            })
            .catch((err) => console.error(err));

          } catch(err) {
            console.error(err);
          }
      }
    }
    fetchUsersAndRoles();
  }, [page]);

  const handleNext = () => {
    if (page === lastPage) {
      alert("No more users to show");
      return;
    }
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevious = () => {
    setPage(prevPage => Math.max(prevPage - 1, 0));
  };

  return(
    <>
      <ManagePropertiesDashboard/>

      {/*
        TODO: ability to manager users, properties, and communities
        e.g. update a user's role, delete a user, delete a property, delete a community
      */
      }

      {/* TODO: table that shows all the users */}
      <div className="w-full max-w-lg mx-auto mt-8">
        <h1 className="h1_custom">User Management</h1>

        <h2 className="h2_custom">Users</h2>
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">UserID</th>
              <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">Email</th>
              <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">First Name</th>
              <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">Last Name</th>
              <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-300 text-gray-700">{user.userId}</td>
                <td className="px-4 py-2 border border-gray-300 text-gray-700">{user.email}</td>
                <td className="px-4 py-2 border border-gray-300 text-gray-700">{user.firstName}</td>
                <td className="px-4 py-2 border border-gray-300 text-gray-700">{user.lastName}</td>
                <td className="px-4 py-2 border border-gray-300 text-gray-700">{userRoles[user.userId]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Prev and Next Pagination Buttons */}
        <div className="flex justify-center items-center space-x-4 mt-4 py-1">
          <button
            onClick={handlePrevious}
            disabled={page === 0}
            className="w-24 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >Previous</button>
          <button
            onClick={handleNext}
            className="w-24 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >Next</button>
        </div>

        {/* Component to be able to update the role of a user */}
        <AdminManageUserRoles/>
      </div>

    </>
  );
};

export default AdminDashboard;
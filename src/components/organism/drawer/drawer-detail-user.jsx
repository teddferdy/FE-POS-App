/* eslint-disable react/prop-types */
import React, { useState } from "react";
import UserCard from "../card/user-card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";

const DrawerDetailUser = ({ user, onChangeRole }) => {
  const [selectedRole, setSelectedRole] = useState(user.userType);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSave = () => {
    onChangeRole(selectedRole);
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <UserCard
          image={user.image}
          name={user.userName}
          address={user.address}
          location={user.location}
          phoneNumber={user.phoneNumber}
          role={user.userType}
        />
      </DrawerTrigger>

      <DrawerContent className="p-6 w-full">
        <DrawerHeader>
          <DrawerTitle>Detailing Profile By {user.userName}</DrawerTitle>
        </DrawerHeader>
        <div className="mt-4">
          <div className="font-bold text-xl">Name: {user.userName}</div>
          <p className="text-gray-700 text-sm">Store: {user.location}</p>
          <p className="text-gray-700 text-sm">Phone: {user.phoneNumber}</p>
          <div className="mt-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={handleRoleChange}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline">
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Save Changes
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerDetailUser;

/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import AvatarUser from "../avatar-user";

// Components
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "../../ui/dialog";

const DialogChangeRole = ({
  classNameBtn = "flex items-center gap-4 p-2 hover:bg-gray-100 w-full",
  onChangeRole,
  ...user
}) => {
  const [selectedRole, setSelectedRole] = useState(user.userType);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSave = () => {
    onChangeRole(selectedRole);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={classNameBtn}>
          <Pencil className="w-6 h-6 mr-2 text-gray-500" />
          Update
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Role User {user.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-4 h-fit overflow-scroll">
          <div className="flex justify-center col-span-2">
            <AvatarUser classNameContainer="w-24 h-24 rounded-full mx-auto" />
          </div>
          <p className="text-gray-700 text-sm">Name: {user.name}</p>
          <p className="text-gray-700 text-sm">Store: {user.location}</p>
          <p className="text-gray-700 text-sm">Phone: {user.phone}</p>
          <p className="text-gray-700 text-sm">Role: {user.role}</p>

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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={handleSave}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogChangeRole;

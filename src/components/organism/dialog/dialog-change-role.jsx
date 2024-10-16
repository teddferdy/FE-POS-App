/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useQuery } from "react-query";
import SkeletonTable from "../skeleton/skeleton-table";
import AbortController from "../abort-controller";

import AvatarUser from "../avatar-user";

// Components
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog";

// Service
import { getAllPosition } from "../../../services/position";

const DialogChangeRole = ({
  classNameBtn = "flex items-center gap-4 p-2 hover:bg-gray-100 w-full",
  onChangeRole,
  ...user
}) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedPosition, setSelectedPosition] = useState(user.position ? user.position : null);
  const [open, setOpen] = useState(false);

  const handleRoleChange = (e) => setSelectedRole(e.target.value);

  const handlePositionChange = (e) => setSelectedPosition(Number(e.target.value));

  const handleSave = () => {
    setOpen(false);
    const body = {
      role: selectedRole,
      position: selectedPosition ? selectedPosition : 0
    };
    onChangeRole(body);
  };

  const allPosition = useQuery(["get-all-position"], () => getAllPosition(), {
    keepPreviousData: true,
    retry: 0
  });

  const INPUT_POSITION = useMemo(() => {
    if (allPosition.isLoading && allPosition.isFetching) {
      return <SkeletonTable />;
    }

    if (allPosition.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allPosition.refetch()} />
        </div>
      );
    }

    if (allPosition.data && allPosition.isSuccess) {
      const datasPosition = allPosition?.data?.data;
      return (
        <select
          id="position"
          value={selectedPosition}
          onChange={handlePositionChange}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline">
          <option value="">Choose a position</option>
          {/* Render available positions */}
          {datasPosition.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </select>
      );
    }
  }, [allPosition]);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(true)}>
      <DialogTrigger>
        <button className={classNameBtn}>
          <Pencil className="w-6 h-6 mr-2 text-gray-500" />
          Update
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" withX={false}>
        <DialogHeader>
          <DialogTitle>Update Profile User {user.name}</DialogTitle>
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
          <div className="mt-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Position
            </label>
            {INPUT_POSITION}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>

          <Button onClick={handleSave}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogChangeRole;

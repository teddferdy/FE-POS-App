/* eslint-disable react/prop-types */
import React from "react";
import AvatarUser from "../avatar-user";
import DialogDeleteItem from "../dialog/dialogDeleteItem";
import DialogViewDetail from "../dialog/dialog-view-detail-user";
import DialogChangeRole from "../dialog/dialog-change-role";
import { Separator } from "../../ui/separator";

const UserCard = ({
  // image,
  name,
  role,
  store,
  phoneNumber,
  location,
  position,
  positionId,
  onChangeRole
}) => {
  return (
    <div className="w-fit rounded shadow-lg bg-white m-4 p-4">
      <div className="flex justify-center">
        <AvatarUser classNameContainer="w-24 h-24 rounded-full mx-auto" />
      </div>
      {/* <img className="w-24 h-24 rounded-full mx-auto" src={image} alt={name} /> */}
      <div className="mt-4">
        <div className="font-bold text-xl">Name: {name}</div>
        <p className="text-gray-700 text-sm">Store: {location}</p>
        <p className="text-gray-700 text-sm">Phone: {phoneNumber ? phoneNumber : "-"}</p>
        <p className="text-gray-700 text-sm">Role: {role}</p>
        <p className="text-gray-700 text-sm">Position: {position ? position : "-"}</p>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between items-center space-x-4">
        <DialogChangeRole
          classNameBtn="flex items-center p-2 hover:bg-gray-100 w-full"
          name={name}
          role={role}
          store={store}
          position={positionId}
          phoneNumber={phoneNumber}
          location={location}
          onChangeRole={onChangeRole}
        />
        <DialogViewDetail
          classNameBtn="flex items-center p-2 hover:bg-gray-100 w-full"
          name={name}
          role={role}
          phoneNumber={phoneNumber}
          location={location}
        />
        <DialogDeleteItem classNameBtn="flex items-center p-2 hover:bg-gray-100 w-full" />
      </div>
    </div>
  );
};

export default UserCard;

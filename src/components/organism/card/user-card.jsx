/* eslint-disable react/prop-types */
import React from "react";

const UserCard = ({ image, name, role, phoneNumber, location }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white m-4 p-4">
      <img className="w-24 h-24 rounded-full mx-auto" src={image} alt={name} />
      <div className="mt-4">
        <div className="font-bold text-xl">Name: {name}</div>
        <p className="text-gray-700 text-sm">Store: {location}</p>
        <p className="text-gray-700 text-sm">Phone: {phoneNumber}</p>
        <p className="text-gray-700 text-sm">Role: {role}</p>
      </div>
    </div>
  );
};

export default UserCard;

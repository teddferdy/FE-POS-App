/* eslint-disable react/prop-types */
import React from "react";
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

const LocationCard = ({ image, nameStore, address, phoneNumber, handleLocation }) => {
  const linkImage = generateLinkImageFromGoogleDrive(image);
  return (
    <div
      className="w-full rounded overflow-hidden shadow-lg bg-white text-gray-700 hover:bg-[#1ACB0A] duration-200 cursor-pointer hover:text-white"
      onClick={handleLocation}>
      <img className="w-full h-48 object-cover" src={linkImage} alt={nameStore} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{nameStore}</div>
        <p className="text-base">
          <strong>Address:</strong> {address}
        </p>
        <p className="text-base">
          <strong>Phone:</strong> {phoneNumber}
        </p>
      </div>
    </div>
  );
};

export default LocationCard;

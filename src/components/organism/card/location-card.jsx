/* eslint-disable react/prop-types */
import React from "react";
// import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";

import DialogViewInvoiceByLocation from "../dialog/dialog-view-invoice-by-location";

const LocationCard = ({ idLocation, image, nameStore, address, phoneNumber, handleLocation }) => {
  // const linkImage = generateLinkImageFromGoogleDrive(image);
  const linkImage = image?.replace("https://drive.google.com/uc?id=", "");
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${linkImage}&sz=w1000`;
  const location = useLocation();
  return (
    <div className="shadow-lg p-4">
      <img className="w-full h-48 object-cover" src={thumbnailUrl} alt={nameStore} />
      <div className="py-4">
        <div className="font-bold text-xl mb-2">{nameStore}</div>
        <p className="text-base">
          <strong>Address:</strong> {address}
        </p>
        <p className="text-base">
          <strong>Phone:</strong> {phoneNumber}
        </p>
      </div>

      <div className="flex justify-end">
        {location.pathname === "/invoice-by-outlet" ? (
          <DialogViewInvoiceByLocation nameStore={idLocation} />
        ) : (
          <button
            className="flex gap-4 p-2 w-fit rounded overflow-hidden bg-white text-gray-700 hover:bg-[#1ACB0A] duration-200 cursor-pointer hover:text-white"
            onClick={handleLocation}>
            View Detail
            <ArrowRight className="w-6 h-6 mr-2 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationCard;

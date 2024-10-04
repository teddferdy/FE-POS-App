/* eslint-disable react/prop-types */
import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import {
  Pencil,
  // Eye,
  Ellipsis
} from "lucide-react";
import DialogDeleteItem from "../dialog/dialogDeleteItem";
import DialogBySwitch from "../dialog/dialog-switch";

const ThreeDotsMenu = ({
  content,
  handleEdit,
  handleDelete,
  checkedActiveOrInactive,
  handleActivateOrInactive
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full">
          <Ellipsis className="w-5 h-5 mr-2 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-white shadow-lg p-4 rounded-md w-48 z-10">
        <ul className="flex flex-col">
          {content.map((items) => {
            // Edit
            if (items === "edit") {
              return (
                <li key={items}>
                  <button
                    className="flex items-center gap-4 p-2 hover:bg-gray-100 w-full"
                    onClick={handleEdit}>
                    <Pencil className="w-5 h-5 mr-2 text-gray-500" />
                    Edit
                  </button>
                </li>
              );
            }

            // Delete
            if (items === "delete") {
              return (
                <li key={items}>
                  <DialogDeleteItem actionDelete={handleDelete} />
                </li>
              );
            }

            // Active / Inactive
            if (items === "activeOrInactive") {
              return (
                <DialogBySwitch
                  key={items}
                  checked={checkedActiveOrInactive}
                  onChange={handleActivateOrInactive}
                />
              );
            }
          })}
          {/* <li>
            <button
              className="flex items-center text-left w-full p-2 hover:bg-gray-100"
              onClick={handleEdit}>
              <Pencil className="w-5 h-5 mr-2 text-gray-500" />
              Edit
            </button>
          </li>
          <li>
            <DialogDeleteItem actionDelete={handleDelete} />
          </li> */}
          {/* {withView && (
            <li>
              <button className="flex items-center text-left w-full p-2 hover:bg-gray-100">
                <Eye className="w-5 h-5 mr-2 text-gray-500" />
                View
              </button>
            </li>
          )} */}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default ThreeDotsMenu;

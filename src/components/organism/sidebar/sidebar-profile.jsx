import React from "react";
import PropTypes from "prop-types";

import { LogOut, UserCog, Languages } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../ui/select";
import { translationSelect } from "../../../state/translation";
import { TRANSLATION } from "../../../utils/translation";

const SideBarProfile = ({ navigate, mutateLogout }) => {
  const { updateTranslation, translation } = translationSelect();

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex items-center w-full cursor-pointer gap-8"
        onClick={() => navigate("/edit-profile")}>
        <UserCog color="#000" />
        <p>Edit Profile</p>
      </div>
      <div
        className="flex items-center w-full cursor-pointer gap-8 md:hidden"
        onClick={() => navigate("/home")}>
        <Languages color="#000" />
        <Select
          onValueChange={(e) => updateTranslation(e)}
          value={localStorage.getItem("translation")}>
          <SelectTrigger className="w-full border-hidden">
            {TRANSLATION?.filter((items) => items.value === translation)?.map((items, index) => (
              <div className="flex items-center gap-6" key={index}>
                <img src={items.img} alt={items.name} className="max-w-6 max-h-6" key={index} />
                <p>{items.name}</p>
              </div>
            ))}
          </SelectTrigger>
          <SelectContent
            className="min-w-2 z-50"
            defaultValue={
              TRANSLATION?.filter((items) => items.value === translation)?.map(
                (items) => items.value
              )?.[0]
            }>
            <SelectGroup>
              <SelectLabel>Select Language</SelectLabel>
              {TRANSLATION.map((items, index) => (
                <SelectItem
                  value={items.value}
                  className="w-full flex items-center focus:bg-[#1ACB0A] focus:text-white"
                  key={index}>
                  <div className="flex justify-between items-center gap-4">
                    <img src={items.img} alt={items.name} className="max-w-6 max-h-6" />
                    <p>{items.name}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full cursor-pointer gap-8 self-end" onClick={mutateLogout}>
        <LogOut color="#000" />
        <p>Logout</p>
      </div>
    </div>
  );
};

SideBarProfile.propTypes = {
  navigate: PropTypes.func,
  mutateLogout: PropTypes.func
};

export default SideBarProfile;

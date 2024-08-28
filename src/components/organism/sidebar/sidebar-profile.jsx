import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

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

const SideBarProfile = ({ classNameContainer }) => {
  const navigate = useNavigate();

  const { updateTranslation, translation } = translationSelect();

  return (
    <div className="flex flex-col gap-8 h-[90%] py-8">
      <div
        className="flex items-center w-full cursor-pointer gap-8"
        onClick={() => navigate("/edit-profile")}>
        <UserCog color="#000" />
        <p className={classNameContainer}>Edit Profile</p>
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
                <SelectItem value={items.value} className="w-full flex items-center" key={index}>
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

      <div
        className="flex w-full cursor-pointer gap-8 self-end"
        onClick={() => navigate("/membership")}>
        <LogOut color="#000" />
        <p className={classNameContainer}>Logout</p>
      </div>
    </div>
  );
};

SideBarProfile.defaultProps = {
  classNameContainer: ""
};

SideBarProfile.propTypes = {
  classNameContainer: PropTypes.string
};

export default SideBarProfile;

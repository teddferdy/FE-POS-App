import React from "react";

const ProfileHeader = ({ name, placeCashier }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-base font-medium text-[#737373]">welcome, {name}!</p>
      <p className="text-xs font-medium text-[#D9D9D9]">
        Cachier on {placeCashier}
      </p>
    </div>
  );
};

export default ProfileHeader;

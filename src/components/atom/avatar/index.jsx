import React from "react";

const Avatar = () => {
  return (
    <div className="w-12 relative overflow-hidden">
      <img
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        className="object-cover rounded-full"
      />
      <div className="h-3 w-3 rounded-full bg-green-500 top-0 right-0 absolute" />
    </div>
  );
};

export default Avatar;

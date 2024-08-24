import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

const AvatarUser = () => {
  return (
    <div className="w-12 relative overflow-hidden">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="h-3 w-3 rounded-full bg-green-500 top-0 right-0 absolute" />
    </div>
  );
};

export default AvatarUser;

/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

const AvatarUser = ({
  size,
  classNameContainer,
  showIndicatorOnline,
  src = "https://github.com/shadcn.png"
}) => {
  return (
    <div className={`w-${size} relative overflow-hidden`}>
      <Avatar className={classNameContainer}>
        <AvatarImage src={src} className="w-full object-cover" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {showIndicatorOnline && (
        <div className="h-3 w-3 rounded-full bg-green-500 top-0 right-0 absolute" />
      )}
    </div>
  );
};

Avatar.defaultProps = {
  size: "12",
  classNameContainer: "",
  showIndicatorOnline: true
};

Avatar.propTypes = {
  size: PropTypes.string,
  classNameContainer: PropTypes.string,
  showIndicatorOnline: PropTypes.bool
};

export default AvatarUser;

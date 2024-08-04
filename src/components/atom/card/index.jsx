import React from "react";
import PropTypes from "prop-types";

const Card = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

Card.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string
};

export default Card;

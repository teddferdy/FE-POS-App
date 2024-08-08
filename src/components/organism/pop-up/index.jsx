import React from "react";
import PropTypes from "prop-types";
import Modal from "../../atom/modal";

// Assets
import CloseIcon from "../../../assets/icon/close-icon.svg";

const PopUp = ({
  title,
  desc,
  btnCloseText,
  btnAccText,
  withButton,
  onCloseIcon,
  funcBtnClose,
  funcBtnAcc,
  withContent,
  content
}) => {
  return (
    <Modal>
      <div className="h-full justify-center flex items-center flex-col">
        <div className="bg-white p-6 rounded-lg relative shadow-xl transform transition-all max-w-lg sm:w-full">
          <button
            className="absolute z-30 -top-[20px] -right-[20px] h-10 w-10 rounded-full"
            onClick={onCloseIcon}>
            <img src={CloseIcon} alt="close-icon" />
          </button>
          <div className="flex items-start justify-between ">
            <div className="text-left">
              {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
              <div className="mt-1">
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          </div>

          {/* Fill Content */}
          {withContent && content()}
          {/* End Fill Content */}

          {withButton && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-blue-500 px-4 py-2 text-base font-medium text-blue-500 hover:text-white hover:border-blue-400 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                onClick={funcBtnClose}>
                {btnCloseText}
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                onClick={funcBtnAcc}>
                {btnAccText}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

PopUp.propTypes = {
  title: PropTypes.any,
  desc: PropTypes.any,
  btnCloseText: PropTypes.any,
  btnAccText: PropTypes.any,
  withButton: PropTypes.any,
  onCloseIcon: PropTypes.any,
  funcBtnClose: PropTypes.any,
  funcBtnAcc: PropTypes.any,
  withContent: PropTypes.bool,
  content: PropTypes.element
};

export default PopUp;

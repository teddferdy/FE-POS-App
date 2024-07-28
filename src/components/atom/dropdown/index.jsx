import React from "react";

const Dropdown = ({
  data,
  selectData,
  children,
  classNameListContainer,
  widthListWrapper = "w-40",
}) => {
  return (
    <div className="dropdown inline-block relative">
      {children}
      <ul
        className={`dropdown-menu absolute hidden text-gray-700 pt-1 ${classNameListContainer}`}
      >
        {data.map((items, index) => {
          return (
            <li
              className={`bg-white  hover:bg-gray-400 py-2 px-4 flex justify-between ${widthListWrapper}`}
              key={index}
              onClick={() => selectData(items)}
            >
              <div className="w-8 h-8">
                <img
                  src={items.img}
                  alt={items.name}
                  className="object-cover"
                />
              </div>
              <p>{items.name}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dropdown;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../ui/accordion";
import { Checkbox } from "../../ui/checkbox";

const AccordionRole = ({ menu, checkedValue }) => {
  const [checkedState, setCheckedState] = useState({});

  const updateParentCheckedState = (parentTitle) => {
    const parentState = { ...checkedState[parentTitle] };
    const anyChildChecked = parentState.children?.some((child) => child.checked) || false;
    const anyActionChecked = parentState.actions.length > 0;

    // Update parent's checked state based on children or actions being checked
    parentState.checked = anyChildChecked || anyActionChecked;

    setCheckedState((prevState) => ({
      ...prevState,
      [parentTitle]: parentState
    }));

    if (typeof checkedValue === "function") {
      // Filter and return only checked parents with title and checked status
      const checkedParents = Object.values(checkedState)
        .filter((item) => item.checked)
        .map((parent) => ({ title: parent.title, checked: parent.checked }));
      checkedValue(checkedParents);
    }
  };

  const handleParentChange = (parentTitle, isChecked) => {
    const parentItem = menu.find((item) => item.title === parentTitle);
    const updatedChildren =
      parentItem.children?.map((child) => ({
        ...child,
        checked: isChecked,
        actions: isChecked ? ["edit", "view", "add", "delete"] : []
      })) || [];

    setCheckedState((prevState) => ({
      ...prevState,
      [parentTitle]: {
        title: parentTitle,
        checked: isChecked,
        actions: isChecked ? ["edit", "view", "add", "delete"] : [],
        children: updatedChildren
      }
    }));

    if (typeof checkedValue === "function") {
      const checkedParents = Object.values(checkedState)
        .filter((item) => item.checked)
        .map((parent) => ({ title: parent.title, checked: parent.checked }));
      checkedValue(checkedParents);
    }
  };

  const handleChildChange = (parentTitle, childTitle, isChecked) => {
    const updatedState = { ...checkedState };
    const parent = updatedState[parentTitle];
    const childIndex = parent?.children.findIndex((child) => child.title === childTitle);

    if (childIndex > -1) {
      parent.children[childIndex].checked = isChecked;
      parent.children[childIndex].actions = isChecked ? ["edit", "view", "add", "delete"] : [];

      updateParentCheckedState(parentTitle);
    }
  };

  const handleActionChange = (parentTitle, childTitle, action, isChecked) => {
    const updatedState = { ...checkedState };
    const parent = updatedState[parentTitle];

    if (childTitle) {
      const child = parent.children.find((c) => c.title === childTitle);
      child.actions = isChecked
        ? [...child.actions, action]
        : child.actions.filter((a) => a !== action);
      child.checked = child.actions.length > 0;
    } else {
      parent.actions = isChecked
        ? [...parent.actions, action]
        : parent.actions.filter((a) => a !== action);
    }

    updateParentCheckedState(parentTitle);
  };

  useEffect(() => {
    const initialState = {};
    menu.forEach((parent) => {
      initialState[parent.title] = {
        title: parent.title,
        checked: false,
        actions: [],
        children:
          parent.children?.map((child) => ({
            ...child,
            checked: false,
            actions: []
          })) || []
      };
    });
    setCheckedState(initialState);
  }, [menu]);

  return (
    <Accordion type="multiple" className="w-full">
      {menu.map((parent, index) => (
        <AccordionItem key={index} value={parent.title}>
          <AccordionTrigger className="flex justify-between items-center">
            <div className="flex items-center">
              <Checkbox
                checked={checkedState[parent.title]?.checked || false}
                onCheckedChange={(isChecked) => handleParentChange(parent.title, isChecked)}
              />
              <span className="ml-2">{parent.title}</span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            {parent.children?.map((child, idx) => (
              <div key={idx} className="flex justify-between">
                <div className="ml-4 flex flex-col mb-4">
                  <div className="flex gap-2">
                    <Checkbox
                      checked={
                        checkedState[parent.title]?.children.find((c) => c.title === child.title)
                          ?.checked || false
                      }
                      onCheckedChange={(isChecked) =>
                        handleChildChange(parent.title, child.title, isChecked)
                      }
                    />
                    <span>{child.title}</span>
                  </div>
                  <div className="ml-8 flex flex-col gap-2 mt-4">
                    {["edit", "view", "add", "delete"].map((action, actionIdx) => (
                      <div key={actionIdx}>
                        <Checkbox
                          id={action}
                          checked={
                            checkedState[parent.title]?.children
                              .find((c) => c.title === child.title)
                              ?.actions.includes(action) || false
                          }
                          onCheckedChange={(isChecked) =>
                            handleActionChange(parent.title, child.title, action, isChecked)
                          }
                        />
                        <label htmlFor={action} className="ml-1">
                          {action}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {parent.actions?.map((action, actionIdx) => (
              <div key={actionIdx} className="ml-8 flex gap-2">
                <Checkbox
                  id={action}
                  checked={checkedState[parent.title]?.actions.includes(action) || false}
                  onCheckedChange={(isChecked) =>
                    handleActionChange(parent.title, null, action, isChecked)
                  }
                />
                <label htmlFor={action} className="ml-1">
                  {action}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

AccordionRole.propTypes = {
  menu: PropTypes.array.isRequired,
  checkedValue: PropTypes.func.isRequired
};

export default AccordionRole;

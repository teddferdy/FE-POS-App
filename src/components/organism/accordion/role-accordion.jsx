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

    // Set parent checked based on whether any child or any action is checked
    parentState.checked = anyChildChecked || anyActionChecked;

    setCheckedState((prevState) => ({
      ...prevState,
      [parentTitle]: parentState
    }));

    if (typeof checkedValue === "function") {
      checkedValue(Object.values(checkedState));
    }
  };

  const handleParentChange = (parentTitle, isChecked) => {
    const parentItem = menu.find((item) => item.title === parentTitle);
    const updatedChildren =
      parentItem.children?.map((child) => ({
        title: child.title,
        checked: isChecked,
        actions: isChecked ? ["edit", "view", "add", "delete"] : [] // Set actions if parent is checked
      })) || [];

    const updatedState = {
      ...checkedState,
      [parentTitle]: {
        checked: isChecked,
        actions: isChecked ? [...parentItem.actions] : [],
        children: updatedChildren
      }
    };

    setCheckedState(updatedState);
    if (typeof checkedValue === "function") {
      checkedValue(Object.values(updatedState));
    }
  };

  const handleChildChange = (parentTitle, childTitle, isChecked) => {
    const updatedState = { ...checkedState };
    const childIndex = updatedState[parentTitle]?.children.findIndex(
      (child) => child.title === childTitle
    );

    if (childIndex > -1) {
      updatedState[parentTitle].children[childIndex].checked = isChecked;

      // If child is checked, set actions to checked
      if (isChecked) {
        updatedState[parentTitle].children[childIndex].actions = ["edit", "view", "add", "delete"];
      } else {
        updatedState[parentTitle].children[childIndex].actions = [];
      }

      // Update parent's checked state based on children
      updateParentCheckedState(parentTitle);
      setCheckedState(updatedState);
    }
  };

  const handleActionChange = (parentTitle, childTitle, action, isChecked) => {
    const updatedState = { ...checkedState };
    const parent = updatedState[parentTitle];

    if (!parent) return;

    if (childTitle) {
      const child = parent.children.find((c) => c.title === childTitle);
      if (child) {
        const updatedActions = isChecked
          ? [...child.actions, action]
          : child.actions.filter((a) => a !== action);

        child.actions = updatedActions;
        child.checked = updatedActions.length > 0; // Child checked if any action is checked

        // Update parent state after changing child's actions
        updateParentCheckedState(parentTitle);
        setCheckedState(updatedState);
      }
    } else {
      const updatedActions = isChecked
        ? [...parent.actions, action]
        : parent.actions.filter((a) => a !== action);

      parent.actions = updatedActions;

      // If no actions are left, uncheck all children
      if (updatedActions.length === 0) {
        parent.children.forEach((child) => {
          child.checked = false;
          child.actions = [];
        });
      }

      // Update parent's checked state
      updateParentCheckedState(parentTitle);
    }
  };

  useEffect(() => {
    const initialState = {};
    menu.forEach((parent) => {
      initialState[parent.title] = {
        checked: false,
        actions: [],
        children:
          parent.children?.map((child) => ({
            title: child.title,
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
            {parent.children &&
              Array.isArray(parent.children) &&
              parent.children.map((child, idx) => (
                <div key={idx} className="flex justify-between">
                  <div className="ml-4 flex flex-col justify-between mb-4">
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
            {parent.actions &&
              parent.actions.map((action, actionIdx) => (
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

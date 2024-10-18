import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../ui/accordion";
import { Checkbox } from "../../ui/checkbox";

const AccordionRole = ({ menu, checkedValue }) => {
  const [checkedState, setCheckedState] = useState({});

  const updateParentCheckedState = (parentTitle) => {
    const parentState = { ...checkedState[parentTitle] };
    const allChildrenChecked = parentState.children?.every((child) => child.checked) || false;
    const anyActionChecked = parentState.actions.some((action) => action.length > 0) || false; // Check if any action has values

    // Set parent checked based on children and actions
    parentState.checked = allChildrenChecked || anyActionChecked;

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
        actions: isChecked ? [...child.actions] : [] // Set actions to their names if parent is checked, otherwise empty
      })) || [];

    const updatedState = {
      ...checkedState,
      [parentTitle]: {
        checked: isChecked,
        actions: isChecked ? [...parentItem.actions] : [], // Reset parent actions based on parent's checked state
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

      // If the child is checked, add all actions to the child's actions
      if (isChecked) {
        updatedState[parentTitle].children[childIndex].actions = ["edit", "view", "add", "delete"]; // Add actions
      } else {
        // If the child is unchecked, reset actions and check if the parent needs to be unchecked
        updatedState[parentTitle].children[childIndex].actions = [];
      }

      // If all children are checked, check the parent
      const allChildrenChecked = updatedState[parentTitle].children.every((child) => child.checked);
      updatedState[parentTitle].checked = allChildrenChecked; // Update parent checked state

      setCheckedState(updatedState);
      updateParentCheckedState(parentTitle);
    }
  };

  const handleActionChange = (parentTitle, childTitle, action, isChecked) => {
    const updatedState = { ...checkedState };
    const parent = updatedState[parentTitle];

    // Check if parent exists in the state
    if (!parent) return;

    // If childTitle is specified, we are handling a child's action
    if (childTitle) {
      const child = parent.children.find((c) => c.title === childTitle);

      if (child) {
        const updatedActions = isChecked
          ? [...child.actions, action] // Add action name when checked
          : child.actions.filter((a) => a !== action); // Remove action name when unchecked

        child.actions = updatedActions; // Update child's actions
        child.checked = updatedActions.length > 0; // Set checked state based on actions

        // Uncheck child and parent if actions are empty
        if (updatedActions.length === 0) {
          child.checked = false;
          updatedState[parentTitle].checked = false;
        }

        setCheckedState(updatedState);
        updateParentCheckedState(parentTitle);
      }
    } else {
      // If childTitle is not specified, we are handling a parent's action
      const parentActions = parent.actions || []; // Ensure parent actions exist
      const updatedActions = isChecked
        ? [...parentActions, action] // Add action name
        : parentActions.filter((a) => a !== action); // Remove action name

      parent.actions = updatedActions;

      // Uncheck all children if no parent actions are left
      if (updatedActions.length === 0) {
        parent.children.forEach((child) => {
          child.checked = false;
          child.actions = []; // Reset actions of children
        });
      }

      setCheckedState(updatedState);
      updateParentCheckedState(parentTitle);
    }
  };

  useEffect(() => {
    const initialState = {};
    menu.forEach((parent) => {
      initialState[parent.title] = {
        checked: false,
        actions: [], // Initialize parent actions
        children:
          parent.children?.map((child) => ({
            title: child.title,
            checked: false,
            actions: [] // Initialize actions for child as empty arrays
          })) || []
      };
    });
    setCheckedState(initialState);
    if (typeof checkedValue === "function") {
      checkedValue(Object.values(initialState));
    }
  }, [menu, checkedValue]);

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
                                ?.actions.includes(action) || false // Check based on the inclusion of action names
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
              parent.actions.map((action, actionIdx) => {
                return (
                  <div key={actionIdx} className="ml-8 flex gap-2">
                    <Checkbox
                      id={action}
                      checked={checkedState[parent.title]?.actions.includes(action) || false}
                      onCheckedChange={(isChecked) =>
                        handleActionChange(parent.title, null, action, isChecked)
                      } // Pass `null` for childTitle
                    />
                    <label htmlFor={action} className="ml-1">
                      {action}
                    </label>
                  </div>
                );
              })}
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

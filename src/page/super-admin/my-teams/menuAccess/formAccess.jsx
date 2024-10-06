import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox"; // Shadcn checkbox component (adjust path)

// Array of roles (you might fetch this from an API)
const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Editor" },
  { id: 3, name: "Viewer" }
];

// Array of menus (you might fetch this from an API)
const menus = [
  { id: 1, name: "Dashboard" },
  { id: 2, name: "Settings" },
  { id: 3, name: "Users" }
];

const RoleMenuAccessForm = () => {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      role: "", // Initially no role is selected
      menuAccess: [] // Menus accessible by the role
    }
  });

  // Function to handle form submission
  const onSubmit = (data) => {
    console.log("Form Data: ", data);
    // Here, you'd typically send this data to an API
  };

  // Handle checkbox state changes
  const handleMenuAccessChange = (menuId, isChecked) => {
    const currentAccess = watch("menuAccess");
    if (isChecked) {
      setValue("menuAccess", [...currentAccess, menuId]);
    } else {
      setValue(
        "menuAccess",
        currentAccess.filter((id) => id !== menuId)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Selection */}
      <h2 className="text-lg font-bold">Assign Menu Access by Role</h2>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <div>
            <label className="text-base font-semibold mb-2 block">Select Role:</label>
            <select {...field} className="w-full border p-2 rounded-md text-sm" defaultValue="">
              <option value="" disabled>
                -- Select Role --
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        )}
      />

      {/* Menu Access Checkboxes */}
      <div>
        <h3 className="text-base font-semibold mb-2">Select Menus for Role Access:</h3>
        {menus.map((menu) => (
          <div key={menu.id} className="flex items-center space-x-2">
            <Controller
              name="menuAccess"
              control={control}
              render={() => (
                <Checkbox
                  id={`menu-${menu.id}`}
                  checked={watch("menuAccess").includes(menu.id)}
                  onCheckedChange={(isChecked) => handleMenuAccessChange(menu.id, isChecked)}
                />
              )}
            />
            <label htmlFor={`menu-${menu.id}`} className="text-sm">
              {menu.name}
            </label>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
        Save Role Access
      </Button>
    </form>
  );
};

export default RoleMenuAccessForm;

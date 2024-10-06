import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../../../components/ui/button"; // Adjust path for your project
import { Checkbox } from "../../../../components/ui/checkbox"; // Adjust path for your project

// Array of roles (you can get this from an API or define it statically)
const rolesArray = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Cashier" }
];

const RoleCheckboxForm = () => {
  // Use React Hook Form
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      roles: [] // This will hold the selected roles
    }
  });

  // Handle form submission
  const onSubmit = (data) => {
    console.log("Selected Roles:", data.roles);
  };

  // Handle checkbox change
  const handleCheckboxChange = (roleId, isChecked) => {
    const currentRoles = watch("roles");
    if (isChecked) {
      setValue("roles", [...currentRoles, roleId]);
    } else {
      setValue(
        "roles",
        currentRoles.filter((id) => id !== roleId)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-bold mb-4">Select User Roles</h2>

      {/* Render the checkboxes for each role */}
      {rolesArray.map((role) => (
        <div key={role.id} className="flex items-center space-x-2">
          <Controller
            name="roles"
            control={control}
            render={() => (
              <Checkbox
                id={`role-${role.id}`}
                onCheckedChange={(isChecked) => handleCheckboxChange(role.id, isChecked)}
                checked={watch("roles").includes(role.id)}
              />
            )}
          />
          <label htmlFor={`role-${role.id}`} className="text-sm">
            {role.name}
          </label>
        </div>
      ))}

      {/* Submit button */}
      <Button type="submit" className="mt-4">
        Submit Roles
      </Button>
    </form>
  );
};

export default RoleCheckboxForm;

import React from "react";
import { Route } from "react-router-dom";

import { RequireRole } from "@/components/ui/RequireRole";

// User / Admin
const AdminList = React.lazy(() => import("@/page/user/AdminList"));
const AddAdmin = React.lazy(() => import("@/page/user/AddAdmin"));
const AddRole = React.lazy(() => import("@/page/user/AddRole"));

// Role
const RoleManagement = React.lazy(() => import("@/page/role/RoleManagement"));
const EditRole = React.lazy(() => import("@/page/role/EditRole"));
const DetailRole = React.lazy(() => import("@/page/role/DetailRole"));

// Employee
const EmployeeList = React.lazy(() => import("@/page/employee/EmployeeList"));
const AddEmployee = React.lazy(() => import("@/page/employee/AddEmployee"));
const EditEmployee = React.lazy(() => import("@/page/employee/EditEmployee"));
const DetailEmployee = React.lazy(() => import("@/page/employee/DetailEmployee"));

// Position
const PositionList = React.lazy(() => import("@/page/position/PositionList"));
const AddPosition = React.lazy(() => import("@/page/position/AddPosition"));
const EditPosition = React.lazy(() => import("@/page/position/EditPosition"));
const DetailPosition = React.lazy(() => import("@/page/position/DetailPosition"));

// Department
const DepartmentList = React.lazy(() => import("@/page/department/DepartmentList"));
const AddDepartment = React.lazy(() => import("@/page/department/AddDepartment"));
const EditDepartment = React.lazy(() => import("@/page/department/EditDepartment"));
const DetailDepartment = React.lazy(() => import("@/page/department/DetailDepartment"));

// Shift
const ShiftList = React.lazy(() => import("@/page/shift/ShiftList"));
const AddShift = React.lazy(() => import("@/page/shift/AddShift"));
const EditShift = React.lazy(() => import("@/page/shift/EditShift"));
const DetailShift = React.lazy(() => import("@/page/shift/DetailShift"));
const MyShift = React.lazy(() => import("@/page/shift/MyShift"));

// Shift Template
const ShiftTemplateList = React.lazy(() => import("@/page/shift-template/ShiftTemplateList"));
const AddShiftTemplate = React.lazy(() => import("@/page/shift-template/AddShiftTemplate"));
const EditShiftTemplate = React.lazy(() => import("@/page/shift-template/EditShiftTemplate"));
const DetailShiftTemplate = React.lazy(() => import("@/page/shift-template/DetailShiftTemplate"));

export const hrRoutes = (
  <>
    <Route path="/user-list" element={<AdminList />} />
    <Route path="/add-user" element={<AddAdmin />} />
    <Route
      path="/add-role"
      element={
        <RequireRole roles={["super_admin"]}>
          <AddRole />
        </RequireRole>
      }
    />
    <Route
      path="/edit-role/:id"
      element={
        <RequireRole roles={["super_admin"]}>
          <EditRole />
        </RequireRole>
      }
    />
    <Route
      path="/detail-role/:id"
      element={
        <RequireRole roles={["super_admin"]}>
          <DetailRole />
        </RequireRole>
      }
    />
    <Route
      path="/role-management"
      element={
        <RequireRole roles={["super_admin"]}>
          <RoleManagement />
        </RequireRole>
      }
    />

    <Route path="/employee-list" element={<EmployeeList />} />
    <Route path="/add-employee" element={<AddEmployee />} />
    <Route path="/edit-employee" element={<EditEmployee />} />
    <Route path="/detail-employee" element={<DetailEmployee />} />

    <Route path="/position-list" element={<PositionList />} />
    <Route path="/add-position" element={<AddPosition />} />
    <Route path="/edit-position" element={<EditPosition />} />
    <Route path="/detail-position" element={<DetailPosition />} />

    <Route path="/department-list" element={<DepartmentList />} />
    <Route path="/add-department" element={<AddDepartment />} />
    <Route path="/edit-department" element={<EditDepartment />} />
    <Route path="/detail-department" element={<DetailDepartment />} />

    <Route path="/shift-list" element={<ShiftList />} />
    <Route path="/add-shift" element={<AddShift />} />
    <Route path="/edit-shift" element={<EditShift />} />
    <Route path="/detail-shift" element={<DetailShift />} />
    <Route path="/my-shift" element={<MyShift />} />

    <Route path="/shift-template-list" element={<ShiftTemplateList />} />
    <Route path="/add-shift-template" element={<AddShiftTemplate />} />
    <Route path="/edit-shift-template" element={<EditShiftTemplate />} />
    <Route path="/detail-shift-template" element={<DetailShiftTemplate />} />
  </>
);

import React from "react";
import { Route } from "react-router-dom";

// Location
const LocationList = React.lazy(() => import("@/page/location/LocationList"));
const AddLocation = React.lazy(() => import("@/page/location/AddLocation"));
const EditLocation = React.lazy(() => import("@/page/location/EditLocation"));
const LocationDetail = React.lazy(() => import("@/page/location/LocationDetail"));
const StoreGeospatial = React.lazy(() => import("@/page/location/StoreGeospatial"));

// Table
const TableList = React.lazy(() => import("@/page/table/TableList"));
const DetailTable = React.lazy(() => import("@/page/table/DetailTable"));

// Price Store
const PriceStoreList = React.lazy(() => import("@/page/price-store/PriceStoreList"));

// Backup
const BackupPage = React.lazy(() => import("@/page/backup/BackupPage"));

// Audit Log
const AuditLogList = React.lazy(() => import("@/page/audit-log/AuditLogList"));

// Thermal Printer
const ThermalPrinterSettings = React.lazy(() => import("@/page/thermal-printer/ThermalPrinterSettings"));

export const settingsRoutes = (
  <>
    <Route path="/location-list" element={<LocationList />} />
    <Route path="/add-location" element={<AddLocation />} />
    <Route path="/edit-location" element={<EditLocation />} />
    <Route path="/detail-location" element={<LocationDetail />} />
    <Route path="/store-geospatial" element={<StoreGeospatial />} />

    <Route path="/table-list" element={<TableList />} />
    <Route path="/detail-table" element={<DetailTable />} />

    <Route path="/price-list-template" element={<PriceStoreList />} />

    <Route path="/backup" element={<BackupPage />} />

    <Route path="/audit-log" element={<AuditLogList />} />
    <Route path="/thermal-printer" element={<ThermalPrinterSettings />} />
  </>
);

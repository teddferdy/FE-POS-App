import React from "react";
import { Route } from "react-router-dom";

const QueueList = React.lazy(() => import("@/page/queue/QueueList"));

export const queueRoutes = (
  <>
    <Route path="/queue-list" element={<QueueList />} />
  </>
);

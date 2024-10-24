import { axiosInstance } from ".";

export const getAllCategory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/category/get-category?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllCategoryTable = async ({ location, limit, page, statusCategory }) => {
  const { data, status } = await axiosInstance.get(
    `/category/get-category-all?store=${location}&page=${page}&limit=${limit}&status=${statusCategory}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/category/add-new-category", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/category/edit-category/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteCategory = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/category/delete-category/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const downloadExcel = async () => {
  const { data, status } = await axiosInstance.get(`/category/download-excel`, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    responseType: "arraybuffer" // This ensures we handle the binary data correctly
  });

  if (status !== 200) throw new Error(`${data.message}`);

  // Create the filename with .xlsx extension
  const outputFilename = `${Date.now()}-category.xlsx`;

  // Create a blob with the correct MIME type for Excel files
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  // Generate URL for the blob and download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", outputFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

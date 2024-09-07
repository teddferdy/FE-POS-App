import { axiosInstance } from ".";

export const getAllSubCategory = async () => {
  const { data, status } = await axiosInstance.get("/sub-category/get-all-sub-category");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSubCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/sub-category/add-subcategory", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

// export const editSubCategory = async (payload) => {
//   const { data, status } = await axiosInstance.put(
//     `/category/edit-category/${payload.id}`,
//     payload
//   );
//   if (status !== 200) throw Error(`${data.message || data?.error}`);
//   return data;
// };

// export const deleteSubCategory = async (payload) => {
//   const { data, status } = await axiosInstance.delete(`/category/delete-category/${payload.id}`, {
//     data: payload
//   });
//   if (status !== 200) throw Error(data?.error);
//   return data;
// };

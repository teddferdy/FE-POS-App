import { axiosInstance } from ".";

export async function searchFaq({ page = 1, limit = 10, search } = {}) {
  const { data } = await axiosInstance.get("/faq/faq", {
    params: { page, limit, search }
  });
  return data;
}

export async function getAllFaq() {
  const { data } = await axiosInstance.get("/faq/faq");
  return data;
}

export async function askAi(question, contextData = {}) {
  const { data } = await axiosInstance.post("/faq/faq/ask", {
    question,
    data: contextData
  });
  return data.answer;
}

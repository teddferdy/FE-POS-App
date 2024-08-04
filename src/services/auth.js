import axios from "axios";

export const login = async (payload) => {
  const { data, status } = await axios.post(
    `https://api-bisa-nota.vercel.app/auth/login`,
    payload,
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (status !== 200) throw Error(`Error`);

  return data;
};

// export const register = (payload) => {};

// export const resetPassword = (payload) => {};

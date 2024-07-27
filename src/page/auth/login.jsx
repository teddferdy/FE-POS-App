import React, { useState } from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// Assets
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";

// Component
import PopUp from "../../components/UI/pop-up";
import { useLoading } from "../../components/UI/loading";

// Services
import { login } from "../../services/auth";
// register;
// resetPassword;

const validate = (values) => {
  const errors = {};
  if (!values.userName) {
    errors.userName = "Tidak Boleh Kosong";
  }

  if (!values.password) {
    errors.password = "Tidak Boleh Kosong";
  }

  // if (!values.email) {
  //   errors.email = "Required";
  // } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
  //   errors.email = "Invalid email address";
  // }

  return errors;
};

function Login() {
  const [showPopUp, setShowPopUp] = useState("");
  const { setActive } = useLoading();
  const navigate = useNavigate();

  // QUERY
  const mutateLogin = useMutation(login, {
    onMutate: () => setActive(true),
    onSuccess: () => {
      setShowPopUp("success");
      setActive(false);
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    },
    onError: () => {
      setActive(false);
      setShowPopUp("error");
    },
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validate,
    onSubmit: (values) => mutateLogin.mutate(values),
  });

  return (
    <div className="flex h-screen justify-between">
      <div className="w-full flex flex-col flex-1 rounded p-[61px]">
        <img src={Logo} className="w-1/4" alt="logo" />
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-1/2 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">
            Login
          </p>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label
                className="block text-[#828282] text-lg font-semibold"
                htmlFor="userName"
              >
                User Name :
              </label>
              <input
                className="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="text"
                id="userName"
                name="userName"
                onChange={formik.handleChange}
                value={formik.values.userName}
              />
              {formik.errors.userName ? (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.userName}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <label
                className="block text-[#828282] text-lg font-semibold"
                htmlFor="password"
              >
                Password :
              </label>
              <input
                className="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="password"
                id="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.errors.password ? (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                type="submit"
                className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
              >
                Login
              </button>
              <div className="flex justify-between items-center">
                <a
                  className="text-[#CECECE] font-semibold hover:text-[#1ACB0A] text-lg"
                  href="/register"
                >
                  Buat Akun
                </a>
                <a
                  className="text-[#CECECE] font-semibold hover:text-[#1ACB0A] text-lg"
                  href="/reset-password"
                >
                  Lupa Password ?
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:block w-full flex-[0.8] bg-indigo-700 p-[71px]">
        <div className="bg-[#ADA3EC] h-full rounded-3xl flex flex-col relative">
          <p className="text-[25px] px-[43px] py-[43px] xl:px-[81px] xl:text-[32px] font-bold text-white">
            Optimalkan Efisiensi Transaksi, Tingkatkan Keuntungan
          </p>
          <div className="absolute top-[42%] -left-8 overflow-hidden">
            <img
              src={MiniLogo}
              className="w-16 h-16 object-cover"
              alt="mini-logo"
            />
          </div>
          <div className="overflow-hidden self-end flex-1 absolute bottom-0 h-[70%]">
            <img
              className="w-full h-full object-contain group-hover:scale-125 group-hover:rotate-3 duration-500"
              src={ImageUser}
              alt="logo-person"
            />
          </div>
        </div>
      </div>

      {/* Pop Up Error Login */}
      {showPopUp === "error" && (
        <PopUp
          title="Error Login"
          desc={mutateLogin?.error?.response?.data?.error || ""}
          btnAccText="Tutup"
          btnCloseText="Coba Lagi"
          withButton
          onCloseIcon={() => setShowPopUp("")}
        />
      )}

      {/* Pop up Success Login */}
      {showPopUp === "success" && (
        <PopUp title="Sukses Login" desc="Login Sukses" withButton={false} />
      )}
    </div>
  );
}

export default Login;

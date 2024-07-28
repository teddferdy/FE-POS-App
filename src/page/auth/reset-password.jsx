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
import { resetPassword } from "../../services/auth";

const validate = (values) => {
  const errors = {};
  if (!values.userName) {
    errors.userName = "Tidak Boleh Kosong";
  }

  if (!values.password) {
    errors.password = "Tidak Boleh Kosong";
  }

  if (!values.oldPassword) {
    errors.oldPassword = "Tidak Boleh Kosong";
  }

  return errors;
};

const ResetPassword = () => {
  const [showPopUp, setShowPopUp] = useState("");
  const { setActive } = useLoading();
  const navigate = useNavigate();

  // QUERY
  const mutateResetPassword = useMutation(resetPassword, {
    onMutate: () => setActive(true),
    onSuccess: () => {
      setShowPopUp("success");
      setActive(false);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
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
      oldPassword: "",
    },
    validate,
    onSubmit: (values) => mutateResetPassword.mutate(values),
  });

  return (
    <div className="flex h-screen justify-between">
      <div className="w-full flex flex-col flex-1 rounded p-[61px]">
        <img src={Logo} className="w-1/4" alt="logo" />
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-1/2 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">
            Lupa Password
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
                Password Lama :
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

            <div className="flex flex-col gap-3">
              <label
                className="block text-[#828282] text-lg font-semibold"
                htmlFor="oldPassword"
              >
                Password Baru :
              </label>
              <input
                className="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="password"
                id="oldPassword"
                name="oldPassword"
                onChange={formik.handleChange}
                value={formik.values.oldPassword}
              />
              {formik.errors.oldPassword ? (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.oldPassword}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
              >
                Submit
              </button>
              <div className="flex justify-center items-center">
                <p className="text-[#CECECE] font-semibold text-lg">
                  Kembali Ke
                  <a className="text-[#6853F0] hover:text-[#1ACB0A]" href="/">
                    Login
                  </a>
                </p>
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
          <img
            src={MiniLogo}
            className="mi-h-16 min-w-16 max-w-20 max-h-20 absolute top-[42%] -left-8"
            alt="mini-logo"
          />
          <div className="overflow-hidden self-end flex-1 absolute bottom-0 h-[70%]">
            <img
              className="w-full h-full object-contain group-hover:scale-125 group-hover:rotate-3 duration-500"
              src={ImageUser}
              alt="image-user"
            />
          </div>
        </div>
      </div>

      {/* Pop Up Error Login */}
      {showPopUp === "error" && (
        <PopUp
          title="Reset Password Gagal"
          desc={mutateResetPassword?.error?.response?.data?.error || ""}
          btnAccText="Tutup"
          btnCloseText="Coba Lagi"
          withButton
          onCloseIcon={() => setShowPopUp("")}
        />
      )}

      {/* Pop up Success Login */}
      {showPopUp === "success" && (
        <PopUp
          title="Sukses Reset Password"
          desc="Reset Password Berhasil"
          withButton={false}
        />
      )}
    </div>
  );
};

export default ResetPassword;

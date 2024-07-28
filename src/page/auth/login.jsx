import React, { useState } from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// Assets
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";

// Component
import Input from "../../components/atom/input";
import PopUp from "../../components/organism/pop-up";
import { useLoading } from "../../components/organism/loading";

// Services
import { login } from "../../services/auth";

const validate = (values) => {
  const errors = {};
  if (!values.userName) {
    errors.userName = "Tidak Boleh Kosong";
  }

  if (!values.password) {
    errors.password = "Tidak Boleh Kosong";
  }

  return errors;
};

const Login = () => {
  const [showPopUp, setShowPopUp] = useState("");
  const { setActive } = useLoading();
  const navigate = useNavigate();

  // QUERY
  const mutateLogin = useMutation(login, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        setShowPopUp("success");
      }, 1000);
      setTimeout(() => {
        navigate("/home");
        setShowPopUp("");
        setActive(null, null);
      }, 2000);
    },
    onError: () => {
      setActive(false, "error");
      setTimeout(() => {
        setShowPopUp("error");
      }, 1500);
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
            <Input
              placeholder="Masukan User Name Anda"
              label="User Name"
              error={formik.errors.userName}
              errorLabel={formik.errors.userName}
              htmlFor="userName"
              id="userName"
              name="userName"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.userName}
            />

            <Input
              placeholder="Masukan Password Anda"
              label="Password"
              error={formik.errors.password}
              errorLabel={formik.errors.password}
              htmlFor="password"
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />

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
          title="Gagal Login"
          desc={mutateLogin?.error?.response?.data?.error || ""}
          btnAccText="Tutup"
          btnCloseText="Coba Lagi"
          withButton
          onCloseIcon={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
          funcBtnClose={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
          funcBtnAcc={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
        />
      )}

      {/* Pop up Success Login */}
      {showPopUp === "success" && (
        <PopUp title="Sukses Login" desc="Login Sukses" withButton={false} />
      )}
    </div>
  );
};

export default Login;

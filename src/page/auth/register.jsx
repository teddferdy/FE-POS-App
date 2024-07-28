import React, { useState } from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// Assets
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";

// Component
import Input from "../../components/molecule/input";
import PopUp from "../../components/organism/pop-up";
import { useLoading } from "../../components/organism/loading";

// Services
import { register } from "../../services/auth";

const validate = (values) => {
  const errors = {};
  if (!values.userName) {
    errors.userName = "Tidak Boleh Kosong";
  }

  if (!values.password) {
    errors.password = "Tidak Boleh Kosong";
  }

  if (!values.confirmationPassword) {
    errors.confirmationPassword = "Tidak Boleh Kosong";
  }

  if (values.password !== values.confirmationPassword) {
    errors.confirmationPassword = "Password Tidak Sama";
  }

  return errors;
};

const Register = () => {
  const [showPopUp, setShowPopUp] = useState("");
  const { setActive } = useLoading();
  const navigate = useNavigate();

  // QUERY
  const mutateRegister = useMutation(register, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        setShowPopUp("success");
      }, 1000);
      setTimeout(() => {
        navigate("/");
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
      confirmationPassword: "",
    },
    validate,
    onSubmit: (values) => mutateRegister.mutate(values),
  });

  return (
    <div className="flex h-screen justify-between">
      <div className="w-full flex flex-col flex-1 rounded p-[61px]">
        <img src={Logo} className="w-1/4" alt="logo" />
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-1/2 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">
            Buat Akun
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

            <Input
              placeholder="Masukan Konfirmasi Password Anda"
              label="Konfirmasi Password"
              error={formik.errors.confirmationPassword}
              errorLabel={formik.errors.confirmationPassword}
              htmlFor="confirmationPassword"
              id="confirmationPassword"
              name="confirmationPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmationPassword}
            />

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
              >
                Regiter
              </button>
              <div className="flex justify-center items-center">
                <p className="text-[#CECECE] font-semibold text-lg">
                  Jika sudah punya akun, silahkan
                  <a
                    className="text-[#6853F0] hover:text-[#1ACB0A]  ml-2"
                    href="/"
                  >
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
            alt="mini-logo"
            className="mi-h-16 min-w-16 max-w-20 max-h-20 absolute top-[42%] -left-8"
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
          title="Gagal Mendaftar"
          desc={mutateRegister?.error?.response?.data?.error || ""}
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
        <PopUp
          title="Sukses Mendaftar"
          desc="Sukses Mendaftar"
          withButton={false}
        />
      )}
    </div>
  );
};

export default Register;

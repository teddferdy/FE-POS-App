import React from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
// import { useNavigate } from "react-router-dom";

// Assets
// import ImageUser from "../../assets/logo-auth.png";
// import MiniLogo from "../../assets/mini-logo.png";
// import Logo from "../../assets/logo.png";

// Component
import Input from "../../atom/input";
// import PopUp from "../../components/organism/pop-up";
import { useLoading } from "../../organism/loading";

// Services
import { login } from "../../../services/auth";

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

const AddProduct = () => {
  //   const [showPopUp, setShowPopUp] = useState("");
  const { setActive } = useLoading();
  //   const navigate = useNavigate();

  // QUERY
  const mutateLogin = useMutation(login, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      //   setActive(false, "success");
      //   setTimeout(() => {
      //     setShowPopUp("success");
      //   }, 1000);
      //   setTimeout(() => {
      //     navigate("/home");
      //     setShowPopUp("");
      //     setActive(null, null);
      //   }, 2000);
    },
    onError: () => {
      //   setActive(false, "error");
      //   setTimeout(() => {
      //     setShowPopUp("error");
      //   }, 1500);
    }
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: ""
    },
    validate,
    onSubmit: (values) => mutateLogin.mutate(values)
  });

  return (
    <div className="flex flex-col h-screen items-center pt-8">
      <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">Login</p>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 w-3/4">
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

        <button
          type="submit"
          className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200 mb-10">
          Login
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

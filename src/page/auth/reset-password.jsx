import React from "react";
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";

function ResetPassword() {
  return (
    <div class="flex h-screen justify-between">
      <div class="w-full flex flex-col flex-1 rounded p-[61px]">
        <img src={Logo} class="w-1/4" />
        <div class="flex m-auto flex-col w-full md:w-10/12 xl:w-1/2 gap-11">
          <p class="text-[#636363] text-[32px] font-semibold leading-[48px]">
            Lupa Password
          </p>
          <form action="/login" method="POST" class="flex flex-col">
            <div class="flex flex-col gap-3">
              <label
                class="block text-[#828282] text-lg font-semibold"
                for="username"
              >
                Username
              </label>
              <input
                class="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="text"
                name="username"
              />
            </div>
            <div class="flex flex-col gap-3">
              <label
                class="block text-[#828282] text-lg font-semibold"
                for="password"
              >
                Password Lama
              </label>
              <input
                class="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="password"
                name="password"
              />
            </div>
            <div class="flex flex-col gap-3 <% if(!error.length > 0){ %>mb-11<% } else { %>mb-[11px]<% } %>">
              <label
                class="block text-[#828282] text-lg font-semibold"
                for="password"
              >
                Password Baru
              </label>
              <input
                class="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="password"
                name="password"
                id="password"
              />
              <div class="flex items-center gap-3 mb-[11px]">
                <input
                  class="p-2 border-2 w-[18px] h-[18px] bg-white"
                  type="checkbox"
                  name="showPassword"
                  id="showPassword"
                />
                <label
                  class="block text-[#828282] text-lg font-semibold"
                  for="password"
                >
                  Tampilkan Kata Sandi
                </label>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <button
                type="submit"
                class="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
              >
                Submit
              </button>
              <div class="flex justify-center items-center">
                <p class="text-[#CECECE] font-semibold text-lg">
                  Kembali Ke
                  <a class="text-[#6853F0] hover:text-[#1ACB0A]" href="/">
                    Login
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="hidden lg:block w-full flex-[0.8] bg-indigo-700 p-[71px]">
        <div class="bg-[#ADA3EC] h-full rounded-3xl flex flex-col relative">
          <p class="text-[25px] px-[43px] py-[43px] xl:px-[81px] xl:text-[32px] font-bold text-white">
            Optimalkan Efisiensi Transaksi, Tingkatkan Keuntungan
          </p>
          <img src={MiniLogo} class="h-16 w-16 absolute top-[42%] -left-8" />
          <div class="overflow-hidden self-end flex-1 absolute bottom-0 h-[70%]">
            <img
              class="w-full h-full object-contain group-hover:scale-125 group-hover:rotate-3 duration-500"
              src={ImageUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

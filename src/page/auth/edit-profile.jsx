import React from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCookies } from "react-cookie";

// Component
import DialogCancelForm from "../../components/organism/dialog/dialogCancelForm";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import TemplateContainer from "../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel } from "../../components/ui/form";
import AvatarUser from "../../components/organism/avatar-user";

import { generateLinkImageFromGoogleDrive } from "../../utils/generateLinkImageFromGoogleDrive";
import DialogCarouselImage from "../../components/organism/dialog/dialog-carousel-image";
import Hint from "../../components/organism/label/hint";

const EditProfile = () => {
  const navigate = useNavigate();

  const [cookie] = useCookies(["user"]);
  console.log("cookie =>", cookie);

  const formSchema = z.object({
    image: z.string(),
    userName: z.string(),
    phoneNumber: z.string()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      userName: "",
      phoneNumber: ""
    }
  });

  const onSubmit = (values) => {
    console.log("VALUES =>", values);
    // return mutateLogin.mutate(values);
  };

  return (
    <TemplateContainer>
      <div className="border-t-2 border-[#ffffff10] flex flex-col gap-8 no-scrollbar">
        <div className="h-52 lg:h-48 w-full bg-[#6853F0] relative">
          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 ">
            {form.getValues("image") ? (
              <Avatar>
                <AvatarImage
                  src={`${generateLinkImageFromGoogleDrive(form.getValues("image"))}`}
                  alt="Selected"
                />
              </Avatar>
            ) : (
              <AvatarUser size={36} classNameContainer="w-36 h-36" showIndicatorOnline={false} />
            )}
          </div>
        </div>
        <div className="w-full lg:w-3/4 mx-auto p-4 mt-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const linkName = generateLinkImageFromGoogleDrive(field.value);
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Image Product</FormLabel>
                      </div>
                      <div className="flex-col md:flex justify-between gap-10">
                        <div className="flex flex-col gap-4">
                          <div className="relative w-full">
                            <Input
                              type="text"
                              {...field}
                              className="flex-1"
                              placeholder="Enter Image URL"
                            />
                            <div className="absolute right-0 top-0 h-full w-10 text-gray-400 cursor-pointer bg-slate-300 flex justify-center items-center rounded-lg">
                              <DialogCarouselImage />
                            </div>
                          </div>
                          <Hint>Image URL in Google Drive</Hint>
                        </div>
                        {linkName && (
                          <div className="flex flex-col gap-4">
                            <p>Result Image</p>
                            <div className="w-full md:w-72 h-auto mt-10 md:mt-0 border-4 border-dashed border-gray-500 rounded-lg p-2">
                              <img
                                src={`${linkName}`}
                                alt={linkName}
                                className="w-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">User Name</FormLabel>
                    </div>
                    <div className="relative">
                      <Input type="text" {...field} />
                      <div className="absolute top-[24%] right-[4%]"> </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Email</FormLabel>
                    </div>
                    <Input type="email" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Address</FormLabel>
                    </div>
                    <Input type="address" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Gender</FormLabel>
                    </div>
                    <div className="mt-4">
                      <select
                        id="role"
                        value={field.value}
                        onChange={field.onChange}
                        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline">
                        <option value="super-admin">Male</option>
                        <option value="admin">Female</option>
                      </select>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Phone Number</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <div className="flex justify-between items-center">
                  <DialogCancelForm
                    handleBack={() => navigate("/home")}
                    classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                    titleDialog="Apakah Anda Ingin Membatalkan Ini"
                    titleButtonTrigger="Cancel"
                  />
                  <Button
                    type="submit"
                    className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </TemplateContainer>
  );
};

export default EditProfile;

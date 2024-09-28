import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Component
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import TemplateContainer from "../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel } from "../../components/ui/form";
import AvatarUser from "../../components/organism/avatar-user";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

const EditProfile = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const formSchema = z.object({
    image: z
      .any()
      .refine((files) => {
        return files?.[0]?.size <= MAX_FILE_SIZE;
      }, `Max image size is 5MB.`)
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      ),
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
      <main className="border-t-2 border-[#ffffff10] overflow-scroll flex flex-col gap-8 h-full">
        <section>
          <div className="h-52 lg:h-48 w-full bg-[#6853F0] relative">
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 ">
              {selectedImage ? (
                <Avatar>
                  <AvatarImage src={URL.createObjectURL(selectedImage)} alt="Selected" />
                </Avatar>
              ) : (
                <AvatarUser size={36} classNameContainer="w-36 h-36" showIndicatorOnline={false} />
              )}
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-24 mx-auto lg:w-3/6 w-3/4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Change Image</FormLabel>
                    </div>
                    <Input
                      {...field}
                      placeholder="Picture"
                      type="file"
                      accept="image/*"
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        setSelectedImage(e.target.files?.[0] || null);
                      }}
                    />
                  </FormItem>
                )}
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
                    <Input type="address" {...field} />
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
              <Button
                type="submit"
                className="py-2 lg:col-span-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                Edit Profile
              </Button>
            </form>
          </Form>
        </section>
      </main>
    </TemplateContainer>
  );
};

export default EditProfile;

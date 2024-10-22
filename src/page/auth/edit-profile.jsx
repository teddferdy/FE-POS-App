import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import TemplateContainer from "../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel } from "../../components/ui/form";
import AvatarUser from "../../components/organism/avatar-user";
import DatePicker from "../../components/organism/date-picker";
import { format } from "date-fns";

const EditProfile = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const formSchema = z.object({
    image: z.string().optional(),
    userName: z.string(),
    email: z.string().email(),
    address: z.string(),
    gender: z.enum(["Male", "Female"]),
    phoneNumber: z.string().regex(/^\d+$/, "Phone number must be numeric"),
    employeeID: z.string(),
    dateOfBirth: z.string()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      userName: "John Doe",
      email: "johndoe@example.com",
      address: "",
      gender: "Male",
      phoneNumber: "",
      employeeID: "EMP123456",
      dateOfBirth: ""
    }
  });

  const onSubmit = (values) => {
    console.log("Form Values =>", values);
    // Handle form submission logic
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <TemplateContainer>
      <div className="border-t-2 border-[#ffffff10] flex flex-col gap-8 no-scrollbar">
        <div className="h-52 lg:h-48 w-full bg-[#6853F0] relative">
          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
            {form.getValues("image") ? (
              <Avatar>
                <AvatarImage src={imagePreview} alt="Profile" />
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
              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => {
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Profile Image</FormLabel>
                      </div>
                      <div className="flex-col md:flex justify-between gap-10">
                        <div className="flex flex-col gap-4">
                          <div className="relative w-full">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="file:cursor-pointer file:px-4 file:rounded-lg file:border-none file:bg-blue-700 file:text-white hover:file:bg-blue-600 file:h-full p-0 h-10"
                              placeholder="imageName"
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  );
                }}
              />

              {/* User Name - View Only */}
              <FormField
                control={form.control}
                name="userName"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">User Name</FormLabel>
                    </div>
                    <p className="border px-3 py-2 rounded bg-gray-100">
                      {form.getValues("userName")}
                    </p>
                  </FormItem>
                )}
              />

              {/* Email - View Only */}
              <FormField
                control={form.control}
                name="email"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Email</FormLabel>
                    </div>
                    <p className="border px-3 py-2 rounded bg-gray-100">
                      {form.getValues("email")}
                    </p>
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Address</FormLabel>
                    </div>
                    <Textarea {...field} placeholder="Enter your address" />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Gender</FormLabel>
                    </div>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className="block appearance-none w-full bg-white border border-gray-300 px-4 py-2 rounded">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </FormItem>
                )}
              />

              {/* Phone Number - Numeric Only */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Phone Number</FormLabel>
                    </div>
                    <Input type="tel" {...field} placeholder="Enter numeric phone number" />
                  </FormItem>
                )}
              />

              {/* Employee ID - View Only */}
              <FormField
                control={form.control}
                name="employeeID"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Employee ID</FormLabel>
                    </div>
                    <p className="border px-3 py-2 rounded bg-gray-100">
                      {form.getValues("employeeID")}
                    </p>
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Date of Birth</FormLabel>
                    </div>
                    <DatePicker
                      onSelectDate={(date) => field.onChange(format(date, "yyyy-MM-dd"))}
                    />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="col-span-2">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A]">
                    Save Changes
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

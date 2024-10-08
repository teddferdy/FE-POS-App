import React, { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { useCookies } from "react-cookie";
import moment from "moment";

const GreetingCard = () => {
  const [cookie] = useCookies(["user"]);

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Function to update greeting based on time of day
    const updateGreeting = () => {
      const currentHour = new Date().getHours(); // Get current hour in 24-hour format

      if (currentHour >= 6 && currentHour < 12) {
        setGreeting("Good Morning");
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    // Function to update current time and date in 24-hour format
    const updateTimeAndDate = () => {
      const now = new Date();

      // Format time in 24-hour format (HH:MM:SS)
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false // This ensures the 24-hour format
      });
      setCurrentTime(timeString);

      // Format date (Weekday, Month Day, Year)
      const dateString = now.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      setCurrentDate(dateString);
    };

    // Initialize greeting, time, and date
    updateGreeting();
    updateTimeAndDate();

    // Update greeting every hour and time/date every second
    const greetingInterval = setInterval(updateGreeting, 3600000); // Update greeting every hour
    const timeInterval = setInterval(updateTimeAndDate, 1000); // Update time every second

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(greetingInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <Card className="p-4 shadow-md rounded-lg bg-white w-full">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">
          Hello {cookie?.user?.userName}, {greeting}!
        </h1>
        <div className="flex flex-col gap-4">
          <p className="text-lg text-gray-500">{moment(currentDate).format("DD MMMM, YYYY")}</p>
          <p className="text-lg text-gray-500 text-right">{currentTime}</p>
        </div>
      </div>
    </Card>
  );
};

export default GreetingCard;

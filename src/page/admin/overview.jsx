import React, { useState } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";

import TemplateContainer from "../../components/organism/template-container";
import ChartCurrentAndSevenDaysBefore from "../../components/organism/chart/ChartCurrentAndSevenDaysBefore";
import OverviewProductList from "../../components/organism/table/overviewProductList";
import OverviewMembertList from "../../components/organism/table/overviewMemberList";
import OverviewCategoryList from "../../components/organism/table/overviewCategoryList";
import OverviewBestSellingList from "../../components/organism/table/overviewBestSelling";
import GreetingCard from "../../components/organism/greeting";
import ChartLineMonth from "../../components/organism/chart/ChartLineMonth";
import BarChartComponent from "../../components/organism/chart/BarChartComponent";
import { DatePickerWithRange } from "../../components/ui/date-picker-range";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";

// Services
import { getYearList } from "../../services/other";
import {
  getDataCurrentYear,
  getDataCurrentNowAndSevenDayBefore,
  getDataCurrentNowAndTwoDayBefore,
  getDataChartByMonth
} from "../../services/chart";
import {
  getTotalEarning,
  getOverviewProduct,
  getOverviewCategory,
  getOverviewMember,
  getListTableMemberList,
  getListTableCategoryList,
  getListTableProductList,
  getListTableBestSellingList
} from "../../services/overview";

// Utils
import { formatCurrencyRupiah } from "../../utils/formatter-currency";
import { useNavigate } from "react-router-dom";

const OverviewPage = () => {
  const navigate = useNavigate();
  const dates = new Date();
  const firtDate = new Date(dates.getFullYear(), dates.getMonth(), 1);
  const lastDate = new Date(dates.getFullYear(), dates.getMonth() + 1, 0);

  const [cookie] = useCookies(["user"]);

  // State
  const [yearNow, setYearNow] = useState(dates.getFullYear());
  const [date, setDate] = useState({
    from: firtDate,
    to: lastDate
  });

  // QUERY
  const getEarning = useQuery(
    ["get-earning"],
    () => getTotalEarning({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const geChartByYear = useQuery(
    ["get-current-year"],
    () => getDataCurrentYear({ year: "2024", location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const overviewProduct = useQuery(
    ["get-overview-product"],
    () => getOverviewProduct({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const overviewCategory = useQuery(
    ["get-overview-category"],
    () => getOverviewCategory({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const overviewMember = useQuery(
    ["get-overview-member"],
    () => getOverviewMember({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const getChartByMonth = useQuery(
    ["get-chart-by-month"],
    () => getDataChartByMonth({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const getDataCurrentNowAndWeekBefore = useQuery(
    ["get-current-now-and-seven-day-before"],
    () => getDataCurrentNowAndSevenDayBefore({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const getDataCurrentNowAndTwoDaysBefore = useQuery(
    ["get-current-now-and-two-day-before"],
    () => getDataCurrentNowAndTwoDayBefore({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const getDataTableBestSelling = useQuery(
    ["get-list-table-best-seliing"],
    () => getListTableBestSellingList({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const tableMemberList = useQuery(
    ["get-list-table-member-list"],
    () => getListTableMemberList({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const tableCategoryList = useQuery(
    ["get-list-table-category-list"],
    () => getListTableCategoryList({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const tableProductList = useQuery(
    ["get-list-table-product-list"],
    () => getListTableProductList({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const getYears = useQuery(["get-year-list"], () => getYearList(), {
    retry: 0
  });

  return (
    <TemplateContainer>
      <div className="border-t-2 border-[#ffffff10] p-4 flex flex-col gap-8 no-scrollbar">
        <GreetingCard />
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Product :</h2>
              <p
                onClick={() => navigate("/product-list")}
                className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center">
                <p>Total All Product</p>
                <p>{overviewProduct?.data?.data?.total}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Product Active</p>
                <p>{overviewProduct?.data?.data?.active}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Product Not Active</p>
                <p>{overviewProduct?.data?.data?.notActive}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-yellow-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Category :</h2>
              <p
                onClick={() => navigate("/category-list")}
                className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center">
                <p>Total All Category</p>
                <p>{overviewCategory?.data?.data?.total}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Category Active</p>
                <p>{overviewCategory?.data?.data?.active}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Category Not Active</p>
                <p>{overviewCategory?.data?.data?.notActive}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-orange-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Member :</h2>
              <p
                onClick={() => navigate("/member-list")}
                className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center">
                <p>Total All Member</p>
                <p>{overviewMember?.data?.data?.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Current & 7 Days Before */}
        <div className="flex flex-col gap-4 lg:flex-row justify-between">
          <div className="p-4 shadow-lg w-full flex-[0.5] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Total Earning Today :</h2>
              <p>{formatCurrencyRupiah(getEarning?.data?.data?.totalEarningToday || 0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <h2>Total Items Checkout Today :</h2>
              <p>{getEarning?.data?.data?.totalSellingToday}</p>
            </div>
            <ChartCurrentAndSevenDaysBefore
              data={getDataCurrentNowAndTwoDaysBefore}
              style={{
                width: "100%",
                height: "44.5vh"
              }}
            />
          </div>
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <h2>Chart Current Date & 7 Days Before :</h2>
            <ChartCurrentAndSevenDaysBefore
              data={getDataCurrentNowAndWeekBefore}
              style={{
                width: "100%",
                height: "50vh"
              }}
            />
          </div>
        </div>

        {/* Chart By Month */}
        <div className="p-4 shadow-lg w-full h-screen rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1>Chart By Month</h1>
            <DatePickerWithRange date={date} setDate={(val) => setDate(val)} />
          </div>

          {/* <BarChartComponent /> */}
          <ChartLineMonth data={getChartByMonth} />
        </div>

        {/* Chart By Year */}
        <div className="p-4 shadow-lg w-full h-screen rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1>Chart By Year</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {yearNow}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={yearNow} onValueChange={setYearNow}>
                  {getYears?.data?.data?.map((column) => {
                    return (
                      <DropdownMenuRadioItem value={column} key={column}>
                        {column}
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* <BarChartComponent /> */}
          <BarChartComponent data={geChartByYear} />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Best Selling List :</h2>
              <p className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <OverviewBestSellingList data={getDataTableBestSelling} />
          </div>
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Category List :</h2>
              <p
                onClick={() => navigate("/category-list")}
                className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <OverviewCategoryList data={tableCategoryList} />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Member List :</h2>
              <p
                onClick={() => navigate("/member-list")}
                className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
                See All
              </p>
            </div>
            <OverviewMembertList data={tableMemberList} />
          </div>
        </div>
        <div className="p-4 shadow-lg w-full h-96 rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2>Product List :</h2>
            <p
              onClick={() => navigate("/product-list")}
              className="cursor-pointer hover:text-white hover:hover:bg-[#1ACB0A] duration-200 p-2 rounded-md">
              See All
            </p>
          </div>
          <OverviewProductList data={tableProductList} />
        </div>
      </div>
    </TemplateContainer>
  );
};

export default OverviewPage;

import React, { useState } from "react";
import { useQuery } from "react-query";
import TemplateContainer from "../../components/organism/template-container";
import ChartCurrentAndSevenDaysBefore from "../../components/organism/chart/ChartCurrentAndSevenDaysBefore";
import OverviewProductList from "../../components/organism/table/overviewProductList";
import OverviewMembertList from "../../components/organism/table/overviewMemberList";
import OverviewCategoryList from "../../components/organism/table/overviewCategoryList";
import OverviewLocationList from "../../components/organism/table/overviewLocationList";
import OverviewBestSellingList from "../../components/organism/table/overviewBestSelling";
// import BarChartComponent from "../../components/organism/chart/BarChartComponent";
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
  getOverviewLocation,
  getOverviewMember,
  getListTableMemberList,
  getListTableCategoryList,
  getListTableLocationList,
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

  // State
  const [yearNow, setYearNow] = useState(dates.getFullYear());
  const [date, setDate] = useState({
    from: firtDate,
    to: lastDate
  });

  // QUERY
  const getEarning = useQuery(["get-earning"], () => getTotalEarning(), {
    retry: 0,
    keepPreviousData: true
  });

  const geChartByYear = useQuery(["get-current-year"], () => getDataCurrentYear({ year: "2024" }), {
    retry: 0,
    keepPreviousData: true
  });

  const overviewProduct = useQuery(["get-overview-product"], () => getOverviewProduct(), {
    retry: 0,
    keepPreviousData: true
  });

  const overviewCategory = useQuery(["get-overview-category"], () => getOverviewCategory(), {
    retry: 0,
    keepPreviousData: true
  });

  const overviewLocation = useQuery(["get-overview-location"], () => getOverviewLocation(), {
    retry: 0,
    keepPreviousData: true
  });

  const overviewMember = useQuery(["get-overview-member"], () => getOverviewMember(), {
    retry: 0,
    keepPreviousData: true
  });

  const getChartByMonth = useQuery(["get-chart-by-month"], () => getDataChartByMonth(), {
    retry: 0,
    keepPreviousData: true
  });

  const getDataCurrentNowAndWeekBefore = useQuery(
    ["get-current-now-and-seven-day-before"],
    () => getDataCurrentNowAndSevenDayBefore(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const getDataCurrentNowAndTwoDaysBefore = useQuery(
    ["get-current-now-and-two-day-before"],
    () => getDataCurrentNowAndTwoDayBefore(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const getDataTableBestSelling = useQuery(
    ["get-list-table-best-seliing"],
    () => getListTableBestSellingList(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const tableMemberList = useQuery(["get-list-table-member-list"], () => getListTableMemberList(), {
    retry: 0,
    keepPreviousData: true
  });

  const tableCategoryList = useQuery(
    ["get-list-table-category-list"],
    () => getListTableCategoryList(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const tableLocationList = useQuery(
    ["get-list-table-location-list"],
    () => getListTableLocationList(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );
  const tableProductList = useQuery(
    ["get-list-table-product-list"],
    () => getListTableProductList(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const getYears = useQuery(["get-year-list"], () => getYearList(), {
    retry: 0,
    keepPreviousData: true
  });

  return (
    <TemplateContainer>
      <div className="border-t-2 border-[#ffffff10] p-4 flex flex-col gap-8 overflow-scroll max-h-full no-scrollbar">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Product :</h2>
              <p onClick={() => navigate("/product-list")} className="cursor-pointer">
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
              <p onClick={() => navigate("/category-list")} className="cursor-pointer">
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
          <div className="p-4 bg-blue-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Outlet / Location :</h2>
              <p onClick={() => navigate("/location-list")} className="cursor-pointer">
                See All
              </p>
            </div>
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center">
                <p>Total All Location</p>
                <p>{overviewLocation?.data?.data?.total}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Location Active</p>
                <p>{overviewLocation?.data?.data?.active}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Location Not Active</p>
                <p>{overviewLocation?.data?.data?.notActive}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-orange-400 rounded-lg flex flex-col gap-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2>Member :</h2>
              <p onClick={() => navigate("/member-list")} className="cursor-pointer">
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
              <p>See All</p>
            </div>
            <OverviewBestSellingList data={getDataTableBestSelling} />
          </div>
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Category List :</h2>
              <p onClick={() => navigate("/category-list")} className="cursor-pointer">
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
              <p onClick={() => navigate("/member-list")} className="cursor-pointer">
                See All
              </p>
            </div>
            <OverviewMembertList data={tableMemberList} />
          </div>
          <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Location List :</h2>
              <p onClick={() => navigate("/location-list")} className="cursor-pointer">
                See All
              </p>
            </div>
            <OverviewLocationList data={tableLocationList} />
          </div>
        </div>
        <div className="p-4 shadow-lg w-full h-96 rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2>Product List :</h2>
            <p onClick={() => navigate("/product-list")} className="cursor-pointer">
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

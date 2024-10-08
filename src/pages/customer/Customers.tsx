import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import "./Customers.scss";
import { useCallback, useEffect, useState } from "react";
import * as customerService from "../../services/customer-service";
import {
  ICustomer,
  ICustomerRequest,
} from "../../interfaces/customer-interface";
import { customerColumns } from "../../components/table/table-data";
import Table from "../../components/table/Table";
import _, { filter } from "lodash";
const listRank = [
  {
    value: "default",
    label: "---none---",
  },
  {
    value: "customer",
    label: "Thành viên",
  },
  {
    value: "silver",
    label: "Bạc",
  },
  {
    value: "gold",
    label: "Vàng",
  },
  {
    value: "diamond",
    label: "Kim",
  },
];

const listCreatedDate = [
  {
    value: "default",
    label: "---none---",
  },
  {
    value: "today",
    label: "Hôm nay",
  },
  {
    value: "yesterday",
    label: "Hôm qua",
  },
  {
    value: "thisWeek",
    label: "Tuần này",
  },
  {
    value: "lastWeek",
    label: "Tuần trước",
  },
  {
    value: "7daysLasted",
    label: "7 ngày gần đây",
  },
  {
    value: "30daysLasted",
    label: "30 ngày gần đây",
  },
  {
    value: "thisMonth",
    label: "Tháng này",
  },
  {
    value: "lastMonth",
    label: "Tháng trước",
  },
];

const listPrice = [
  {
    value: "default",
    label: "---none---",
  },
  {
    value: "ctv",
    label: "Bảng giá CTV",
  },
  {
    value: "ctv1",
    label: "Bảng giá CTV1",
  },
  {
    value: "ctv2",
    label: "Bảng giá CTV2",
  },
  {
    value: "ctv3",
    label: "Bảng giá CTV3",
  },
  {
    value: "ctv4",
    label: "Bảng giá CTV4",
  },
];

const Customers = () => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer[]>();
  const [filtered, setFiltered] = useState<ICustomerRequest>({
    pageSize: 20,
    currentItem: 0,
    orderBy: "createdDate",
    orderDirection: "DESC",
  });

  const handleNameSearch = (values: string) => {
    debouncedNamefilter(values);
  };

  const handlePhoneSearch = (values: string) => {
    debouncedPhonefilter(values);
  };

  const debouncedNamefilter = useCallback(
    _.debounce((values) => setFiltered({ ...filtered, name: values }), 1000), // 500ms debounce
    [filtered]
  );

  const debouncedPhonefilter = useCallback(
    _.debounce(
      (values) => setFiltered({ ...filtered, contactNumber: values }),
      1000
    ), // 500ms debounce
    [filtered]
  );

  const handleGetCustomer = () => {
    customerService.getCustomerFromKiot(filtered).then((res) => {
      if (res) {
        setCustomers(res.data);
        setTotal(res.total);
      }
      setTimeout(() => {
        setLoading(false);
      }, 700);
    });
  };

  const handleSetCurrentItem = useCallback(
    _.debounce((index) => {
      console.log("debounced setCurrentItem: ", index);
      setFiltered({ ...filtered, currentItem: index });
    }, 500),
    [filtered]
  );

  useEffect(() => {
    setLoading(true);
    handleGetCustomer();
  }, [filtered]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-title"> Danh sách khách hàng</div>
      </div>
      <div className="page-contents">
        <div className="Customer">
          <div className="Customer__filter">
            <div className="Customer__filter-item">
              <TextField
                id="outlined-basic"
                label="Tìm kiếm theo tên"
                variant="outlined"
                disabled={loading}
                size="small"
                onChange={(e) => handleNameSearch(e.target.value)}
              />
            </div>
            <div className="Customer__filter-item">
              <TextField
                id="outlined-basic"
                label="Tìm kiếm theo sđt"
                variant="outlined"
                disabled={loading}
                size="small"
                onChange={(e) => handlePhoneSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="">
            <Table
              currentItem={filtered.currentItem}
              isLoading={loading}
              total={total}
              pageSize={filtered.pageSize}
              handleSetCurrentItem={handleSetCurrentItem}
              columns={customerColumns}
              rows={customers}
              setSelection={setSelectedCustomer}
              className="DataTable"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;

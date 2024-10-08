import { Button, MenuItem, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Table from "../../components/table/Table";
import { productColumns } from "../../components/table/table-data";
import { ICollections } from "../../interfaces/collection-interface";
import { IKiotResponse, ISelectOptions } from "../../interfaces/common";
import {
  IProductRequest,
  IProductResponse,
} from "../../interfaces/product-interface";
import * as collectionServices from "../../services/collection-service";
import * as productService from "../../services/product-service";
import "./Products.scss";
import CircularProgress from "@mui/material/CircularProgress";
import * as _ from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import * as RoutePaths from "../../routes/paths";

const listStatus: ISelectOptions[] = [
  {
    value: "default",
    label: "---none---",
  },
  {
    value: "visible",
    label: "Đang hiện",
  },
  {
    value: "invisible",
    label: "Đang ẩn",
  },
];

const initialFilter = {
  pageSize: 20,
  currentItem: 0,
  categoryId: import.meta.env.VITE_COLLECTION_PARENT_ID,
  orderBy: "createdDate",
  orderDirection: "DESC",
  name: "",
  isActive: "",
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | undefined>(0);
  const [products, setProducts] = useState<IProductResponse[]>([]);
  const [collections, setCollections] = useState<ISelectOptions[]>([]);
  const [firstTime, setFirstTime] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<IProductResponse[]>(
    []
  );
  const [collectionId, setCollectionId] = useState(location.state?.categoryId);

  const [filtered, setFiltered] = useState<IProductRequest>(initialFilter);

  const convertToSelectOptions = (data: ICollections[], getChildren = true) => {
    const result: ISelectOptions[] = [
      {
        value: "default",
        label: "---none---",
      },
    ];

    data.map((d) => {
      result.push({
        value: d.categoryId,
        label: d.categoryName,
      });
      if (d.children && d.children.length > 0 && getChildren) {
        d.children.map((c: ICollections) => {
          result.push({
            value: c.categoryId,
            label: `--> ${c.categoryName}`,
          });
        });
      }
    });
    return result;
  };

  const handleInputSearchText = (values: string) => {
    debouncedFetch(values);
  };

  const debouncedFetch = useCallback(
    _.debounce((values) => setFiltered({ ...filtered, name: values }), 1000), // 500ms debounce
    [filtered]
  );

  const handleGetProducts = () => {
    productService
      .getProducts(filtered)
      .then((res: IKiotResponse<IProductResponse> | undefined) => {
        if (res && products) {
          setProducts(res.data);
          setTotal(res?.total);
          setFirstTime(false);
        }
        setTimeout(() => {
          setLoading(false);
        }, 700);
      });
  };

  const handleGetCollections = () => {
    collectionServices.getCollections().then((data) => {
      localStorage.setItem("collections", JSON.stringify(data?.children));
      setCollections(convertToSelectOptions(data?.children || []));
      if (collectionId) {
        setFiltered({ ...filtered, categoryId: collectionId });
      }
    });
  };

  const handleNavigateCreateProductPage = () => {
    navigate(RoutePaths.PRODUCTS_CREATE);
  };

  const handleSetCurrentItem = useCallback(
    _.debounce((index) => {
      console.log("debounced setCurrentItem: ", index);
      setFiltered({ ...filtered, currentItem: index });
    }, 500),
    [filtered]
  );

  useEffect(() => {
    if (
      collectionId &&
      filtered.categoryId === import.meta.env.VITE_COLLECTION_PARENT_ID
    ) {
      console.log("do nothing");
    } else {
      setLoading(true);
      handleGetProducts();
    }
  }, [filtered]);

  useEffect(() => {
    handleGetCollections();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-title">Danh sách sản phẩm</div>
        <div className="page-header-actions">
          <div className="add-action">
            <Button
              variant="contained"
              onClick={handleNavigateCreateProductPage}
            >
              Tạo sản phẩm mới
            </Button>
          </div>
        </div>
      </div>
      <div className="page-contents">
        <div className="Products">
          <div className="Products__filter">
            <div className="Products__filter-item">
              <TextField
                id="outlined-basic"
                label="Tìm kiếm"
                variant="outlined"
                disabled={loading}
                size="small"
                onChange={(e) => handleInputSearchText(e.target.value)}
              />
            </div>
            <div className="Products__filter-item">
              <TextField
                id="outlined-select-currency"
                select
                label="Trạng thái"
                size="small"
                defaultValue="default"
                disabled={loading}
                helperText=""
                onChange={(event) => {
                  console.log(event.target.value);
                  if (event.target.value === "visible") {
                    setFiltered({ ...filtered, isActive: true });
                  } else if (event.target.value === "invisible") {
                    setFiltered({ ...filtered, isActive: false });
                  } else if (event.target.value === "default") {
                    setFiltered({ ...filtered, isActive: "" });
                  }
                }}
              >
                {listStatus.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="Products__filter-item">
              <TextField
                id="outlined-select-currency"
                select
                label="Danh mục"
                size="small"
                defaultValue={collectionId ? collectionId : "default"}
                disabled={loading}
                helperText=""
                onChange={(event) => {
                  setCollectionId(undefined);
                  if (event.target.value !== "default") {
                    setFiltered({
                      ...filtered,
                      categoryId: event.target.value,
                    });
                  } else {
                    setFiltered(initialFilter);
                  }
                }}
              >
                {collections.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <div className="Products__table">
            <Table
              currentItem={filtered.currentItem}
              isLoading={loading}
              total={total}
              pageSize={filtered.pageSize}
              handleSetCurrentItem={handleSetCurrentItem}
              columns={productColumns}
              rows={products}
              setSelection={setSelectedProduct}
              className="DataTable"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

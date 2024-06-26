import { Fragment, useEffect, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/img/logo.png";
import { Logout } from "@/services/auth/signout";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/slice/authSlice";
import {
  Button,
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Image,
  Dropdown,
  Modal,
  Input,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TableOutlined,
  TransactionOutlined,
  FileTextOutlined,
  ReadOutlined,
  UserSwitchOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  DashboardOutlined,
  SettingOutlined,
  RetweetOutlined,
  MenuOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { FloatButton } from "antd";
import Marquee from "react-fast-marquee";
import { createSchoolyear } from "@/services/schoolyear";
import { toast } from "react-toastify";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Dashboard", "/dashboard", <DashboardOutlined />, [
    getItem("Overview", "/dashboard"),
    getItem("User", "/dashboard/user"),
    getItem("Fee", "/dashboard/fee"),
  ]),
  getItem("Người dùng", "/user", <UserOutlined />),
  getItem("Quan hệ", "/parent_student", <UserSwitchOutlined />),
  getItem("Lớp học", "/class", <TableOutlined />),
  getItem("Môn học", "/subject", <BookOutlined />),
  getItem("Khoảng phí", "/fee", <TransactionOutlined />),
  getItem("Điểm", "/mark", <FileTextOutlined />),
  getItem("Bài tập", "/assignment", <ReadOutlined />),
  getItem("Vai trò", "/role", <SettingOutlined />),
  getItem("Tin tức", "/admin/news", <NotificationOutlined />),
];
const navigation = [
  {
    name: "Người dùng",
    link: "/user",
    imgIcon: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
  },
  {
    name: "Lớp học",
    link: "/class",
    imgIcon: "https://cdn-icons-png.flaticon.com/512/45/45962.png",
  },
  {
    name: "Môn Học",
    link: "/subject",
    imgIcon: "https://static.thenounproject.com/png/3858302-200.png",
  },
  {
    name: "Khoảng phí",
    link: "/fee",
    imgIcon:
      "https://cdn3.iconfinder.com/data/icons/fees-payment/741/service_fees_plan_charge-512.png",
  },
  {
    name: "Điểm",
    link: "/mark",
    imgIcon: "https://cdn-icons-png.flaticon.com/512/2343/2343465.png",
  },
  {
    name: "Bài tập",
    link: "/assignment",
    imgIcon: "https://cdn-icons-png.flaticon.com/512/3775/3775707.png",
  },
  {
    name: "Vai trò",
    link: "/role",
    imgIcon: "https://static.thenounproject.com/png/281793-200.png",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function mapPath(path) {
  if (path.startsWith("/subject/")) {
    return "/subject";
  }
  if (path.startsWith("/user/")) {
    return "/user";
  }
  if (path.startsWith("/class")) {
    return "/class";
  }
  if (path.startsWith("/assignment/")) {
    return "/assignment";
  }
  if (path.startsWith("/fee/")) {
    return "/fee";
  }
  if (path.startsWith("/admin/news")) {
    return "/admin/news";
  }

  return path;
}

export default function Example({ children }) {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  let location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [text, setText] = useState("Loading...");
  const [confirmloading, setConfirmloading] = useState(false);
  const [schoolyear, setSchoolyear] = useState("");

  const handleLogout = async () => {
    const res = await Logout();
    if (+res.code === 0) {
      localStorage.removeItem("token");
      localStorage.setItem("isAuth", false);
      localStorage.setItem("prePath", location.pathname);
      localStorage.setItem("username", "");
      localStorage.setItem("group_id", "");
      localStorage.setItem("role", "");
      localStorage.setItem("preRole", auth.role);
      dispatch(logout());
    }
  };
  const handleOk = async () => {
    setText("Loading...");
    setConfirmloading(true);
    const res = await createSchoolyear(schoolyear);
    if (+res.code === 0) {
      toast.success(res.message);
      setTimeout(() => {
        setOpenModal(false);
        setConfirmloading(false);
      }, 1000);
    } else {
      toast.error(res.message);
      setTimeout(() => {
        setConfirmloading(false);
      }, 1000);
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dropdownItems = [
    {
      label: "Profile",
      key: `/user/profile/${auth.id}`,
      icon: <UserOutlined />,
    },
    {
      label: "Dashboard",
      key: "/dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: "Đổi mật khẩu",
      key: "/changepassword",
      icon: <RetweetOutlined />,
    },
    {
      label: "Logout",
      key: "/logout",
      icon: <LogoutOutlined />,
    },
  ];
  const handleMenuClick = (e) => {
    if (e.key === "/logout") {
      handleLogout();
    }
    navigate(e.key);
  };
  const menu = <Menu onClick={handleMenuClick} items={dropdownItems} />;
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((snippet, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return <Breadcrumb.Item key={url}>{snippet}</Breadcrumb.Item>;
  });
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          position: "fixed", // Fix the position of the sidebar
          height: "100vh", // Make sure it covers the full height of the viewport
          overflowY: "auto", // Enable vertical scrolling
        }}
        className="custom-sider"
      >
        <div className="demo-logo-vertical flex justify-center items-center py-5 ">
          <img
            src={logo}
            className="w-1/2 h-auto hover:cursor-pointer"
            onClick={() => navigate("/")}
          ></img>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[`${location.pathname}`]}
          selectedKeys={[mapPath(location.pathname)]}
          defaultOpenKeys={["/dashboard"]}
          mode="inline"
          items={items}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-between items-center pr-4">
            <Marquee className="flex-1">
              Chào mừng đến với website trường Trường THPT Nguyễn Hiền
            </Marquee>
            <div className="h-9 border"></div>
            {auth.isAuth ? (
              <div className="flex items-end space-x-2 pl-1">
                <div className="flex-col">
                  <div className="text-xs">Welcome</div>
                  <div className="text-xs">{auth.name}</div>
                </div>
                <Dropdown overlay={menu} placement="bottomRight">
                  <Button icon={<UserOutlined />}></Button>
                </Dropdown>
              </div>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            {breadcrumbItems}
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Trường THPT Nguyễn Hiền, Duy Sơn, Duy Xuyên, Quảng Nam
        </Footer>
      </Layout>
      <Modal
        title="Tạo năm học"
        open={openModal}
        onOk={() => {
          handleOk();
        }}
        onCancel={() => {
          setOpenModal(false);
        }}
        confirmloading={confirmloading}
        width={300}
      >
        {confirmloading ? (
          <p>{text}</p>
        ) : (
          <div className="flex flex-row space-x-2">
            <p className="flex w-1/3 items-center justify-center">Năm học</p>
            <Input
              placeholder="Năm học"
              value={schoolyear}
              onChange={(e) => {
                setSchoolyear(e.target.value);
              }}
              className="w-2/3"
            ></Input>
          </div>
        )}
      </Modal>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ right: 24 }}
        icon={<MenuOutlined />}
      >
        <FloatButton
          icon={<FieldTimeOutlined />}
          tooltip={<div>Tạo năm học</div>}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </FloatButton.Group>
    </Layout>
  );
}

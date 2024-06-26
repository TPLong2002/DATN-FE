import React, { useEffect, useState, useRef } from "react";
import { createUser } from "@/services/user";
import { getGroups } from "@/services/group";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { getAllSchoolyear } from "@/services/schoolyear";
import Papa from "papaparse";
import { Modal, Input, Select, Button } from "antd";
import { toast } from "react-toastify";

const App = (props) => {
  const { fetchData } = props;
  const [users, setUsers] = useState([
    { username: "", password: "", email: "" },
  ]);
  const [groups, setGroups] = useState([{}]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Loading, please wait a moment..."
  );
  const [allSchoolyear, setAllSchoolyear] = useState([{}]);
  // const [importedFile, setImportedFile] = useState(null);
  const fileInputRef = useRef(null); // Use useRef to create a ref

  const fetchGroup = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSchoolyear = async () => {
    const res_schoolyear = await getAllSchoolyear();
    setAllSchoolyear(res_schoolyear.data);
  };
  useEffect(() => {
    fetchGroup();
    fetchSchoolyear();
  }, []);

  const handleOk = async () => {
    setConfirmLoading(true);
    const create = await createUser(users);
    if (+create.code === 0) {
      toast.success(create.message);
      setTimeout(async () => {
        fetchData().then(() => {
          setOpen(false);
          setConfirmLoading(false);
        });
      }, 1000);
    } else {
      toast.error(create.message);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 1000);
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const newUsers = [...users];
    newUsers[index] = { ...users[index], [name]: value };
    setUsers(newUsers);
  };

  const handleSelectChange = (value, index) => {
    const newUsers = [...users];
    newUsers[index] = { ...users[index], group_id: value };
    setUsers(newUsers);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      console.log("File loaded successfully");
      const csv = Papa.parse(target.result, {
        header: true,
      });
      const parsedData = csv?.data.slice(0, csv.data.length - 1);
      setUsers(parsedData);
    };
    reader.readAsText(file);
  };
  const admin = groups?.filter((group) => group.name === "admin");
  const school_staff = groups?.filter((group) => group.name === "teacher");
  const parent_student = groups?.filter(
    (group) => group.name === "student" || group.name === "parent"
  );
  const handleAdd = () => {
    setUsers([...users, { username: "", password: "", email: "" }]);
  };
  const handleDelete = (index) => {
    const newUsers = users.filter((role, i) => i !== index);
    setUsers(newUsers);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const onSchoolyearChange = (value, index) => {
    const newUsers = [...users];
    newUsers[index] = { ...users[index], schoolyear_id: value };
    console.log("newUsers", newUsers);
    setUsers(newUsers);
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Tạo mới người dùng
      </Button>
      <Modal
        title="Tạo mới người dùng"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={[
          <input
            key="file"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: "none" }}
            onChange={handleFileChange}
            ref={fileInputRef} // Assign the ref to the file input
          />,
          <Button
            key="import"
            onClick={() => fileInputRef.current.click()} // Trigger click event of the file input when "Import" button is clicked
            icon={<UploadOutlined />}
          >
            Import
          </Button>,
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            loading={confirmLoading}
          >
            Submit
          </Button>,
        ]}
      >
        {confirmLoading ? (
          <p>{modalText}</p>
        ) : (
          <div>
            {users.map((user, index) => (
              <div key={index} className=" border-t-2 py-3 flex space-x-2">
                <div className="space-y-3 w-11/12">
                  <Input
                    placeholder="Username"
                    name="username"
                    value={user.username}
                    onChange={(e) => handleChange(e, index)}
                  ></Input>
                  <Input
                    placeholder="Password"
                    name="password"
                    value={user.password}
                    onChange={(e) => handleChange(e, index)}
                  ></Input>
                  <Input
                    placeholder="Email"
                    name="email"
                    value={user.email}
                    onChange={(e) => handleChange(e, index)}
                  ></Input>
                  <div className="flex justify-between space-x-4">
                    <Select
                      placeholder="Chọn nhóm quyền"
                      value={+user.group_id || null}
                      name="group_id"
                      style={{ width: "50%" }}
                      onChange={(value) => handleSelectChange(value, index)}
                      options={[
                        {
                          label: <span>Manager</span>,
                          title: "Manager",
                          options: admin.map((ad) => {
                            return {
                              key: ad.id,
                              label: <span>{ad.description}</span>,
                              value: ad.id,
                            };
                          }),
                        },
                        {
                          label: <span>School Staff</span>,
                          title: "School Staff",
                          options:
                            school_staff &&
                            school_staff.map((school) => {
                              return {
                                key: school.id,
                                label: <span>{school.description}</span>,
                                value: school.id,
                              };
                            }),
                        },
                        {
                          label: <span>Student & Parent</span>,
                          title: "Student & Parent",
                          options:
                            parent_student &&
                            parent_student.map((school) => {
                              return {
                                key: school.id,
                                label: <span>{school.description}</span>,
                                value: school.id,
                              };
                            }),
                        },
                      ]}
                    />
                    <Select
                      showSearch
                      placeholder="Chọn năm học"
                      optionFilterProp="children"
                      value={user.schoolyear_id ? +user.schoolyear_id : null}
                      onChange={(value) => onSchoolyearChange(value, index)}
                      onSearch={onSearch}
                      filterOption={filterOption}
                      options={allSchoolyear?.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>

                <Button
                  className="w-1/12"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(index)}
                ></Button>
              </div>
            ))}
            <div className="flex justify-center">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={handleAdd}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default App;

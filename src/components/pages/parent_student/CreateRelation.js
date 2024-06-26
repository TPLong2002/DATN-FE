import React, { useEffect, useState, useRef } from "react";
import { createUser } from "@/services/user";
import { getGroups } from "@/services/group";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { getAllSchoolyear } from "@/services/schoolyear";
import {
  getStudentsBySchoolyear,
  getParentsBySchoolyear,
  addRelation,
} from "@/services/user/parent_student";

import Papa from "papaparse";
import { Modal, Input, Select, Button, Table } from "antd";
import { toast } from "react-toastify";

const App = (props) => {
  const { fetchUser } = props;
  const [users, setUsers] = useState([
    { username: "", password: "", email: "" },
  ]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Loading, please wait a moment..."
  );
  const [allSchoolyear, setAllSchoolyear] = useState([{}]);
  const [selectSchoolyear_student, setSelectSchoolyear_student] = useState();
  const [selectSchoolyear_parent, setSelectSchoolyear_parent] = useState();
  const [parent_students, setParent_students] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allParents, setAllParents] = useState([]);
  const [selectParent, setSelectParent] = useState({
    id: 0,
    name: "Chọn phụ huynh",
  });
  const [selectStudent, setSelectStudent] = useState({
    id: 0,
    name: "Chọn học sinh",
  });
  // const [importedFile, setImportedFile] = useState(null);
  const fileInputRef = useRef(null); // Use useRef to create a ref

  const fetchSchoolyear = async () => {
    const res_schoolyear = await getAllSchoolyear();
    setAllSchoolyear(res_schoolyear.data);
  };
  const fetchAllStudents = async () => {
    const res = await getStudentsBySchoolyear(selectSchoolyear_student);
    setAllStudents(
      res.data.map((item) => ({
        value: item.id,
        label: item.Profile.firstName + " " + item.Profile.lastName,
        studentUsername: item.username,
      }))
    );
  };
  const fetchAllParrents = async () => {
    const res = await getParentsBySchoolyear(selectSchoolyear_parent);
    setAllParents(
      res.data.map((item) => ({
        value: item.id,
        label:
          item?.Profile?.firstName && item?.Profile?.lastName
            ? item?.Profile?.firstName + " " + item?.Profile?.lastName
            : " ",
        parentUsername: item.username,
      }))
    );
  };
  useEffect(() => {
    fetchSchoolyear();
  }, []);
  useEffect(() => {
    if (selectSchoolyear_student) {
      fetchAllStudents();
    }
  }, [selectSchoolyear_student]);
  useEffect(() => {
    if (selectSchoolyear_parent) {
      fetchAllParrents();
    }
  }, [selectSchoolyear_parent]);

  const handleOk = async () => {
    setConfirmLoading(true);
    const create = await addRelation(
      parent_students.map((item) => ({
        student_id: item.student_id,
        parent_id: item.parent_id,
      }))
    );
    if (+create.code === 0) {
      toast.success(create.message);
      setTimeout(async () => {
        fetchUser().then(() => {
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
  const onStudentChange = (value, label) => {
    setSelectStudent({
      id: value,
      name: label.label,
      username: label.studentUsername,
    });
  };
  const onParentChange = (value, label) => {
    setSelectParent({
      id: value,
      name: label.label,
      username: label.parentUsername,
    });
  };
  const handleAddParentStudent = () => {
    if (selectStudent.id === 0 || selectParent.id === 0) return;
    const newParent_students = [
      ...parent_students,
      {
        key: parent_students.length + 1,
        student_id: selectStudent.id,
        studentName: selectStudent.name,
        studentUsername: selectStudent.username,
        parent_id: selectParent.id,
        parentName: selectParent.name,
        parentUsername: selectParent.username,
      },
    ];
    setParent_students(newParent_students);

    const updatedAllStudents = allStudents.filter((student) => {
      // Lọc ra những học sinh không có trong danh sách newStudents
      return !newParent_students.some(
        (newParent_student) => newParent_student.student_id === student.value
      );
    });
    setAllStudents(updatedAllStudents);
    setSelectParent({
      id: 0,
      name: "Chọn phụ huynh",
    });
    setSelectStudent({
      id: 0,
      name: "Chọn học sinh",
    });
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
      const parsedData = csv?.data;
      setParent_students(parsedData);
    };
    reader.readAsText(file);
  };

  const handleDelete = (index) => {
    const newUsers = parent_students.filter((role, i) => i !== index);
    setParent_students(newUsers);
    Promise.all([fetchAllParrents(), fetchAllStudents()]);
  };

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const onSchoolyear_studentChange = (value, index) => {
    setSelectSchoolyear_student(value);
  };
  const onSchoolyear_parentChange = (value, index) => {
    setSelectSchoolyear_parent(value);
  };
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Tạo mới quan hệ
      </Button>
      <Modal
        title="Thêm phụ huynh - học sinh"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={800}
        footer={[
          <input
            key="file"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: "none" }}
            onChange={handleFileChange}
            ref={fileInputRef}
          />,
          <Button
            key="import"
            onClick={() => fileInputRef.current.click()}
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
          <div className="flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="flex space-x-4 w-11/12">
                <div className="flex-col w-1/2 border-2 p-1 justify-center items-center space-y-2">
                  <p className="text-center">Chọn học sinh</p>
                  <div className="flex space-x-4">
                    <Select
                      showSearch
                      placeholder="Chọn năm"
                      optionFilterProp="children"
                      onChange={onSchoolyear_studentChange}
                      filterOption={filterOption}
                      options={allSchoolyear?.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      style={{ width: "40%" }}
                    />
                    <Select
                      showSearch
                      value={selectStudent.student_id}
                      placeholder="Chọn học sinh"
                      optionFilterProp="children"
                      onChange={(value, label) => onStudentChange(value, label)}
                      filterOption={filterOption}
                      options={allStudents}
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>

                <div className="flex-col space-x-4 w-1/2 border-2 p-2 justify-center items-center space-y-2">
                  <p className="text-center">Chọn phụ huynh</p>
                  <div className="flex space-x-4">
                    <Select
                      showSearch
                      placeholder="Chọn năm"
                      optionFilterProp="children"
                      onChange={onSchoolyear_parentChange}
                      filterOption={filterOption}
                      options={allSchoolyear?.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      style={{ width: "40%" }}
                    />
                    <Select
                      showSearch
                      value={selectParent.parent_id}
                      placeholder="Chọn phụ huynh"
                      optionFilterProp="children"
                      onChange={(value, label) => onParentChange(value, label)}
                      filterOption={filterOption}
                      options={allParents}
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={handleAddParentStudent}
                />
              </div>
            </div>

            <Table
              columns={[
                {
                  title: "Tên học sinh",
                  dataIndex: "studentName",
                },
                {
                  title: "Tên đăng nhập",
                  dataIndex: "studentUsername",
                },
                {
                  title: "Tên phụ huynh",
                  dataIndex: "parentName",
                },
                {
                  title: "Tên đăng nhập",
                  dataIndex: "parentUsername",
                },
                {
                  title: "action",
                  render: (text, record, index) => (
                    <Button
                      danger
                      onClick={() => handleDelete(index)}
                      icon={<DeleteOutlined />}
                    ></Button>
                  ),
                },
              ]}
              dataSource={parent_students}
              bordered
              pagination={false}
            ></Table>
          </div>
        )}
      </Modal>
    </>
  );
};

export default App;

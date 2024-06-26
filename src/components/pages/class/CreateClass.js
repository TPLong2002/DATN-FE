import React, { useEffect, useState, useRef } from "react";
import { createClass } from "@/services/class";
import { getGroups } from "@/services/group";
import { UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { Modal, Input, Select, Button } from "antd";
import { getAllGrade } from "@/services/grade";
import { getAllSchoolyear } from "@/services/schoolyear";
import { getTeachersWithoutGVCN } from "@/services/user";

const App = (props) => {
  const { fetchData } = props;
  const [classes, setClasses] = useState([
    { name: "", gvcn_id: "", schoolyear_id: "", grade_id: "" },
  ]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Bạn có chắc muốn tạo lớp này không ?"
  );
  const [grade, setGrade] = useState([]);
  const [selectGrade, setSelectGrade] = useState();
  const [allSchoolyear, setAllSchoolyear] = useState([{}]);
  const [selectSchoolyear, setSelectSchoolyear] = useState();
  const [allteachers, setAllTeachers] = useState();

  // const [importedFile, setImportedFile] = useState(null);
  const fileInputRef = useRef(null); // Use useRef to create a ref

  const fetchGrade = async () => {
    const res = await getAllGrade();
    setGrade([{ id: null, name: "Tất cả" }, ...res.data]);
  };
  const fetchSchoolyear = async () => {
    const res_schoolyear = await getAllSchoolyear();
    setAllSchoolyear(res_schoolyear.data);
  };
  const fetchteachers = async () => {
    const res = await getTeachersWithoutGVCN();
    console.log("res", res.data);
    setAllTeachers(res.data);
  };

  useEffect(() => {
    fetchSchoolyear();
    fetchGrade();
    fetchteachers();
  }, []);
  const handleOk = async () => {
    const create = await createClass(classes);
    if (+create.code === 0) {
      setModalText(create.message);
      setConfirmLoading(true);
      setTimeout(async () => {
        fetchData().then(() => {
          setOpen(false);
          setConfirmLoading(false);
        });
      }, 1000);
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const newClasses = [...classes];
    newClasses[index] = { ...classes[index], [name]: value };
    setClasses(newClasses);
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

      setClasses(parsedData);
    };
    reader.readAsText(file);
  };

  const onSearch = (value) => {
    console.log("search:", value);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const onSelectGradeChange = (value, index) => {
    const newClasses = [...classes];
    newClasses[index] = { ...classes[index], grade_id: value };
    setClasses(newClasses);
    setSelectGrade(value);
  };
  const onSchoolyearChange = (value, index) => {
    const newClasses = [...classes];
    newClasses[index] = { ...classes[index], schoolyear_id: value };
    setClasses(newClasses);
    setSelectSchoolyear(value);
  };
  const onGVCNChange = (value, index) => {
    const newClasses = [...classes];
    newClasses[index] = { ...classes[index], gvcn_id: value };
    setClasses(newClasses);
  };
  console.log("classes", classes);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Tạo lớp học
      </Button>
      <Modal
        title="Tạo lớp học"
        open={open}
        onCancel={handleCancel}
        width={400}
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
          classes.map((_class, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <div>
                <p className="font-medium">Tên lớp</p>
                <Input
                  placeholder="Tên lớp"
                  name="name"
                  value={_class.name}
                  onChange={(e) => handleChange(e, index)}
                ></Input>
              </div>

              <div className="flex flex-col space-y-1">
                <p className="font-medium">Tên giáo viên chủ nhiệm</p>
                <Select
                  showSearch
                  placeholder="Chọn giáo viên chủ nhiệm"
                  optionFilterProp="children"
                  onChange={(value) => onGVCNChange(value, index)}
                  onSearch={onSearch}
                  filterOption={filterOption}
                  options={allteachers?.map((item) => ({
                    value: item.id,
                    label: item.Profile.firstName + " " + item.Profile.lastName,
                  }))}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <div className="w-1/2 flex flex-col space-y-1">
                  <p className="font-medium">Khối lớp</p>
                  <Select
                    showSearch
                    placeholder="Chọn khối"
                    optionFilterProp="children"
                    onChange={(value) => onSelectGradeChange(value, index)}
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={grade?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="w-1/2 flex flex-col space-y-1">
                  <p className="font-medium">Năm học</p>
                  <Select
                    showSearch
                    placeholder="Chọn năm học"
                    optionFilterProp="children"
                    onChange={(value) => onSchoolyearChange(value, index)}
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={allSchoolyear?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </Modal>
    </>
  );
};

export default App;

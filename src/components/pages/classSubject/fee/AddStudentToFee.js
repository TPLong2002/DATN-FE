import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { addStudentToFee } from "@/services/fee/studentOfFee";
import { getStudentNotInFee } from "@/services/fee/studentOfFee";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { Modal, Input, Select, Button } from "antd";
import { toast } from "react-toastify";

const App = forwardRef((props, ref) => {
  const { fetchData, fee_id } = props;
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [defaultStudent, setDefaultStudent] = useState("Chọn học sinh"); // [0] is the default value of allStudents
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [schoolyear, setSchoolyear] = useState(23);
  const [modalText, setModalText] = useState(
    "Bạn có chắc muốn thêm học sinh ?"
  );
  const fileInputRef = useRef(null); // Use useRef to create a ref
  const fetchAllStudents = async () => {
    try {
      const res = await getStudentNotInFee(fee_id);
      const data = res.data.map((student) => ({
        value: student?.id,
        label: student?.Profile?.firstname + " " + student?.Profile?.lastname,
      }));
      setAllStudents(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllStudents();
  }, [fee_id]);

  useImperativeHandle(ref, () => ({
    fetchAllStudents() {
      return fetchAllStudents();
    },
  }));

  const handleOk = async () => {
    setConfirmLoading(true);
    const data = students.map((student) => ({
      user_id: student.id,
      fee_id: fee_id,
    }));

    const addStudent = await addStudentToFee(data);
    if (+addStudent.code === 0) {
      setModalText(addStudent.message);
      setTimeout(async () => {
        fetchData().then(() => {
          toast.success("Thêm học sinh thành công");
        });
        setConfirmLoading(false);
        setOpen(false);
        setStudents([]);
      }, 2000);
    }
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      console.log("File loaded successfully");
      const csv = Papa.parse(target.result, {
        header: true,
      });
      const parsedData = csv?.data.slice(0, csv.data.length - 1);

      const updatedAllStudents = allStudents.filter((student) => {
        // Lọc ra những học sinh không có trong danh sách newStudents
        return !parsedData.some(
          (newStudent) => +newStudent.id === student.value
        );
      });
      console.log("updatedAllStudents", updatedAllStudents);
      setAllStudents(updatedAllStudents);
      setDefaultStudent("Chọn học sinh");
      setStudents(parsedData);
    };
    reader.readAsText(file);
  };
  const onChange = (value, label) => {
    const newStudents = [...students];
    newStudents.push({ id: value, label: label.label });
    setStudents(newStudents);

    const updatedAllStudents = allStudents.filter((student) => {
      // Lọc ra những học sinh không có trong danh sách newStudents
      return !newStudents.some((newStudent) => newStudent.id === student.value);
    });
    setAllStudents(updatedAllStudents);
    setDefaultStudent("Chọn học sinh");
  };
  const handleDelete = (index) => {
    let newStudents = [...students];
    const removedStudent = newStudents.splice(index, 1)[0];
    setAllStudents([
      ...allStudents,
      { value: removedStudent.id, label: removedStudent.label },
    ]);
    setStudents(newStudents);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Thêm học sinh vào khoảng phí
      </Button>
      <Modal
        title="Thêm học sinh vào khoảng phí"
        open={open}
        onOk={handleOk}
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
            {students.map((_class, index) => (
              <div key={index} className="flex space-x-2">
                <Input value={_class.label} readOnly></Input>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  danger
                ></Button>
              </div>
            ))}
            {allStudents?.length > 0 && (
              <Select
                showSearch
                value={defaultStudent}
                placeholder="Select a person"
                optionFilterProp="children"
                onChange={onChange}
                onSearch={onSearch}
                filterOption={filterOption}
                options={allStudents}
                style={{ width: "50%" }}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
});

export default App;

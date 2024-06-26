import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { Button, Checkbox, Space, Table, Tag, Typography, Text } from "antd";
import DeleteSubject from "@/components/pages/subject/DeleteSubject";
import { Link, useNavigate } from "react-router-dom";
import { getStudentsOfFee } from "@/services/fee/studentOfFee";
import DeleteStudentOfFee from "@/components/pages/fee/DeleteStudentOfFee";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Column } = Table;
const { Title } = Typography;

const App = forwardRef((props, ref) => {
  const { fee_id, fetchAllStudents } = props;
  const navigate = useNavigate();
  const [openDelete, setOpenDelete] = useState(false);
  const [studentDetele, setStudentDetele] = useState({});
  const [data, setData] = useState({ rows: [], count: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const fetchStudentOfFee = async () => {
    const res = await getStudentsOfFee(
      fee_id,
      pagination.page,
      pagination.limit
    );
    if (+res.code === 0) {
      setData(res.data);
    }
  };
  useImperativeHandle(ref, () => ({
    fetchStudentOfFee() {
      return fetchStudentOfFee();
    },
  }));
  useEffect(() => {
    fetchStudentOfFee();
  }, [pagination]);
  const handleDelete = (id, ishidden) => {
    setOpenDelete(true);
    setStudentDetele({ fee_id: +fee_id, user_id: id, ishidden: ishidden ^ 1 });
  };
  const columns = [
    {
      title: "Tên học sinh",
      dataIndex: "name",
      render: (text, record) => (
        <Link to={`/user/profile/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Tên phụ huynh",
      dataIndex: "parent_name",
      render: (text, record) => (
        <Link to={`/user/profile/${record.parent_id}`}>{text}</Link>
      ),
    },
    {
      title: "Ẩn",
      dataIndex: "ishidden",
      render: (ishidden, record) => (
        <Checkbox
          checked={+ishidden === 1}
          onChange={() => handleDelete(record.id, record.ishidden)}
        />
      ),
    },
    {
      title: "Trạng thái",
      render: (record) => (
        <Tag
          icon={
            +record.paymentstatus === 0 ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
          color={+record.paymentstatus === 0 ? "success" : "warning"}
        >
          {+record.paymentstatus === 0 ? "Đã thanh toán" : "Chưa thanh toán"}
        </Tag>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle" className="text-l">
    //       <Button
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDelete(record.id)}
    //       ></Button>
    //     </Space>
    //   ),
    // },
  ];
  const paginate = {
    total: data.count,
    defaultPageSize: pagination.limit,
    showSizeChanger: true,
    pageSizeOptions: ["1", "10", "50"],
    onChange: (page, pageSize) => {
      setPagination({ ...pagination, page, limit: pageSize });
    },
  };
  return (
    <>
      <DeleteStudentOfFee
        setOpen={setOpenDelete}
        studentDetele={studentDetele}
        open={openDelete}
        fetchData={fetchStudentOfFee}
        fetchAllStudents={fetchAllStudents}
      ></DeleteStudentOfFee>

      <Table
        bordered={true}
        columns={columns}
        dataSource={
          data
            ? data?.rows[0]?.Fee_Users?.map((row) => ({
                id: row.id,
                username: row.username,
                name: row.Profile.firstname + " " + row.Profile.lastname,
                parent_name:
                  row.User_Students[0]?.Profile.firstname +
                  " " +
                  row.User_Students[0]?.Profile.lastname,
                parent_id: row.User_Students[0]?.id,
                paymentstatus:
                  row.Student_Paymenthistories[0]?.Paymentstatus.code,
                ishidden: row.User_Fee.ishidden,
              }))
            : []
        }
        pagination={paginate}
      />
    </>
  );
});

export default App;

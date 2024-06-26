import React, { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  getRelativesProfile,
} from "@/services/profile";
import { useParams } from "react-router-dom";
import { Button, Input, DatePicker, Radio } from "antd";
import { getGroupByUserId } from "@/services/group";
import dayjs from "dayjs";
import UploadAvatar from "@/components/pages/profile/UploadAvatar";
import { toast } from "react-toastify";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useSelector } from "react-redux";

const Profile = () => {
  const params = useParams();
  const auth = useSelector((state) => state.auth);
  const format = "YYYY/MM/DD";
  const [profiles, setProfiles] = useState([]);
  const [group, setGroup] = useState({});
  const [options, setOptions] = useState(1);
  const [originalImg, setOriginalImg] = useState([]);
  const cloud_name = "depfh6rnw";
  const preset_key = "rsnt801s";

  const fetchProfile = async (id) => {
    const group = await getGroupByUserId(id);
    setGroup(group?.data?.Group);
    if (+auth.id === +id || auth.role === "admin") {
      try {
        if (options === 1) {
          const res = await getProfile(id);

          setProfiles(res?.data?.map((row) => ({ ...row, newPassword: "" })));
          setOriginalImg(
            res?.data?.map((row) => ({ avt: row.avt, id: res.data.id }))
          );
        }
        if (options === 2) {
          const res = await getRelativesProfile(id);
          console.log(res);
          setProfiles(res?.data);
          setOriginalImg(
            res.data.map((row) => ({ avt: row.avt, id: res.data.id }))
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Bạn không có quyền truy cập thông tin này");
    }
  };
  useEffect(() => {
    document.title = "Thông tin cá nhân";
  }, []);

  useEffect(() => {
    if (params.user_id && auth.id) fetchProfile(params.user_id);
  }, [params.user_id, options, auth.id]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const newProfile = [...profiles];
    newProfile[index] = { ...newProfile[index], [name]: value };
    setProfiles(newProfile);
  };

  const onChangeDate = (date, dateString, index) => {
    const newProfile = [...profiles];
    newProfile[index] = { ...newProfile[index], dateOfBirth: dateString };
    setProfiles(newProfile);
  };

  const onSubmit = async (index) => {
    const newProfile = [...profiles];
    console.log(newProfile[index]);
    if (profiles[index].avt && profiles[index].avt !== originalImg[index]) {
      const formData = new FormData();
      formData.append("file", profiles[index].avt);
      formData.append("upload_preset", preset_key);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data?.secure_url) {
          newProfile[index] = { ...newProfile[index], avt: data.secure_url };
          const response = await updateProfile(newProfile[index]);
          if (response.code === 0) {
            toast.success(response.message);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const res = await updateProfile(newProfile[index]);
      if (res.code === 0) {
        toast.success(res.message);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      <div className="mt-5 space-x-3">
        <Radio.Group
          value={options}
          onChange={(e) => setOptions(e.target.value)}
        >
          <Radio.Button value={1}>Thông tin cá nhân</Radio.Button>
          {group?.name === "student" && (
            <Radio.Button value={2}>Thông tin phụ huynh</Radio.Button>
          )}
          {group?.name === "parent" && (
            <Radio.Button value={2}>Thông tin học sinh</Radio.Button>
          )}
        </Radio.Group>
      </div>

      {profiles.map((profile, index) => (
        <div className="border rounded-sm border-gray-400 p-5" key={index}>
          {profile && (
            <UploadAvatar
              profiles={profiles}
              setProfiles={setProfiles}
              index={index}
            />
          )}
          <div className="grid grid-cols-1 gap-4 mt-3">
            <Input
              value={profile?.firstName}
              name="firstName"
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm họ"
            />
            <Input
              value={profile?.lastName}
              name="lastName"
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm tên"
            />
            <Input
              value={profile?.email}
              name="email"
              readOnly
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm email"
            />
            {auth.role === "admin" && (
              <Input.Password
                value={profile?.newPassword}
                type="password"
                name="newPassword"
                onChange={(e) => handleChange(e, index)}
                placeholder="Mật khẩu"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            )}

            <Input
              value={profile?.phoneNumber}
              name="phoneNumber"
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm số điện thoại"
            />
            <Input
              value={profile?.address}
              name="address"
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm địa chỉ"
            />
            <Input
              value={profile?.CCCD}
              name="CCCD"
              onChange={(e) => handleChange(e, index)}
              placeholder="Thêm CCCD"
            />
            <DatePicker
              value={profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null}
              format={format}
              onChange={(date, dateString) =>
                onChangeDate(date, dateString, index)
              }
              placeholder="Chọn ngày sinh"
            />
          </div>
          <div className="text-center mt-4">
            <Button type="primary" onClick={() => onSubmit(index)}>
              Save
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profile;

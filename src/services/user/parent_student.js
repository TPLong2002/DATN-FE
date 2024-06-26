import Axios from "@/services/axios";
export const getStudentAndParents = async (
  page,
  limit,
  search,
  schoolyear_id
) => {
  try {
    const res = await Axios.get("/student/getstudentparents", {
      params: {
        page: page,
        limit: limit,
        search: search,
        schoolyear_id: schoolyear_id,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const getStudentsBySchoolyear = async (schoolyear_id) => {
  try {
    const res = await Axios.get("/student/getstudentsbyschoolyear", {
      params: {
        schoolyear_id: schoolyear_id,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const getParentsBySchoolyear = async (schoolyear_id) => {
  try {
    const res = await Axios.get("/parent/getparentsbyschoolyear", {
      params: {
        schoolyear_id: schoolyear_id,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const addRelation = async (data) => {
  try {
    const res = await Axios.post("/student/addrelation", data);
    return res;
  } catch (error) {
    console.log(error);
  }
};
export const deleteRelation = async (id) => {
  try {
    const res = await Axios.delete(`/student/deleterelation`, {
      params: {
        id: id,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

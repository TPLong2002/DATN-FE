import Axios from "@/services/axios";
export const getAssignments = async (
  schoolyear_id,
  semester_id,
  page,
  limit
) => {
  try {
    const res = await Axios.get("/assignment", {
      params: {
        schoolyear_id,
        semester_id,
        page,
        limit,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const getAssignmentById = async (id) => {
  try {
    const res = await Axios.get(`/assignment`, { params: { id } });
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const getClassesNotInAssignmentOfTeacher = async (
  teacher_id,
  subject_id,
  assignment_id
) => {
  try {
    const res = await Axios.get("/assignment/classesnotinassignment", {
      params: {
        teacher_id: teacher_id,
        subject_id: subject_id,
        assignment_id: assignment_id,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const changeClass = async (assignment_id, class_id) => {
  try {
    const res = await Axios.put(`/assignment/changeClass`, {
      assignment_id,
      class_id,
    });
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const updateAssignment = async (data) => {
  try {
    const res = await Axios.put("/assignment", data);
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const getAllClasses = async () => {
  try {
    const res = await Axios.get("/class");
    return res;
  } catch (error) {
    console.error(error);
  }
};
export const createAssignment = async (data) => {
  try {
    const res = await Axios.post("/assignment", data);
    return res;
  } catch (error) {
    console.error(error);
  }
};

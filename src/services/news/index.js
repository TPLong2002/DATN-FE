import Axios from "@/services/axios";

const getCategory = async () => {
  try {
    const response = await Axios.get(`/category/getcategories`);
    return response;
  } catch (error) {
    throw error;
  }
};
const getnews = async (data) => {
  try {
    const response = await Axios.get(`/news/getnewsbysort`, {
      params: data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
const getNewsById = async (id) => {
  try {
    const response = await Axios.get(`/news/getnewsbysort`, {
      params: { id },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export { getCategory, getnews, getNewsById };

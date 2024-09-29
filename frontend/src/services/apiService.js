import axios from "axios";

//axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true; 

// Website
export const getWebsitesCount = async () => {
    const response = await axios.get("/api/websites/count");
    return response.data;
};

export const getWebsites = async (page = 1, limit = 30, filter = "") => {
    const response = await axios.get("/api/websites", {
        params: {
            page,
            limit,
            filter,
        },
    });
    return response.data;
};

export const addWebsite = async (data) => {
    const response = await axios.post("/api/websites", data);
    return response.data;
};

export const updateWebsite = async (webId, data) => {
    const response = await axios.put(`/api/websites/${webId}`, data);
    return response.data;
};

export const deleteWebsite = async (webId) => {
    const response = await axios.delete(`/api/websites/${webId}`);
    return response.data;
};

// Scraping
export const getUrlsCount = async () => {
    const response = await axios.get("/api/urls/count");
    return response.data;
};

export const getScrapeDataCount = async () => {
    const response = await axios.get("/api/urls/scrape/count");
    return response.data;
};

export const getUrls = async (webId, page = 1, limit = 30, filter = "") => {
    const response = await axios.get(`/api/urls/${webId}`, {
        params: {
            page,
            limit,
            filter,
        },
    });
    return response.data;
};

export const getScrappedData = async (urlId, page = 1, limit = 30) => {
    const response = await axios.get(`/api/urls/scrape/${urlId}`, {
        params: {
            page,
            limit
        },
    });
    return response.data;
};


export const addUrl = async (webId, data) => {
    const response = await axios.post(`/api/urls/${webId}`, data);
    return response.data;
};

export const updateUrl = async (urlId, data) => {
    const response = await axios.put(`/api/urls/${urlId}`, data);
    return response.data;
};

export const deleteUrl = async (urlId) => {
    const response = await axios.delete(`/api/urls/${urlId}`);
    return response.data;
};

export const deleteScrapData = async (urlId) => {
    const response = await axios.delete(`/api/urls/scrape/${urlId}`);
    return response.data;
};

export const scrapData = async (urlId) => {
    const response = await axios.post(`/api/urls/scrape/${urlId}`);
    return response.data;
};

// Users
export const getUsersCount = async () => {
    const response = await axios.get("/api/users/count");
    return response.data;
};

export const getUsers = async (page = 1, pageSize = 10, filters = {}) => {
    const { name, whatsappNumber, preferredPlan } = filters;

    const params = {
        page,
        pageSize,
        ...(name ? { name } : {}),
        ...(whatsappNumber ? { whatsappNumber } : {}),
        ...(preferredPlan ? { preferredPlan } : {}),
    };

    const response = await axios.get("/api/users", { params });
    return response.data;
};

export const addUser = async (data) => {
    const response = await axios.post("/api/users", data);
    return response.data;
};


export const updateNotificationsSetting = async (preferredPlan, data) => {
    const response = await axios.post(`/api/users/notifications/setting/${preferredPlan}`, data);
    return response.data;
};

export const getNotificationsSetting = async (preferredPlan) => {
    const response = await axios.get(`/api/users/notifications/setting/${preferredPlan}`);
    return response.data;
};



export const updateUser = async (userId, data) => {
    const response = await axios.put(`/api/users/${userId}`, data);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
};

const baseURL = "http://localhost:5005";

const apiCall = async (path, method, data = {}, token = "") => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method: method,
    headers: headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseURL}${path}`, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default apiCall;

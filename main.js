const fs = require("fs");

fs.readFile("census.json", "utf8", (err, data) => {
  const axios = require("axios");
  let access_token = "";
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Parse the JSON data
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }

  const api_url_login = "###";
  let login_data = {
    email: "####",
    password: "###",
  };

  const api_url_report_post = "###";
  axios
    .post(api_url_login, login_data)
    .then((response) => {
      //console.log("Response:", response.data);
      const login_response = response.data;
      // console.log(login_response);
      access_token = login_response["result"]["accessToken"];
      const header = {
        "x-auth-token": access_token,
      };
      console.log(header);
      axios
        .post(api_url_report_post, jsonData, { headers: header })
        .then((postReportResponse) => {
          console.log("Response:", postReportResponse.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  // login_response = axios.post(api_url_login, login_data);
  // console.log(login_response.data);
  //access_token = log;
});

"use strict";
const express = require("express"); //require function is part of node.js module system, here it returns reference to express() function which instantiates express
const { Pool } = require("pg"); //{Pool} is a object break down syntax, here it extraccts pool class from an object, the pg module is assigned to pool class
const { Client } = require("pg");
const { createListener } = require("pg-listen");
const fs = require("fs");
const app = express();
const port = 3000;

const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "employee",
  password: "1111",
  port: 5432,
};

const pool = new Pool(dbConfig);

const client = new Client(dbConfig);
client.connect();

const dbTOjson = function (data_for_json, arrayOfObjects, data_for_json_Array) {
  //const data_for_json_Array = [];
  //   console.log(arrayOfObjects);
  for (let i = 0; i < arrayOfObjects.length; i++) {
    //console.log(arrayOfObjects[i]["employee_id"]);
    data_for_json["worker_id"] = arrayOfObjects[i]["employee_id"];
    data_for_json["name"] = arrayOfObjects[i]["firstname"];
    data_for_json["lastname"] = arrayOfObjects[i]["lastname"];
    data_for_json["birthdate"] = arrayOfObjects[i]["birth_date"];
    data_for_json["gender"] = arrayOfObjects[i]["gender"];
    data_for_json["nid"] = arrayOfObjects[i]["nid"];
    data_for_json["telephone"] = arrayOfObjects[i]["telephone"];
    data_for_json["email"] = arrayOfObjects[i]["email"];
    data_for_json["address"] = arrayOfObjects[i]["address"];
    data_for_json["country"] = arrayOfObjects[i]["country"];
    data_for_json["role"] = arrayOfObjects[i]["designation"];
    arrayOfObjects[i]["status"] === "active"
      ? (data_for_json["type"] = "in")
      : (data_for_json["type"] = "out");

    //data_for_json["type"] = arrayOfObjects[i]["status"];
    // console.log(data_for_json);

    data_for_json_Array.push({ ...data_for_json }); //pushing distinct instances of same object
    // console.log(i + 1 + "th time:\n");
    // console.log(data_for_json);
  }

  //   data_for_json_Array.push(data_for_json);
  console.log(data_for_json_Array);
  fs.readFile("census.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse the JSON data
    let jsonData = [];
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    // Add the new object into the JSON array
    jsonData = data_for_json_Array;

    // Convert the modified JSON data back to a string
    const newData = JSON.stringify(jsonData, null, 2);

    // Write the updated JSON data back to the file
    fs.writeFile("census.json", newData, "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("Object pushed successfully into census.json");
    });

    //send to API
    const axios = require("axios");
    let access_token = "";
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
  });
};

const sentToAPI = function () {
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
      email: "###",
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
};

const handleNotification = async (msg) => {
  console.log("Received notification:", msg.payload);
  const sqlQuery =
    "SELECT employee_id, firstname, lastname, birth_date, gender, nid, telephone, email, address, country, designation, status  FROM active_worker";
  //data structure for API json object
  const data_for_json = {
    worker_id: "",
    name: "",
    lastname: "",
    birthdate: "",
    gender: "",
    nid: "",
    telephone: "",
    email: "",
    address: "",
    country: "",
    role: "",
    type: "",
  };
  const data_for_json_Array = [];

  // Fetch rows from the table upon receiving notification
  try {
    const queryResult = await pool.query(sqlQuery);
    const arrayOfObjects = queryResult.rows.map((row) => {
      //map each row column name and value to each object key and value, and finally make an array
      const object = {};
      for (const key in row) {
        object[key] = row[key];
      }
      return object;
    });

    dbTOjson(data_for_json, arrayOfObjects, data_for_json_Array);
    //run login and posting
    sentToAPI();
  } catch (error) {
    console.error("Error fetching rows:", error);
  }
};

client.query("LISTEN your_channel_name", (err) => {
  if (err) {
    console.error("Error listening for notifications:", err);
  } else {
    console.log("Listening for notifications...");
  }
});
client.on("notification", handleNotification);

// (async () => {
//   await listener.connect();
//   listener.listenTo("active_worker");
//   console.log("Listening for table updates...");
// })();

// Express route to handle HTTP requests
app.get("/users", (req, res) => {
  res.send("Express server listening for table updates...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

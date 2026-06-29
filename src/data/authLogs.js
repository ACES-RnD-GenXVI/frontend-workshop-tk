// src/data/authLogs.js

export const addAuthLog = (action) => {
  const currentLogs = JSON.parse(localStorage.getItem("authLogs") || "[]");
  const newLog = {
    timestamp: new Date().toTimeString().split(" ")[0],
    action: action,
  };
  localStorage.setItem("authLogs", JSON.stringify([newLog, ...currentLogs]));
};

export const getAuthLogs = () => {
  return JSON.parse(localStorage.getItem("authLogs") || "[]");
};

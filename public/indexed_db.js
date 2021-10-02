const request = window.indexedDB.open("budget", 1);

let db;

request.onupgradeneeded = function (e) {
  const db = e.target.result;
  const store = db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (e) {
  console.log("There was an error" + e.target.error);
};

function saveRecord(record) {
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetObjectStore = transaction.objectStore("BudgetStore");
  budgetObjectStore.add(record);
}

function uploadTransaction() {
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetObjectStore = transaction.objectStore("BudgetStore");
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const db = request.result;
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const BudgetObjectStore = transaction.objectStore("BudgetStore");
          BudgetObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadTransaction);

const navigationLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");
const pageTitle = document.getElementById("pageTitle");

const pageNames = {
  dashboard: "Dashboard",
  students: "Students",
  classes: "Classes & Subjects",
  attendance: "Attendance",
  scores: "Scores & Reports",
  fees: "Fees & Payments",
  announcements: "Announcements",
};

function showPage(pageName) {
  pageSections.forEach(function (section) {
    section.classList.remove("active-section");
  });

  navigationLinks.forEach(function (link) {
    link.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageName);
  const selectedLink = document.querySelector(`[data-page="${pageName}"]`);

  if (selectedPage) {
    selectedPage.classList.add("active-section");
  }

  if (selectedLink) {
    selectedLink.classList.add("active");
  }

  pageTitle.textContent = pageNames[pageName] || "Dashboard";

  if (pageName === "fees") {
    updateFeesDisplay();
  }
}

navigationLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

document.querySelectorAll("[data-page-target]").forEach(function (button) {
  button.addEventListener("click", function () {
    showPage(button.dataset.pageTarget);
  });
});

/* Student storage */
let students = JSON.parse(localStorage.getItem("students")) || [
  {
    id: 1,
    name: "David Okafor",
    studentClass: "Primary 5A",
    parentContact: "0801 234 5678",
  },
  {
    id: 2,
    name: "Mary Musa",
    studentClass: "JSS 2A",
    parentContact: "0809 876 5432",
  },
  {
    id: 3,
    name: "John Ibrahim",
    studentClass: "SSS 1A",
    parentContact: "0810 456 7890",
  },
];

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const totalStudents = document.getElementById("totalStudents");
const recentStudents = document.getElementById("recentStudents");
const studentSearch = document.getElementById("studentSearch");

let editingStudentId = null;

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

function displayStudents(studentList = students) {
  studentTableBody.innerHTML = "";
  recentStudents.innerHTML = "";

  studentList.forEach(function (student) {
    const studentRow = document.createElement("tr");

    studentRow.innerHTML = `
      <td>${student.name}</td>
      <td>${student.studentClass}</td>
      <td>${student.parentContact}</td>
      <td>
        <button class="edit-button" onclick="editStudent(${student.id})">Edit</button>
        <button class="delete-button" onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    `;

    studentTableBody.appendChild(studentRow);

    if (recentStudents.children.length < 5) {
      const recentRow = document.createElement("tr");

      recentRow.innerHTML = `
        <td>${student.name}</td>
        <td>${student.studentClass}</td>
        <td>${student.parentContact}</td>
      `;

      recentStudents.appendChild(recentRow);
    }
  });

  totalStudents.textContent = students.length;
}

function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  document.getElementById("studentName").value = student.name;
  document.getElementById("studentClass").value = student.studentClass;
  document.getElementById("parentContact").value = student.parentContact;

  editingStudentId = id;
  studentForm.querySelector("button").textContent = "Update Student";
  studentForm.scrollIntoView({ behavior: "smooth" });
}

studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const studentClass = document.getElementById("studentClass").value;
  const parentContact = document.getElementById("parentContact").value.trim();

  if (name === "" || studentClass === "" || parentContact === "") {
    alert("Please complete all student fields.");
    return;
  }

  if (editingStudentId) {
    const student = students.find((s) => s.id === editingStudentId);
    if (student) {
      student.name = name;
      student.studentClass = studentClass;
      student.parentContact = parentContact;
      alert("Student updated successfully.");
    }
    editingStudentId = null;
    studentForm.querySelector("button").textContent = "Add Student";
  } else {
    const newId = Math.max(...students.map((s) => s.id), 0) + 1;
    students.push({
      id: newId,
      name: name,
      studentClass: studentClass,
      parentContact: parentContact,
    });
    alert("Student added successfully.");
  }

  saveStudents();
  displayStudents();
  studentForm.reset();
  updateFeeStudentSelects();
});

function deleteStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  const confirmed = confirm(`Delete ${student.name}?`);

  if (confirmed) {
    students = students.filter((s) => s.id !== id);
    let studentFees = JSON.parse(localStorage.getItem("studentFees")) || {};
    delete studentFees[id];
    localStorage.setItem("studentFees", JSON.stringify(studentFees));
    saveStudents();
    displayStudents();
    updateFeeStudentSelects();
  }
}

displayStudents();

/* Attendance */
const attendanceDate = document.getElementById("attendanceDate");
const attendanceList = document.getElementById("attendanceList");
const saveAttendanceButton = document.getElementById("saveAttendance");

const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const lateCount = document.getElementById("lateCount");

let attendanceRecords =
  JSON.parse(localStorage.getItem("attendanceRecords")) || {};

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

attendanceDate.value = getTodayDate();

function displayAttendance() {
  attendanceList.innerHTML = "";

  const selectedDate = attendanceDate.value;

  students.forEach(function (student) {
    const savedStatus =
      attendanceRecords[selectedDate]?.[student.id] || "Present";

    const attendanceRow = document.createElement("div");
    attendanceRow.className = "attendance-row";

    attendanceRow.innerHTML = `
      <span>
        <strong>${student.name}</strong>
        <small>${student.studentClass}</small>
      </span>

      <select class="attendance-status" data-student-id="${student.id}">
        <option value="Present" ${savedStatus === "Present" ? "selected" : ""}>
          Present
        </option>

        <option value="Absent" ${savedStatus === "Absent" ? "selected" : ""}>
          Absent
        </option>

        <option value="Late" ${savedStatus === "Late" ? "selected" : ""}>
          Late
        </option>
      </select>
    `;

    attendanceList.appendChild(attendanceRow);
  });

  updateAttendanceSummary();
}

function updateAttendanceSummary() {
  const statuses = document.querySelectorAll(".attendance-status");

  let present = 0;
  let absent = 0;
  let late = 0;

  statuses.forEach(function (status) {
    if (status.value === "Present") {
      present++;
    } else if (status.value === "Absent") {
      absent++;
    } else if (status.value === "Late") {
      late++;
    }
  });

  presentCount.textContent = present;
  absentCount.textContent = absent;
  lateCount.textContent = late;
}

attendanceDate.addEventListener("change", function () {
  displayAttendance();
});

attendanceList.addEventListener("change", function (event) {
  if (event.target.classList.contains("attendance-status")) {
    updateAttendanceSummary();
  }
});

saveAttendanceButton.addEventListener("click", function () {
  const selectedDate = attendanceDate.value;
  const statuses = document.querySelectorAll(".attendance-status");

  attendanceRecords[selectedDate] = {};

  statuses.forEach(function (status) {
    const studentId = status.dataset.studentId;
    attendanceRecords[selectedDate][studentId] = status.value;
  });

  localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));

  alert(`Attendance saved for ${selectedDate}.`);
});

displayAttendance();

/* ===========================
   FEES MANAGEMENT SYSTEM
   =========================== */

let studentFees = JSON.parse(localStorage.getItem("studentFees")) || {};
let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || {};

const assignFeesForm = document.getElementById("assignFeesForm");
const recordPaymentForm = document.getElementById("recordPaymentForm");
const feesTableBody = document.getElementById("feesTableBody");
const feesSearch = document.getElementById("feesSearch");
const feesTotalCollected = document.getElementById("feesTotalCollected");
const feesOutstandingBalance = document.getElementById("feesOutstandingBalance");
const feesPaidStudents = document.getElementById("feesPaidStudents");
const feesPendingStudents = document.getElementById("feesPendingStudents");
const dashboardFeesCollected = document.getElementById("dashboardFeesCollected");

function updateFeeStudentSelects() {
  const feeStudentSelect = document.getElementById("feeStudent");
  const paymentStudentSelect = document.getElementById("paymentStudent");

  feeStudentSelect.innerHTML = '<option value="">Choose a student...</option>';
  paymentStudentSelect.innerHTML = '<option value="">Choose a student...</option>';

  students.forEach(function (student) {
    const option1 = document.createElement("option");
    option1.value = student.id;
    option1.textContent = `${student.name} (${student.studentClass})`;
    feeStudentSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = student.id;
    option2.textContent = `${student.name} (${student.studentClass})`;
    paymentStudentSelect.appendChild(option2);
  });
}

function formatCurrency(amount) {
  return "₦" + amount.toLocaleString();
}

function getStudentTotalFees(studentId) {
  if (!studentFees[studentId]) return 0;
  return studentFees[studentId].reduce((total, fee) => total + fee.amount, 0);
}

function getStudentPaidAmount(studentId) {
  if (!paymentHistory[studentId]) return 0;
  return paymentHistory[studentId].reduce((total, payment) => total + payment.amount, 0);
}

function getStudentBalance(studentId) {
  return getStudentTotalFees(studentId) - getStudentPaidAmount(studentId);
}

function saveFeesData() {
  localStorage.setItem("studentFees", JSON.stringify(studentFees));
  localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
}

assignFeesForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const studentId = parseInt(document.getElementById("feeStudent").value);
  const amount = parseInt(document.getElementById("feeAmount").value);
  const description = document.getElementById("feeDescription").value.trim();

  if (!studentId || !amount || !description) {
    alert("Please complete all fields.");
    return;
  }

  if (!studentFees[studentId]) {
    studentFees[studentId] = [];
  }

  studentFees[studentId].push({
    id: Date.now(),
    amount: amount,
    description: description,
    dateAssigned: new Date().toISOString().split("T")[0],
  });

  saveFeesData();
  updateFeesDisplay();
  assignFeesForm.reset();
  alert("Fee assigned successfully.");
});

recordPaymentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const studentId = parseInt(document.getElementById("paymentStudent").value);
  const amount = parseInt(document.getElementById("paymentAmount").value);
  const method = document.getElementById("paymentMethod").value;
  const date = document.getElementById("paymentDate").value;

  if (!studentId || !amount || !method || !date) {
    alert("Please complete all fields.");
    return;
  }

  if (!paymentHistory[studentId]) {
    paymentHistory[studentId] = [];
  }

  const totalFees = getStudentTotalFees(studentId);
  const paidAmount = getStudentPaidAmount(studentId);

  if (paidAmount + amount > totalFees) {
    alert(`Payment exceeds total fees. Balance would be negative.`);
    return;
  }

  paymentHistory[studentId].push({
    id: Date.now(),
    amount: amount,
    method: method,
    date: date,
    receiptNo: "REC-" + Date.now(),
  });

  saveFeesData();
  updateFeesDisplay();
  recordPaymentForm.reset();
  document.getElementById("paymentDate").valueAsDate = new Date();
  alert("Payment recorded successfully.");
});

function updateFeesDisplay() {
  let totalCollected = 0;
  let totalFees = 0;
  let paidStudentsCount = 0;
  let pendingStudentsCount = 0;

  feesTableBody.innerHTML = "";

  let feesData = students
    .map(function (student) {
      const fees = getStudentTotalFees(student.id);
      const paid = getStudentPaidAmount(student.id);
      const balance = getStudentBalance(student.id);
      let status = "Pending";

      if (fees === 0) {
        status = "No Fee";
      } else if (balance === 0) {
        status = "Paid";
        paidStudentsCount++;
      } else if (paid > 0 && balance > 0) {
        status = "Partial Payment";
      } else {
        pendingStudentsCount++;
      }

      totalFees += fees;
      totalCollected += paid;

      return {
        studentId: student.id,
        name: student.name,
        studentClass: student.studentClass,
        totalFees: fees,
        paid: paid,
        balance: balance,
        status: status,
      };
    })
    .filter((item) => item.totalFees > 0);

  feesData.forEach(function (item) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.studentClass}</td>
      <td>${formatCurrency(item.totalFees)}</td>
      <td>${formatCurrency(item.paid)}</td>
      <td>${formatCurrency(item.balance)}</td>
      <td><span class="status-badge ${item.status.toLowerCase().replace(" ", "-")}">${item.status}</span></td>
      <td>
        <button class="edit-button" onclick="viewPaymentHistory(${item.studentId})">History</button>
      </td>
    `;
    feesTableBody.appendChild(row);
  });

  feesTotalCollected.textContent = formatCurrency(totalCollected);
  feesOutstandingBalance.textContent = formatCurrency(totalFees - totalCollected);
  feesPaidStudents.textContent = paidStudentsCount;
  feesPendingStudents.textContent = pendingStudentsCount;
  dashboardFeesCollected.textContent = formatCurrency(totalCollected);

  updateFeesFilter();
}

let currentFilterType = "all";

document.querySelectorAll(".filter-button").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".filter-button").forEach((btn) =>
      btn.classList.remove("active")
    );
    this.classList.add("active");
    currentFilterType = this.dataset.filter;
    updateFeesFilter();
  });
});

function updateFeesFilter() {
  const rows = document.querySelectorAll("#feesTableBody tr");
  rows.forEach(function (row) {
    const statusCell = row.querySelector(".status-badge");
    const status = statusCell.textContent.toLowerCase().replace(" ", "-");

    if (currentFilterType === "all") {
      row.style.display = "";
    } else if (currentFilterType === status) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

feesSearch.addEventListener("input", function () {
  const searchText = this.value.toLowerCase();
  const rows = document.querySelectorAll("#feesTableBody tr");
  rows.forEach(function (row) {
    const nameCell = row.cells[0].textContent.toLowerCase();
    const classCell = row.cells[1].textContent.toLowerCase();
    if (nameCell.includes(searchText) || classCell.includes(searchText)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

function viewPaymentHistory(studentId) {
  const student = students.find((s) => s.id === studentId);
  const payments = paymentHistory[studentId] || [];
  const modal = document.getElementById("paymentHistoryModal");
  const historyList = document.getElementById("paymentHistoryList");

  historyList.innerHTML = `
    <h3>${student.name} - Payment History</h3>
    <p><strong>Total Fees:</strong> ${formatCurrency(getStudentTotalFees(studentId))}</p>
    <p><strong>Total Paid:</strong> ${formatCurrency(getStudentPaidAmount(studentId))}</p>
    <p><strong>Balance:</strong> ${formatCurrency(getStudentBalance(studentId))}</p>
    <hr>
  `;

  if (payments.length === 0) {
    historyList.innerHTML += "<p>No payment records found.</p>";
  } else {
    let html = "<table style='width:100%; border-collapse: collapse;'>";
    html += "<thead><tr><th style='border: 1px solid #ddd; padding: 10px;'>Date</th><th style='border: 1px solid #ddd; padding: 10px;'>Amount</th><th style='border: 1px solid #ddd; padding: 10px;'>Method</th><th style='border: 1px solid #ddd; padding: 10px;'>Receipt</th></tr></thead>";
    html += "<tbody>";
    payments.forEach(function (payment) {
      html += `<tr><td style='border: 1px solid #ddd; padding: 10px;'>${payment.date}</td><td style='border: 1px solid #ddd; padding: 10px;'>${formatCurrency(payment.amount)}</td><td style='border: 1px solid #ddd; padding: 10px;'>${payment.method}</td><td style='border: 1px solid #ddd; padding: 10px;'>${payment.receiptNo}</td></tr>`;
    });
    html += "</tbody></table>";
    historyList.innerHTML += html;
  }

  modal.style.display = "block";
}

document.querySelector(".close").addEventListener("click", function () {
  document.getElementById("paymentHistoryModal").style.display = "none";
});

window.addEventListener("click", function (event) {
  const modal = document.getElementById("paymentHistoryModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Tab switching
document.querySelectorAll(".tab-button").forEach(function (button) {
  button.addEventListener("click", function () {
    const tabName = this.dataset.tab;
    document.querySelectorAll(".tab-button").forEach((btn) =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(".tab-content").forEach((content) =>
      content.classList.remove("active")
    );
    this.classList.add("active");
    document.getElementById(tabName + "-tab").classList.add("active");
  });
});

updateFeeStudentSelects();
document.getElementById("paymentDate").valueAsDate = new Date();

/* Announcements */
const announcementForm = document.getElementById("announcementForm");
const announcementList = document.getElementById("announcementList");

if (announcementForm) {
  announcementForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("announcementTitle").value.trim();
    const message = document
      .getElementById("announcementMessage")
      .value.trim();

    const announcement = document.createElement("div");
    announcement.className = "announcement-item";

    announcement.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      <small>Published just now</small>
    `;

    announcementList.prepend(announcement);
    announcementForm.reset();

    alert("Announcement published successfully.");
  });
}

/* Logout */
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    alert("Logout will be connected to the login system later.");
  });
}

studentSearch.addEventListener("input", function () {
  const searchText = studentSearch.value.toLowerCase().trim();

  const filteredStudents = students.filter(function (student) {
    return (
      student.name.toLowerCase().includes(searchText) ||
      student.studentClass.toLowerCase().includes(searchText) ||
      student.parentContact.toLowerCase().includes(searchText)
    );
  });

  displayStudents(filteredStudents);
});

/* Report Card Generator */
const calculateReportButton = document.getElementById("calculateReport");
const printReportButton = document.getElementById("printReport");

function getReportGrade(score) {
  if (score >= 75) {
    return {
      grade: "A1",
      remark: "Excellent",
    };
  }

  if (score >= 70) {
    return {
      grade: "B2",
      remark: "Very Good",
    };
  }

  if (score >= 65) {
    return {
      grade: "B3",
      remark: "Good",
    };
  }

  if (score >= 60) {
    return {
      grade: "C4",
      remark: "Credit",
    };
  }

  if (score >= 55) {
    return {
      grade: "C5",
      remark: "Credit",
    };
  }

  if (score >= 50) {
    return {
      grade: "C6",
      remark: "Credit",
    };
  }

  if (score >= 45) {
    return {
      grade: "D7",
      remark: "Pass",
    };
  }

  if (score >= 40) {
    return {
      grade: "E8",
      remark: "Pass",
    };
  }

  return {
    grade: "F9",
    remark: "Fail",
  };
}

function calculateReport() {
  const caScores = document.querySelectorAll(".report-ca");
  const examScores = document.querySelectorAll(".report-exam");
  const totalCells = document.querySelectorAll(".report-total");
  const gradeCells = document.querySelectorAll(".report-grade");
  const remarkCells = document.querySelectorAll(".report-remark");

  let overallTotal = 0;

  caScores.forEach(function (caInput, index) {
    const caScore = Number(caInput.value);
    const examScore = Number(examScores[index].value);
    const totalScore = caScore + examScore;
    const result = getReportGrade(totalScore);

    totalCells[index].textContent = totalScore;
    gradeCells[index].textContent = result.grade;
    remarkCells[index].textContent = result.remark;

    overallTotal += totalScore;
  });

  const subjectCount = caScores.length;
  const average = overallTotal / subjectCount;
  const overallResult = getReportGrade(average);

  document.getElementById("reportTotal").textContent = overallTotal;
  document.getElementById("reportAverage").textContent =
    `${average.toFixed(1)}%`;

  document.getElementById("overallGrade").textContent = overallResult.grade;

  alert("Report calculated successfully.");
}

if (calculateReportButton) {
  calculateReportButton.addEventListener("click", calculateReport);
}

if (printReportButton) {
  printReportButton.addEventListener("click", function () {
    const studentName =
      document.getElementById("reportStudentName").value || "Student";

    const studentClass =
      document.getElementById("reportClass").value || "Class not provided";

    const term = document.getElementById("reportTerm").value;

    const total = document.getElementById("reportTotal").textContent;

    const average = document.getElementById("reportAverage").textContent;

    const grade = document.getElementById("overallGrade").textContent;

    const teacherComment = document.getElementById("teacherComment").value;

    const principalComment = document.getElementById("principalComment").value;

    const printableReport = document.getElementById("printableReport");

    printableReport.innerHTML = `
      <div class="report-header">
        <h1>ANSAR RUHUL ISLAM</h1>
        <h2>PRIMARY & SECONDARY SCHOOL</h2>
        <p>Sheikh Dende Estate, Ogunrun 1, Off Ifelouwa Estate, Mowe, Ogun State</p>
        <h2>STUDENT REPORT CARD</h2>
      </div>

      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Class:</strong> ${studentClass}</p>
      <p><strong>Term:</strong> ${term}</p>

      <br>

      ${document.querySelector("#scores table").outerHTML}

      <br>

      <p><strong>Total Score:</strong> ${total}</p>
      <p><strong>Average:</strong> ${average}</p>
      <p><strong>Overall Grade:</strong> ${grade}</p>

      <br>

      <p><strong>Class Teacher's Comment:</strong> ${teacherComment}</p>
      <p><strong>Principal's Comment:</strong> ${principalComment}</p>
    `;

    window.print();
  });
}

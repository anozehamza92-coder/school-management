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
});

function deleteStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  const confirmed = confirm(`Delete ${student.name}?`);

  if (confirmed) {
    students = students.filter((s) => s.id !== id);
    saveStudents();
    displayStudents();
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
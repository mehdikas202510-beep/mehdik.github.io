// حفظ الحجز في LocalStorage
const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("message");

if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!date || !time) return;

    const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments.push({ date, time });
    localStorage.setItem("appointments", JSON.stringify(appointments));

    message.textContent = "تم حجز الموعد بنجاح ✅";
    bookingForm.reset();
  });
}

// صفحة المالك
const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("password");
const loginMsg = document.getElementById("loginMsg");
const adminPanel = document.getElementById("adminPanel");
const loginContainer = document.getElementById("loginContainer");
const appointmentsList = document.getElementById("appointmentsList");
const clearBtn = document.getElementById("clearBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const password = passwordInput.value.trim();
    if (password === "admin123") {
      loginContainer.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      loadAppointments();
    } else {
      loginMsg.textContent = "كلمة المرور غير صحيحة ❌";
    }
  });
}

function loadAppointments() {
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointmentsList.innerHTML = "";

  if (appointments.length === 0) {
    appointmentsList.innerHTML = "<li>لا توجد مواعيد حالياً</li>";
    return;
  }

  appointments.forEach((a, index) => {
    const li = document.createElement("li");
    li.textContent = `📅 ${a.date} ⏰ ${a.time}`;
    appointmentsList.appendChild(li);
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("هل أنت متأكد من حذف جميع المواعيد؟")) {
      localStorage.removeItem("appointments");
      loadAppointments();
    }
  });
}

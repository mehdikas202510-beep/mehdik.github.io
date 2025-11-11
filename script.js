document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const datetime = document.getElementById("datetime").value;
  const note = document.getElementById("note").value;

  const token = "7544882164:AAHuxEs0QXivZh5vs6IVAH6ANf3y1ay18Zo";
  const chat_id = "6494466799";

  const message = `
📅 *حجز جديد على موقع Mehdik Booking*  
👤 الاسم: ${name}
📧 البريد: ${email}
📞 الهاتف: ${phone}
🕒 الموعد: ${datetime}
🗒️ ملاحظات: ${note || "لا يوجد"}
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat_id,
        text: message,
        parse_mode: "Markdown"
      }),
    });

    document.getElementById("responseMsg").innerText = "✅ تم إرسال الحجز بنجاح!";
    document.getElementById("responseMsg").classList.remove("hidden");
    document.getElementById("bookingForm").reset();
  } catch (error) {
    alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
    console.error(error);
  }
});

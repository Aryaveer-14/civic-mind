// Simple end-to-end smoke test for backend API

async function run() {
  try {
    // 1) Register user
    const registerRes = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@civic.local",
        name: "Test User",
        contact_number: "+1-555-0123",
        age: 28,
        locality: "Downtown"
      })
    });

    const registerData = await registerRes.json();
    console.log("Register status:", registerRes.status);
    console.log("Register response:", registerData);

    if (!registerRes.ok || !registerData.success) {
      throw new Error("Registration failed: " + (registerData.error || "unknown error"));
    }

    // 2) Verify OTP
    const verifyRes = await fetch("http://127.0.0.1:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_number: registerData.contact_number,
        otp: registerData.otp
      })
    });

    const verifyData = await verifyRes.json();
    console.log("Verify OTP status:", verifyRes.status);
    console.log("Verify OTP response:", verifyData);

    if (!verifyRes.ok || !verifyData.success) {
      throw new Error("OTP verification failed: " + (verifyData.error || "unknown error"));
    }

    const userId = verifyData.user_id;

    // 3) Login user
    const loginRes = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@civic.local" })
    });

    const loginData = await loginRes.json();
    console.log("Login status:", loginRes.status);
    console.log("Login response:", loginData);

    if (!loginRes.ok) {
      throw new Error("Login failed: " + loginData.error);
    }

    console.log("User ID from login:", loginData.user_id);

    // 4) Analyze with text-only
    const formData = new FormData();
    formData.append("text", "There is a pothole near 5th and Main causing traffic issues.");
    formData.append("user_id", userId);

    const analyzeRes = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData
    });

    const analyzeData = await analyzeRes.json();
    console.log("Analyze status:", analyzeRes.status);
    console.log("Analyze response:", analyzeData);

    if (!analyzeRes.ok || !analyzeData.success) {
      throw new Error("Analyze failed: " + (analyzeData.error || "unknown error"));
    }

    // 5) Submit feedback
    const feedbackRes = await fetch("http://127.0.0.1:5000/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaint_id: analyzeData.complaint_id,
        satisfied: true
      })
    });
    const feedbackData = await feedbackRes.json();
    console.log("Feedback status:", feedbackRes.status);
    console.log("Feedback response:", feedbackData);

    if (!feedbackRes.ok || !feedbackData.success) {
      throw new Error("Feedback failed: " + (feedbackData.error || "unknown error"));
    }

    // 5) Get stats
    const statsRes = await fetch("http://127.0.0.1:5000/stats");
    const statsData = await statsRes.json();
    console.log("Stats status:", statsRes.status);
    console.log("Stats response:", JSON.stringify(statsData, null, 2));

    if (!statsRes.ok) {
      throw new Error("Stats failed");
    }

    console.log("\n✅ Smoke test completed successfully.");
  } catch (err) {
    console.error("\n❌ Smoke test failed:", err.message);
    process.exitCode = 1;
  }
}

run();

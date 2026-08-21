import axios from "axios";

const BASE_URL = "http://localhost:8000";

async function runTests() {
    console.log("==================================================");
    console.log("  Running JobHive Enterprise Verification Tests   ");
    console.log("==================================================");

    let passed = 0;
    let failed = 0;

    // Test 1: Health & Readiness
    try {
        const res = await axios.get(`${BASE_URL}/healthz`);
        if (res.status === 200 && res.data.status === "ok") {
            console.log("✅ [1/7] Health endpoint (/healthz) - PASSED");
            passed++;
        } else {
            console.log("❌ [1/7] Health endpoint - FAILED");
            failed++;
        }
    } catch (e) {
        console.log("❌ [1/7] Health endpoint - FAILED:", e.message);
        failed++;
    }

    // Test 2: Correlation ID Header Check
    try {
        const res = await axios.get(`${BASE_URL}/readyz`);
        if (res.headers["x-correlation-id"]) {
            console.log(`✅ [2/7] Distributed Tracing (X-Correlation-ID: ${res.headers["x-correlation-id"]}) - PASSED`);
            passed++;
        } else {
            console.log("❌ [2/7] Correlation ID Header missing - FAILED");
            failed++;
        }
    } catch (e) {
        console.log("❌ [2/7] Correlation ID check - FAILED:", e.message);
        failed++;
    }

    // Test 3: Zod Validation on Invalid Registration Payload (Expect 422)
    try {
        await axios.post(`${BASE_URL}/api/v1/user/register`, {
            fullname: "A", // too short
            email: "invalid-email-format",
            phoneNumber: "123",
            password: "123", // too short
            role: "superadmin" // invalid role
        });
        console.log("❌ [3/7] Zod Validation (accepted invalid payload) - FAILED");
        failed++;
    } catch (e) {
        if (e.response && e.response.status === 422 && Array.isArray(e.response.data.errors)) {
            console.log(`✅ [3/7] Zod Schema Validation (Returned 422 with ${e.response.data.errors.length} structured field errors) - PASSED`);
            passed++;
        } else {
            console.log("❌ [3/7] Zod Validation (Did not return 422):", e.response?.status, e.response?.data);
            failed++;
        }
    }

    // Test 4: Zod Validation on Job Posting (Expect 422 on missing required fields)
    try {
        await axios.post(`${BASE_URL}/api/v1/job/post`, {
            title: "Test Job",
            // missing description, salary, location, jobType
        });
        console.log("❌ [4/7] Zod Job Post Validation - FAILED");
        failed++;
    } catch (e) {
        if (e.response && (e.response.status === 422 || e.response.status === 401)) {
            console.log("✅ [4/7] Zod Job Schema Validation / Auth Check - PASSED");
            passed++;
        } else {
            console.log("❌ [4/7] Job Post Validation - FAILED:", e.response?.status);
            failed++;
        }
    }

    // Test 5: Authentication & Dual-Token Refresh Endpoint (Invalid refresh token rejection)
    try {
        await axios.post(`${BASE_URL}/api/v1/user/refresh-token`, {
            refreshToken: "fake_expired_jwt_token"
        });
        console.log("❌ [5/7] Refresh Token Rejection - FAILED");
        failed++;
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log("✅ [5/7] Refresh Token Security Guard (Properly rejected invalid token with 401) - PASSED");
            passed++;
        } else {
            console.log("❌ [5/7] Refresh Token Guard - FAILED:", e.response?.status);
            failed++;
        }
    }

    // Test 6: Strict RBAC Route Protection (Accessing recruiter route unauthenticated)
    try {
        await axios.get(`${BASE_URL}/api/v1/job/getadminjobs`);
        console.log("❌ [6/7] RBAC Route Protection - FAILED");
        failed++;
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log("✅ [6/7] RBAC Route Guard (Unauthorized access blocked with 401) - PASSED");
            passed++;
        } else {
            console.log("❌ [6/7] RBAC Guard - FAILED:", e.response?.status);
            failed++;
        }
    }

    // Test 7: NoSQL Injection Sanitization Verification
    try {
        const res = await axios.post(`${BASE_URL}/api/v1/user/login`, {
            email: { "$gt": "" },
            password: "password",
            role: "student"
        });
        console.log("❌ [7/7] NoSQL Injection Sanitization - FAILED");
        failed++;
    } catch (e) {
        // Zod validation or mongoSanitize will reject the object or strip $gt
        if (e.response && (e.response.status === 422 || e.response.status === 400)) {
            console.log("✅ [7/7] NoSQL Injection Defense (Sanitized & rejected payload) - PASSED");
            passed++;
        } else {
            console.log("❌ [7/7] NoSQL Injection Defense - FAILED:", e.response?.status);
            failed++;
        }
    }

    console.log("==================================================");
    console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");
}

runTests();

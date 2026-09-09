package tests;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import kotlinx.serialization.DeserializationStrategy;
import kotlinx.serialization.SerializationException;
import kotlinx.serialization.SerializationStrategy;
import kotlinx.serialization.json.Json;
import kotlinx.serialization.json.JsonBuilder;
import kotlinx.serialization.json.JsonKt;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;
import network.MobileChallengeSubmission;
import network.MobileSubmissionResponse;

public class SerializationChallengeRunner {

    private static int passedTests = 0;
    private static int failedTests = 0;
    private static final List<String> failureMessages = new ArrayList<>();

    private static void assertTrue(boolean condition, String message) {
        if (condition) {
            passedTests++;
            System.out.println("  [PASS] " + message);
        } else {
            failedTests++;
            String err = "  [FAIL] " + message;
            System.err.println(err);
            failureMessages.add(err);
        }
    }

    private static void assertEquals(Object expected, Object actual, String message) {
        boolean match = (expected == null && actual == null) || (expected != null && expected.equals(actual));
        if (match) {
            passedTests++;
            System.out.println("  [PASS] " + message + " (Value: " + actual + ")");
        } else {
            failedTests++;
            String err = "  [FAIL] " + message + " -> Expected: <" + expected + ">, Got: <" + actual + ">";
            System.err.println(err);
            failureMessages.add(err);
        }
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("EMPIRICAL SERIALIZATION CHALLENGE TEST SUITE: network/Models.kt");
        System.out.println("================================================================================");

        try {
            // 1. Obtain Kotlinx serializers via reflection to bridge synthetic dollar signs
            Class<?> subSerializerClass = Class.forName("network.MobileChallengeSubmission$$serializer");
            Object subSerializerObj = subSerializerClass.getField("INSTANCE").get(null);
            SerializationStrategy<MobileChallengeSubmission> subSerializer = 
                (SerializationStrategy<MobileChallengeSubmission>) subSerializerObj;
            DeserializationStrategy<MobileChallengeSubmission> subDeserializer = 
                (DeserializationStrategy<MobileChallengeSubmission>) subSerializerObj;

            Class<?> respSerializerClass = Class.forName("network.MobileSubmissionResponse$$serializer");
            Object respSerializerObj = respSerializerClass.getField("INSTANCE").get(null);
            SerializationStrategy<MobileSubmissionResponse> respSerializer = 
                (SerializationStrategy<MobileSubmissionResponse>) respSerializerObj;
            DeserializationStrategy<MobileSubmissionResponse> respDeserializer = 
                (DeserializationStrategy<MobileSubmissionResponse>) respSerializerObj;

            // 2. Configure Json identical to ApiClient.kt: ignoreUnknownKeys = true, isLenient = true
            Function1<JsonBuilder, Unit> apiConfig = builder -> {
                builder.setIgnoreUnknownKeys(true);
                builder.setLenient(true);
                return Unit.INSTANCE;
            };
            Json apiJson = JsonKt.Json(Json.Default, apiConfig);

            // Strict Json for contrast testing
            Json strictJson = Json.Default;

            System.out.println("\n--- TIER 1: MobileChallengeSubmission Serialization & Deserialization ---");

            // Test 1.1: Nominal full submission
            {
                String json = "{"
                    + "\"title\":\"Water Shortage in Ward 12\","
                    + "\"description\":\"The main pipeline broke three days ago causing severe shortage.\","
                    + "\"district\":\"Ranchi\","
                    + "\"location\":\"23.3441° N, 85.3096° E, Ranchi Urban Block\","
                    + "\"domain\":\"Water Management\","
                    + "\"evidenceUrl\":\"https://storage.jharkhand.gov.in/evidence/water_pipe.jpg\","
                    + "\"reporterId\":\"usr_ranchi_001\","
                    + "\"urgency\":\"HIGH\","
                    + "\"track\":\"TRACK_C_CIVIC\""
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, json);
                assertEquals("Water Shortage in Ward 12", sub.getTitle(), "Nominal: title matches");
                assertEquals("The main pipeline broke three days ago causing severe shortage.", sub.getDescription(), "Nominal: description matches");
                assertEquals("Ranchi", sub.getDistrict(), "Nominal: district matches");
                assertEquals("23.3441° N, 85.3096° E, Ranchi Urban Block", sub.getLocation(), "Nominal: location matches");
                assertEquals("Water Management", sub.getDomain(), "Nominal: domain matches");
                assertEquals("https://storage.jharkhand.gov.in/evidence/water_pipe.jpg", sub.getEvidenceUrl(), "Nominal: evidenceUrl matches");
                assertEquals("usr_ranchi_001", sub.getReporterId(), "Nominal: reporterId matches");
                assertEquals("HIGH", sub.getUrgency(), "Nominal: urgency matches");
                assertEquals("TRACK_C_CIVIC", sub.getTrack(), "Nominal: track matches");

                // Verify re-serialization
                String reEncoded = apiJson.encodeToString(subSerializer, sub);
                assertTrue(reEncoded.contains("Water Shortage in Ward 12"), "Nominal: re-serialized JSON contains title");
            }

            // Test 1.2: Missing optional fields (domain, evidenceUrl, reporterId, track) -> verify defaults
            {
                String minimalJson = "{"
                    + "\"title\":\"Road pothole on NH-33\","
                    + "\"description\":\"Massive pothole causing recurring accidents near toll.\","
                    + "\"district\":\"Dhanbad\","
                    + "\"location\":\"23.7957° N, 86.4304° E\""
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, minimalJson);
                assertEquals("Road pothole on NH-33", sub.getTitle(), "Minimal: title matches");
                assertEquals("Dhanbad", sub.getDistrict(), "Minimal: district matches");
                assertEquals(null, sub.getDomain(), "Minimal: domain defaults to null");
                assertEquals(null, sub.getEvidenceUrl(), "Minimal: evidenceUrl defaults to null");
                assertEquals(null, sub.getReporterId(), "Minimal: reporterId defaults to null");
                assertEquals("MEDIUM", sub.getUrgency(), "Minimal: urgency defaults to 'MEDIUM'");
                assertEquals(null, sub.getTrack(), "Minimal: track defaults to null");
            }

            // Test 1.3: Explicit null values for nullable/optional fields
            {
                String nullFieldsJson = "{"
                    + "\"title\":\"Electricity Transformer Blown\","
                    + "\"description\":\"Transformer exploded during heavy thunderstorms.\","
                    + "\"district\":\"Bokaro\","
                    + "\"location\":\"23.6693° N, 86.1511° E\","
                    + "\"domain\":null,"
                    + "\"evidenceUrl\":null,"
                    + "\"reporterId\":null,"
                    + "\"urgency\":null,"
                    + "\"track\":null"
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, nullFieldsJson);
                assertEquals(null, sub.getDomain(), "Null fields: domain is null");
                assertEquals(null, sub.getEvidenceUrl(), "Null fields: evidenceUrl is null");
                assertEquals(null, sub.getReporterId(), "Null fields: reporterId is null");
                assertEquals(null, sub.getUrgency(), "Null fields: urgency is null");
                assertEquals(null, sub.getTrack(), "Null fields: track is null");
            }

            // Test 1.4: Missing required fields should throw SerializationException
            {
                String missingTitleJson = "{"
                    + "\"description\":\"Missing title field payload test\","
                    + "\"district\":\"Gumla\","
                    + "\"location\":\"23.04° N, 84.54° E\""
                    + "}";

                boolean caught = false;
                try {
                    apiJson.decodeFromString(subDeserializer, missingTitleJson);
                } catch (SerializationException ex) {
                    caught = true;
                }
                assertTrue(caught, "Missing required 'title' correctly throws SerializationException");

                String missingLocationJson = "{"
                    + "\"title\":\"Bridge Damaged\","
                    + "\"description\":\"Missing location field payload test\","
                    + "\"district\":\"Gumla\""
                    + "}";

                caught = false;
                try {
                    apiJson.decodeFromString(subDeserializer, missingLocationJson);
                } catch (SerializationException ex) {
                    caught = true;
                }
                assertTrue(caught, "Missing required 'location' correctly throws SerializationException");
            }

            // Test 1.5: Null value for required non-nullable field should throw SerializationException
            {
                String nullTitleJson = "{"
                    + "\"title\":null,"
                    + "\"description\":\"Null title field payload test\","
                    + "\"district\":\"Gumla\","
                    + "\"location\":\"23.04° N, 84.54° E\""
                    + "}";

                boolean caught = false;
                try {
                    apiJson.decodeFromString(subDeserializer, nullTitleJson);
                } catch (SerializationException ex) {
                    caught = true;
                }
                assertTrue(caught, "Null value for non-nullable 'title' correctly throws SerializationException");
            }

            // Test 1.6: Hindi / Devanagari Unicode script support
            {
                String hindiTitle = "रांची में पेयजल आपूर्ति पाइपलाइन में भारी लीकेज";
                String hindiDesc = "मेन रोड के पास पाइपलाइन फटने से सड़क पर पानी भर गया है और सैकड़ों घरों में पानी नहीं आ रहा। कृपया शीघ्र मरम्मत करवाएं।";
                String hindiDistrict = "राँची (Ranchi)";
                String unicodeLocation = "23.3441° N, 85.3096° E, अल्बर्ट एक्का चौक, राँची";
                String hindiMedia = "https://storage.jharkhand.gov.in/evidence/जल_समस्या_📸_2026.jpg";

                String hindiJson = "{"
                    + "\"title\":\"" + escapeJson(hindiTitle) + "\","
                    + "\"description\":\"" + escapeJson(hindiDesc) + "\","
                    + "\"district\":\"" + escapeJson(hindiDistrict) + "\","
                    + "\"location\":\"" + escapeJson(unicodeLocation) + "\","
                    + "\"evidenceUrl\":\"" + escapeJson(hindiMedia) + "\""
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, hindiJson);
                assertEquals(hindiTitle, sub.getTitle(), "Unicode: Hindi title preserved verbatim");
                assertEquals(hindiDesc, sub.getDescription(), "Unicode: Hindi description preserved verbatim");
                assertEquals(hindiDistrict, sub.getDistrict(), "Unicode: Hindi district preserved verbatim");
                assertEquals(unicodeLocation, sub.getLocation(), "Unicode: Hindi location preserved verbatim");
                assertEquals(hindiMedia, sub.getEvidenceUrl(), "Unicode: Hindi/emoji evidenceUrl preserved verbatim");
            }

            // Test 1.7: Long Media URLs (4,500+ chars)
            {
                StringBuilder sb = new StringBuilder("https://storage.jharkhand.gov.in/evidence/uploads/2026/09/08/camera_raw_data_");
                for (int i = 0; i < 3500; i++) sb.append('x');
                sb.append(".png?signature=");
                for (int i = 0; i < 500; i++) sb.append("token123");
                String longUrl = sb.toString();

                String longUrlJson = "{"
                    + "\"title\":\"Massive Silt Accumulation\","
                    + "\"description\":\"Canal blocked for 2 kilometers causing flood risk.\","
                    + "\"district\":\"Hazaribagh\","
                    + "\"location\":\"23.99° N, 85.36° E\","
                    + "\"evidenceUrl\":\"" + longUrl + "\""
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, longUrlJson);
                assertEquals(longUrl, sub.getEvidenceUrl(), "Long URL: 4,000+ char URL deserialized completely");
                assertEquals(longUrl.length(), sub.getEvidenceUrl().length(), "Long URL: exact length preserved");
            }

            // Test 1.8: Complex multiline, quotes, tabs, and escape sequences
            {
                String multilineDesc = "Line 1: Problem started Monday.\nLine 2: Contractor said \"Waiting for funds\".\nLine 3: Special: \t tab, \\ backslash, and 'single quotes'.";
                String json = "{"
                    + "\"title\":\"Contractor Dispute \\\"Escalated\\\"\","
                    + "\"description\":\"" + escapeJson(multilineDesc) + "\","
                    + "\"district\":\"East Singhbhum\","
                    + "\"location\":\"22.8046° N, 86.2029° E\""
                    + "}";

                MobileChallengeSubmission sub = apiJson.decodeFromString(subDeserializer, json);
                assertEquals("Contractor Dispute \"Escalated\"", sub.getTitle(), "Multiline/Quotes: Escaped quotes in title decoded properly");
                assertEquals(multilineDesc, sub.getDescription(), "Multiline/Quotes: Multiline description decoded properly");
            }

            System.out.println("\n--- TIER 2: MobileSubmissionResponse Serialization & Deserialization ---");

            // Test 2.1: Full nominal backend response
            {
                String backendJson = "{"
                    + "\"success\":true,"
                    + "\"trackingId\":\"IN-JH-2026-8942\","
                    + "\"challengeId\":\"clv789abc12345678\","
                    + "\"track\":\"TRACK_A_INNOVATION\","
                    + "\"trackRouting\":\"BIT Mesra Ranchi\","
                    + "\"status\":\"REPORTED\""
                    + "}";

                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, backendJson);
                assertTrue(resp.getSuccess(), "Response Nominal: success is true");
                assertEquals("IN-JH-2026-8942", resp.getTrackingId(), "Response Nominal: trackingId matches");
                assertEquals("clv789abc12345678", resp.getChallengeId(), "Response Nominal: challengeId matches");
                assertEquals("TRACK_A_INNOVATION", resp.getTrack(), "Response Nominal: track matches");
                assertEquals("BIT Mesra Ranchi", resp.getTrackRouting(), "Response Nominal: trackRouting matches");
                assertEquals("REPORTED", resp.getStatus(), "Response Nominal: status matches");
                assertEquals(null, resp.getError(), "Response Nominal: error is null");
            }

            // Test 2.2: Empty JSON object {} returns default values without error
            {
                String emptyJson = "{}";
                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, emptyJson);
                assertEquals(false, resp.getSuccess(), "Empty JSON: success defaults to false");
                assertEquals(null, resp.getTrackingId(), "Empty JSON: trackingId defaults to null");
                assertEquals(null, resp.getChallengeId(), "Empty JSON: challengeId defaults to null");
                assertEquals(null, resp.getTrack(), "Empty JSON: track defaults to null");
                assertEquals(null, resp.getTrackRouting(), "Empty JSON: trackRouting defaults to null");
                assertEquals(null, resp.getStatus(), "Empty JSON: status defaults to null");
                assertEquals(null, resp.getError(), "Empty JSON: error defaults to null");
            }

            // Test 2.3: Null trackRouting (Civic/Standard track scenario)
            {
                String nullRoutingJson = "{"
                    + "\"success\":true,"
                    + "\"trackingId\":\"IN-JH-2026-4412\","
                    + "\"challengeId\":\"clv999xyz\","
                    + "\"track\":\"TRACK_C_CIVIC\","
                    + "\"trackRouting\":null,"
                    + "\"status\":\"REPORTED\""
                    + "}";

                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, nullRoutingJson);
                assertTrue(resp.getSuccess(), "Null Routing: success is true");
                assertEquals("IN-JH-2026-4412", resp.getTrackingId(), "Null Routing: trackingId matches");
                assertEquals("TRACK_C_CIVIC", resp.getTrack(), "Null Routing: track matches");
                assertEquals(null, resp.getTrackRouting(), "Null Routing: trackRouting is null");
            }

            // Test 2.4: Backend error response with unexpected extra field 'details'
            {
                String errorPayload = "{"
                    + "\"error\":\"Invalid data\","
                    + "\"details\":[{"
                    + "\"code\":\"too_small\","
                    + "\"minimum\":5,"
                    + "\"type\":\"string\","
                    + "\"message\":\"String must contain at least 5 character(s)\","
                    + "\"path\":[\"title\"]"
                    + "}]"
                    + "}";

                // Under ApiClient's ignoreUnknownKeys = true, this must deserialize cleanly
                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, errorPayload);
                assertEquals(false, resp.getSuccess(), "Backend Error: success defaults to false");
                assertEquals("Invalid data", resp.getError(), "Backend Error: error message parsed cleanly");
                assertEquals(null, resp.getTrackingId(), "Backend Error: trackingId is null");

                // Contrast: strict Json must throw SerializationException because of 'details'
                boolean caughtInStrict = false;
                try {
                    strictJson.decodeFromString(respDeserializer, errorPayload);
                } catch (SerializationException ex) {
                    caughtInStrict = true;
                }
                assertTrue(caughtInStrict, "Strict Json rejects unknown field 'details' (ApiClient's ignoreUnknownKeys=true correctly safeguards mobile client)");
            }

            // Test 2.5: Lenient string-to-boolean deserialization
            {
                String lenientJson = "{"
                    + "\"success\":\"true\","
                    + "\"trackingId\":\"IN-JH-2026-7788\","
                    + "\"status\":\"REPORTED\""
                    + "}";

                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, lenientJson);
                assertTrue(resp.getSuccess(), "Lenient Json: string \"true\" parsed to boolean true");
                assertEquals("IN-JH-2026-7788", resp.getTrackingId(), "Lenient Json: trackingId matches");
            }

            // Test 2.6: Bloated JSON with nested unrecognized metadata
            {
                String bloatedJson = "{"
                    + "\"success\":true,"
                    + "\"trackingId\":\"IN-JH-2026-9001\","
                    + "\"challengeId\":\"cuid_bloated_1\","
                    + "\"diagnostics\":{"
                    + "\"clusterId\":\"ap-south-1a\","
                    + "\"latencyMs\":34.8,"
                    + "\"tags\":[\"prod\",\"kmp\",\"jharkhand\"]"
                    + "},"
                    + "\"timestamp\":1725800000000,"
                    + "\"unrecognizedDeepObject\":{\"nested\":{\"level\":4}}"
                    + "}";

                MobileSubmissionResponse resp = apiJson.decodeFromString(respDeserializer, bloatedJson);
                assertTrue(resp.getSuccess(), "Bloated JSON: success is true");
                assertEquals("IN-JH-2026-9001", resp.getTrackingId(), "Bloated JSON: trackingId parsed despite arbitrary metadata");
                assertEquals("cuid_bloated_1", resp.getChallengeId(), "Bloated JSON: challengeId parsed");
            }

        } catch (Exception e) {
            e.printStackTrace();
            failedTests++;
            failureMessages.add("Unexpected exception: " + e.getMessage());
        }

        System.out.println("\n================================================================================");
        System.out.println("TEST SUMMARY: " + passedTests + " PASSED, " + failedTests + " FAILED");
        System.out.println("================================================================================");

        if (failedTests > 0) {
            System.err.println("FAILURES ENCOUNTERED:");
            for (String msg : failureMessages) {
                System.err.println(msg);
            }
            System.exit(1);
        } else {
            System.out.println("ALL EMPIRICAL SERIALIZATION CONTRACT TESTS PASSED SUCCESSFULLY!");
            System.exit(0);
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }
}

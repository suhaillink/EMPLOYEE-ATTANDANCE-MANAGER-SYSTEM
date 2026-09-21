// package com.examly.springapp;

// import com.examly.springapp.model.Employee;
// import com.examly.springapp.model.Attendance;
// import com.examly.springapp.repository.EmployeeRepository;
// import com.examly.springapp.repository.AttendanceRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.TestMethodOrder;
// import org.junit.jupiter.api.MethodOrderer;
// import org.junit.jupiter.api.Order;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.web.client.TestRestTemplate;
// import org.springframework.boot.test.web.server.LocalServerPort;
// import org.springframework.http.HttpEntity;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpMethod;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.test.annotation.DirtiesContext;

// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// import static org.junit.jupiter.api.Assertions.*;

// @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
// @DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
// public class AttendanceManagementIntegrationTest {

//     @LocalServerPort
//     private int port;

//     @Autowired
//     private TestRestTemplate restTemplate;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @Autowired
//     private EmployeeRepository employeeRepository;

//     @Autowired
//     private AttendanceRepository attendanceRepository;

//     private Employee testEmployee1;
//     private Employee testEmployee2;
//     private String baseUrl;

//     @BeforeEach
//     void setUp() {
//         baseUrl = "http://localhost:" + port;
        
//         // Clean up database before each test
//         attendanceRepository.deleteAll();
//         employeeRepository.deleteAll();

//         // Create test employees
//         testEmployee1 = new Employee();
//         testEmployee1.setEmployeeId("EMP001");
//         testEmployee1.setName("John Doe");
//         testEmployee1.setEmail("john.doe@company.com");
//         testEmployee1.setDepartment("Engineering");
//         testEmployee1.setPosition("Software Developer");
//         testEmployee1.setJoiningDate(LocalDate.of(2023, 1, 15));

//         testEmployee2 = new Employee();
//         testEmployee2.setEmployeeId("EMP002");
//         testEmployee2.setName("Jane Smith");
//         testEmployee2.setEmail("jane.smith@company.com");
//         testEmployee2.setDepartment("HR");
//         testEmployee2.setPosition("HR Manager");
//         testEmployee2.setJoiningDate(LocalDate.of(2022, 6, 10));
//     }

//     private HttpHeaders createHeaders() {
//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_JSON);
//         return headers;
//     }

//     @Test
//     @Order(1)
//     public void testCreateEmployee_Success() {
//         HttpEntity<Employee> request = new HttpEntity<>(testEmployee1, createHeaders());
        
//         ResponseEntity<Employee> response = restTemplate.postForEntity(
//             baseUrl + "/api/employees", request, Employee.class);

//         assertEquals(HttpStatus.CREATED, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("EMP001", response.getBody().getEmployeeId());
//         assertEquals("John Doe", response.getBody().getName());
//         assertEquals("john.doe@company.com", response.getBody().getEmail());
//         assertEquals("Engineering", response.getBody().getDepartment());
//         assertEquals("Software Developer", response.getBody().getPosition());
//     }

//     @Test
//     @Order(2)
//     public void testCreateEmployee_DuplicateEmployeeId() {
//         // First create an employee
//         employeeRepository.save(testEmployee1);

//         // Try to create another employee with same ID
//         Employee duplicateEmployee = new Employee();
//         duplicateEmployee.setEmployeeId("EMP001");
//         duplicateEmployee.setName("Another Person");
//         duplicateEmployee.setEmail("another@company.com");
//         duplicateEmployee.setDepartment("Marketing");
//         duplicateEmployee.setPosition("Marketing Manager");
//         duplicateEmployee.setJoiningDate(LocalDate.now());

//         HttpEntity<Employee> request = new HttpEntity<>(duplicateEmployee, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/employees", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Employee ID must be unique", response.getBody().get("message"));
//     }

//     @Test
//     @Order(3)
//     public void testCreateEmployee_DuplicateEmail() {
//         // First create an employee
//         employeeRepository.save(testEmployee1);

//         // Try to create another employee with same email
//         Employee duplicateEmailEmployee = new Employee();
//         duplicateEmailEmployee.setEmployeeId("EMP003");
//         duplicateEmailEmployee.setName("Another Person");
//         duplicateEmailEmployee.setEmail("john.doe@company.com");
//         duplicateEmailEmployee.setDepartment("Marketing");
//         duplicateEmailEmployee.setPosition("Marketing Manager");
//         duplicateEmailEmployee.setJoiningDate(LocalDate.now());

//         HttpEntity<Employee> request = new HttpEntity<>(duplicateEmailEmployee, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/employees", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Email address already in use", response.getBody().get("message"));
//     }

//     @Test
//     @Order(4)
//     public void testCreateEmployee_InvalidEmployeeIdFormat() {
//         Employee invalidEmployee = new Employee();
//         invalidEmployee.setEmployeeId("INVALID123");
//         invalidEmployee.setName("Test User");
//         invalidEmployee.setEmail("test@company.com");
//         invalidEmployee.setDepartment("IT");
//         invalidEmployee.setPosition("Developer");
//         invalidEmployee.setJoiningDate(LocalDate.now());

//         HttpEntity<Employee> request = new HttpEntity<>(invalidEmployee, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/employees", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Employee ID must follow format 'EMP' followed by 3 digits", response.getBody().get("message"));
//     }

//     @Test
//     @Order(5)
//     public void testCreateEmployee_InvalidEmail() {
//         Employee invalidEmailEmployee = new Employee();
//         invalidEmailEmployee.setEmployeeId("EMP004");
//         invalidEmailEmployee.setName("Test User");
//         invalidEmailEmployee.setEmail("invalid-email");
//         invalidEmailEmployee.setDepartment("IT");
//         invalidEmailEmployee.setPosition("Developer");
//         invalidEmailEmployee.setJoiningDate(LocalDate.now());

//         HttpEntity<Employee> request = new HttpEntity<>(invalidEmailEmployee, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/employees", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Must be a valid email", response.getBody().get("message"));
//     }

//     @Test
//     @Order(6)
//     public void testGetAllEmployees_Success() {
//         employeeRepository.save(testEmployee1);
//         employeeRepository.save(testEmployee2);

//         ResponseEntity<List> response = restTemplate.getForEntity(
//             baseUrl + "/api/employees", List.class);

//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals(2, response.getBody().size());
//     }

//     @Test
//     @Order(7)
//     public void testGetEmployeesByDepartment_Success() {
//         employeeRepository.save(testEmployee1);
//         employeeRepository.save(testEmployee2);

//         ResponseEntity<List> response = restTemplate.getForEntity(
//             baseUrl + "/api/employees?department=Engineering", List.class);

//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals(1, response.getBody().size());
//     }

//     @Test
//     @Order(8)
//     public void testGetEmployeeByEmployeeId_Success() {
//         employeeRepository.save(testEmployee1);

//         ResponseEntity<Employee> response = restTemplate.getForEntity(
//             baseUrl + "/api/employees/EMP001", Employee.class);

//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("EMP001", response.getBody().getEmployeeId());
//         assertEquals("John Doe", response.getBody().getName());
//     }

//     @Test
//     @Order(9)
//     public void testGetEmployeeByEmployeeId_NotFound() {
//         ResponseEntity<Map> response = restTemplate.getForEntity(
//             baseUrl + "/api/employees/EMP999", Map.class);

//         assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Employee not found", response.getBody().get("message"));
//     }

//     @Test
//     @Order(10)
//     public void testCheckIn_Success() {
//         employeeRepository.save(testEmployee1);

//         Map<String, Object> checkInRequest = new HashMap<>();
//         checkInRequest.put("employeeId", "EMP001");
//         checkInRequest.put("checkInTime", "2024-01-15T09:00:00");

//         HttpEntity<Map<String, Object>> request = new HttpEntity<>(checkInRequest, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/attendance/check-in", request, Map.class);

//         assertEquals(HttpStatus.CREATED, response.getStatusCode());
//         assertNotNull(response.getBody());
        
//         Map<String, Object> employee = (Map<String, Object>) response.getBody().get("employee");
//         assertEquals("EMP001", employee.get("employeeId"));
//         assertEquals("Present", response.getBody().get("status"));
//         assertEquals(0.0, response.getBody().get("workHours"));
//     }

//     @Test
//     @Order(11)
//     public void testCheckIn_EmployeeNotFound() {
//         Map<String, Object> checkInRequest = new HashMap<>();
//         checkInRequest.put("employeeId", "EMP999");
//         checkInRequest.put("checkInTime", "2024-01-15T09:00:00");

//         HttpEntity<Map<String, Object>> request = new HttpEntity<>(checkInRequest, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/attendance/check-in", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Employee not found", response.getBody().get("message"));
//     }

//     @Test
//     @Order(12)
//     public void testCheckIn_AlreadyCheckedIn() {
//         Employee savedEmployee = employeeRepository.save(testEmployee1);
        
//         // Create existing attendance record
//         Attendance existingAttendance = new Attendance();
//         existingAttendance.setEmployee(savedEmployee);
//         existingAttendance.setDate(LocalDate.of(2024, 1, 15));
//         existingAttendance.setCheckInTime(LocalDateTime.of(2024, 1, 15, 8, 30));
//         existingAttendance.setStatus("Present");
//         existingAttendance.setWorkHours(0.0);
//         attendanceRepository.save(existingAttendance);

//         Map<String, Object> checkInRequest = new HashMap<>();
//         checkInRequest.put("employeeId", "EMP001");
//         checkInRequest.put("checkInTime", "2024-01-15T09:00:00");

//         HttpEntity<Map<String, Object>> request = new HttpEntity<>(checkInRequest, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.postForEntity(
//             baseUrl + "/api/attendance/check-in", request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Already checked in today", response.getBody().get("message"));
//     }

//     @Test
//     @Order(13)
//     public void testCheckOut_Success() {
//         Employee savedEmployee = employeeRepository.save(testEmployee1);
        
//         // Create existing attendance record
//         Attendance existingAttendance = new Attendance();
//         existingAttendance.setEmployee(savedEmployee);
//         existingAttendance.setDate(LocalDate.of(2024, 1, 15));
//         existingAttendance.setCheckInTime(LocalDateTime.of(2024, 1, 15, 9, 0));
//         existingAttendance.setStatus("Present");
//         existingAttendance.setWorkHours(0.0);
//         attendanceRepository.save(existingAttendance);

//         Map<String, Object> checkOutRequest = new HashMap<>();
//         checkOutRequest.put("employeeId", "EMP001");
//         checkOutRequest.put("checkOutTime", "2024-01-15T17:30:00");

//         HttpEntity<Map<String, Object>> request = new HttpEntity<>(checkOutRequest, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.exchange(
//             baseUrl + "/api/attendance/check-out", HttpMethod.PUT, request, Map.class);

//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertNotNull(response.getBody());
        
//         Map<String, Object> employee = (Map<String, Object>) response.getBody().get("employee");
//         assertEquals("EMP001", employee.get("employeeId"));
//         assertEquals("Present", response.getBody().get("status"));
//         assertEquals(8.5, response.getBody().get("workHours"));
//     }

//     @Test
//     @Order(14)
//     public void testCheckOut_NotCheckedIn() {
//         employeeRepository.save(testEmployee1);

//         Map<String, Object> checkOutRequest = new HashMap<>();
//         checkOutRequest.put("employeeId", "EMP001");
//         checkOutRequest.put("checkOutTime", "2024-01-15T17:30:00");

//         HttpEntity<Map<String, Object>> request = new HttpEntity<>(checkOutRequest, createHeaders());
        
//         ResponseEntity<Map> response = restTemplate.exchange(
//             baseUrl + "/api/attendance/check-out", HttpMethod.PUT, request, Map.class);

//         assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("Must check in before check out", response.getBody().get("message"));
//     }

//     @Test
//     @Order(15)
//     public void testGetMonthlyAttendanceReport_Success() {
//         Employee savedEmployee = employeeRepository.save(testEmployee1);
        
//         // Create multiple attendance records for the month
//         Attendance attendance1 = new Attendance();
//         attendance1.setEmployee(savedEmployee);
//         attendance1.setDate(LocalDate.of(2024, 1, 15));
//         attendance1.setCheckInTime(LocalDateTime.of(2024, 1, 15, 9, 0));
//         attendance1.setCheckOutTime(LocalDateTime.of(2024, 1, 15, 17, 30));
//         attendance1.setStatus("Present");
//         attendance1.setWorkHours(8.5);
//         attendanceRepository.save(attendance1);

//         Attendance attendance2 = new Attendance();
//         attendance2.setEmployee(savedEmployee);
//         attendance2.setDate(LocalDate.of(2024, 1, 16));
//         attendance2.setCheckInTime(LocalDateTime.of(2024, 1, 16, 9, 30));
//         attendance2.setCheckOutTime(LocalDateTime.of(2024, 1, 16, 13, 30));
//         attendance2.setStatus("Half-day");
//         attendance2.setWorkHours(4.0);
//         attendanceRepository.save(attendance2);

//         ResponseEntity<Map> response = restTemplate.getForEntity(
//             baseUrl + "/api/attendance/report?employeeId=EMP001&year=2024&month=1", Map.class);

//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertNotNull(response.getBody());
//         assertEquals("EMP001", response.getBody().get("employeeId"));
//         assertEquals("John Doe", response.getBody().get("employeeName"));
//         assertEquals(2024, response.getBody().get("year"));
//         assertEquals(1, response.getBody().get("month"));
//         assertEquals(2, response.getBody().get("totalWorkDays"));
//         assertEquals(1, response.getBody().get("presentDays"));
//         assertEquals(1, response.getBody().get("halfDays"));
//         assertEquals(12.5, response.getBody().get("totalWorkHours"));
        
//         List<Map<String, Object>> dailyRecords = (List<Map<String, Object>>) response.getBody().get("dailyRecords");
//         assertEquals(2, dailyRecords.size());
//     }
// }
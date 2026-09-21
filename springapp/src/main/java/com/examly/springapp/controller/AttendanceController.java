package com.examly.springapp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.dto.AttendanceReportDto;
import com.examly.springapp.dto.AttendanceRequest;
import com.examly.springapp.entity.Attendance;
import com.examly.springapp.entity.User;
import com.examly.springapp.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    private Map<String, Object> formatAttendanceResponse(Attendance attendance) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", attendance.getId());
        map.put("date", attendance.getDate());
        map.put("checkInTime", attendance.getCheckIn());
        map.put("checkOutTime", attendance.getCheckOut());
        map.put("status", attendance.getStatus());
        map.put("workHours", attendance.getTotalHours() != null ? attendance.getTotalHours() : 0.0);
        map.put("totalHours", attendance.getTotalHours() != null ? attendance.getTotalHours() : 0.0);

        if (attendance.getUser() != null) {
            User user = attendance.getUser();
            Map<String, Object> emp = new HashMap<>();
            emp.put("id", user.getId());
            emp.put("employeeId", user.getEmployeeId());
            emp.put("name", user.getName());
            emp.put("email", user.getEmail());
            emp.put("department", user.getDepartment());
            emp.put("position", user.getPosition());
            emp.put("joiningDate", user.getJoiningDate());
            map.put("employee", emp);
            map.put("user", emp);
        }
        return map;
    }

    @PostMapping("/check-in")
    public ResponseEntity<Map<String, Object>> checkInWithBody(@RequestBody AttendanceRequest request) {
        Attendance attendance = attendanceService.checkIn(request);
        return new ResponseEntity<>(formatAttendanceResponse(attendance), HttpStatus.CREATED);
    }

    @PutMapping("/check-out")
    public ResponseEntity<Map<String, Object>> checkOutWithBody(@RequestBody AttendanceRequest request) {
        Attendance attendance = attendanceService.checkOut(request);
        return ResponseEntity.ok(formatAttendanceResponse(attendance));
    }

    @PostMapping("/checkin/{userId}")
    public ResponseEntity<Attendance> checkIn(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.checkIn(userId));
    }

    @PutMapping("/checkout/{userId}")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.checkOut(userId));
    }

    @GetMapping("/report")
    public ResponseEntity<AttendanceReportDto> getMonthlyAttendanceReport(
            @RequestParam String employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        AttendanceReportDto report = attendanceService.getAttendanceReport(employeeId, year, month);
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok("Attendance deleted successfully");
    }
}
package com.examly.springapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<?> getUserReport(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getUserReport(userId));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAttendanceReport() {
        return ResponseEntity.ok(reportService.getAttendanceReport());
    }

    @GetMapping("/users/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTotalUsers() {
        return ResponseEntity.ok(reportService.getTotalUsers());
    }

    @GetMapping("/attendance/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTotalAttendance() {
        return ResponseEntity.ok(reportService.getTotalAttendance());
    }

}
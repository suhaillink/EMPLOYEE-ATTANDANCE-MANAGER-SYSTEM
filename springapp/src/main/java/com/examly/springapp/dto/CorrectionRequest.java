package com.examly.springapp.dto;

import java.time.LocalDate;

public class CorrectionRequest {

    private Long userId;
    private String employeeId;
    private LocalDate attendanceDate;
    private String date;
    private String requestedCheckIn;
    private String requestedCheckOut;
    private String reason;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getRequestedCheckIn() {
        return requestedCheckIn;
    }

    public void setRequestedCheckIn(String requestedCheckIn) {
        this.requestedCheckIn = requestedCheckIn;
    }

    public String getRequestedCheckOut() {
        return requestedCheckOut;
    }

    public void setRequestedCheckOut(String requestedCheckOut) {
        this.requestedCheckOut = requestedCheckOut;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
package com.examly.springapp.dto;

public class ReportResponse {

    private String employeeName;
    private int totalPresent;
    private int totalAbsent;
    private double totalHours;

    public ReportResponse() {
    }

    public ReportResponse(String employeeName, int totalPresent, int totalAbsent, double totalHours) {
        this.employeeName = employeeName;
        this.totalPresent = totalPresent;
        this.totalAbsent = totalAbsent;
        this.totalHours = totalHours;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public int getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(int totalPresent) {
        this.totalPresent = totalPresent;
    }

    public int getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(int totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(double totalHours) {
        this.totalHours = totalHours;
    }
}
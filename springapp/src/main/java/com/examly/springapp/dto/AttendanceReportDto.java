package com.examly.springapp.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceReportDto {

    private String employeeId;
    private String employeeName;
    private Integer year;
    private Integer month;
    private int totalWorkDays;
    private int presentDays;
    private int halfDays;
    private int absentDays;
    private double totalWorkHours;
    private double averageWorkHours;
    private List<DailyRecordDto> dailyRecords = new ArrayList<>();
}
